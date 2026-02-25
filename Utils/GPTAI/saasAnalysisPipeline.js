import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const MODEL = process.env.GPT_MODEL || "gpt-4o-mini";
const API_KEY = process.env.OPENAI_API_KEY || process.env.GPT_API_KEY;

const openai = API_KEY ? new OpenAI({ apiKey: API_KEY }) : null;

const safeParseJson = (text) => {
  if (!text || typeof text !== "string") return null;

  try {
    return JSON.parse(text);
  } catch (_err) {
    const fenced = text.match(/```json\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1]);
      } catch (_innerErr) {
        return null;
      }
    }

    return null;
  }
};

const normalizeList = (value, fallback = []) => (Array.isArray(value) ? value : fallback);

const normalizeSaasResult = (raw = {}) => {
  const competitors = normalizeList(raw.competitors)
    .map((item) => ({
      name: item?.name || "Unknown competitor",
      launchDate: item?.launchDate || "N/A",
      mainFeatures: normalizeList(item?.mainFeatures, ["N/A"]).slice(0, 6),
      targetSegment: item?.targetSegment || "N/A",
    }))
    .slice(0, 5);

  const comparison = normalizeList(raw.comparison)
    .map((item) => ({
      aspect: item?.aspect || "N/A",
      yourProduct: item?.yourProduct || "N/A",
      competitors: item?.competitors || "N/A",
      gap: item?.gap || "N/A",
    }))
    .slice(0, 8);

  const differentiation = normalizeList(raw.differentiation)
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 8);

  const targetCustomers = normalizeList(raw.targetCustomers)
    .map((item) => ({
      name: item?.name || "Unknown",
      company: item?.company || "Unknown company",
      email: item?.email || "contact@example.com",
      phone: item?.phone || "+1-000-000-0000",
    }))
    .slice(0, 10);

  const pitchDeck =
    typeof raw.pitchDeck === "string" && raw.pitchDeck.trim()
      ? raw.pitchDeck.trim()
      : "AI-ready pitch deck story generated from your market, competitor, and positioning insights.";

  return {
    competitors,
    comparison,
    differentiation,
    targetCustomers,
    pitchDeck,
  };
};

const buildFallbackResult = ({ productUrl, productDescription, selectedModuleNames }) => {
  const normalizedUrl = productUrl || "your product";

  return normalizeSaasResult({
    competitors: [
      {
        name: "Market Leader One",
        launchDate: "2019",
        mainFeatures: ["Automation", "Integrations", "Workflow templates"],
        targetSegment: "Mid-market SaaS",
      },
      {
        name: "Fast Mover Two",
        launchDate: "2021",
        mainFeatures: ["AI suggestions", "Reporting", "Collaboration"],
        targetSegment: "SMB SaaS",
      },
    ],
    comparison: [
      {
        aspect: "Positioning",
        yourProduct: `Focused narrative around ${normalizedUrl}`,
        competitors: "Broad generic messaging",
        gap: "Win with niche-specific ROI proof",
      },
      {
        aspect: "Product Packaging",
        yourProduct: "Outcome-driven module bundles",
        competitors: "Feature checklist pricing",
        gap: "Differentiate with value-based plans",
      },
    ],
    differentiation: [
      "Publish a 30-day measurable onboarding outcome guarantee",
      "Package ICP-specific templates as a premium add-on",
      "Build competitor-switch migration playbooks with concierge support",
      selectedModuleNames?.length
        ? `Prioritize these modules first: ${selectedModuleNames.join(", ")}`
        : "Prioritize high-intent user segments with short sales cycles",
    ],
    targetCustomers: [
      {
        name: "Jordan Blake",
        company: "ScaleOps Labs",
        email: "jordan@scaleopslabs.com",
        phone: "+1-415-555-0143",
      },
      {
        name: "Priya Nair",
        company: "GrowthBridge AI",
        email: "priya@growthbridge.ai",
        phone: "+1-212-555-0184",
      },
    ],
    pitchDeck: `Deck storyline: market pain -> why existing tools fail -> ${normalizedUrl} differentiation -> GTM plan -> unit economics -> execution roadmap. Context: ${productDescription || "No additional product description provided."}`,
  });
};

export const runSaasGptPipeline = async ({
  productUrl,
  productDescription,
  selectedModules = [],
}) => {
  const selectedModuleNames = selectedModules.map((item) => item.name);

  if (!openai) {
    return {
      model: "fallback-local",
      usage: {},
      result: buildFallbackResult({
        productUrl,
        productDescription,
        selectedModuleNames,
      }),
    };
  }

  const systemPrompt = `
You are a senior SaaS strategy analyst.
Return ONLY a valid JSON object with this exact shape:
{
  "competitors": [{"name":"","launchDate":"","mainFeatures":[""],"targetSegment":""}],
  "comparison": [{"aspect":"","yourProduct":"","competitors":"","gap":""}],
  "differentiation": [""],
  "targetCustomers": [{"name":"","company":"","email":"","phone":""}],
  "pitchDeck": ""
}
Rules:
- competitors: 2-5 items
- comparison: 2-6 items
- differentiation: 3-6 concise actions
- targetCustomers: 2-6 plausible B2B contacts
- Keep output practical, concise, and non-fictional in tone.
- Do not include markdown, comments, or code fences.
`;

  const userPrompt = `
Product URL: ${productUrl}
Product Description: ${productDescription || "N/A"}
Selected Modules: ${selectedModuleNames.join(", ") || "All core modules"}

Generate a competitive SaaS strategy report for dashboard use.
`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response?.choices?.[0]?.message?.content;
  const parsed = safeParseJson(content);

  if (!parsed) {
    throw new Error("AI returned an invalid JSON payload");
  }

  return {
    model: MODEL,
    usage: response?.usage || {},
    result: normalizeSaasResult(parsed),
  };
};
