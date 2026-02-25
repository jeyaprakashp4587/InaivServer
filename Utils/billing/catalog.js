export const FEATURE_MODULES = [
  {
    id: 1,
    key: "competitorAnalysis",
    name: "Competitor Analysis",
    credits: 10,
    description: "AI scans competitor SaaS products",
  },
  {
    id: 2,
    key: "strengthsWeaknesses",
    name: "Strengths & Weaknesses",
    credits: 5,
    description: "Compare your product against key competitors",
  },
  {
    id: 3,
    key: "differentiationStrategy",
    name: "Differentiation Strategy",
    credits: 5,
    description: "Identify product gaps and market opportunities",
  },
  {
    id: 4,
    key: "targetCustomers",
    name: "Target Customers",
    credits: 10,
    description: "Find ideal buyers using AI signals",
  },
  {
    id: 5,
    key: "pitchDeckGeneration",
    name: "Pitch Deck Generation",
    credits: 20,
    description: "Generate an investor-ready strategic deck",
  },
];

export const FEATURE_MODULES_BY_ID = FEATURE_MODULES.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const PLAN_CATALOG = [
  {
    key: "free",
    name: "Free",
    description: "Perfect for trying out",
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyCredits: 50,
    features: [
      "50 credits/month",
      "1 competitor analysis",
      "Basic insights",
      "Email support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    description: "For growing SaaS",
    monthlyPrice: 49,
    yearlyPrice: 470,
    monthlyCredits: 100,
    features: [
      "100 credits/month",
      "Unlimited analyses",
      "Advanced insights",
      "Lead targeting",
      "Pitch deck generation",
      "Priority email support",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    description: "For scaling businesses",
    monthlyPrice: 149,
    yearlyPrice: 1430,
    monthlyCredits: 500,
    features: [
      "500 credits/month",
      "Unlimited everything",
      "AI-powered recommendations",
      "Lead targeting (1000+ leads)",
      "Unlimited pitch decks",
      "24/7 chat support",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    description: "For enterprises",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    monthlyCredits: 1500,
    features: [
      "1500 credits/month",
      "Everything in Premium",
      "Dedicated account manager",
      "Custom API access",
      "White-label options",
      "SLA guarantee",
    ],
  },
];

export const VALID_BILLING_CYCLES = ["monthly", "yearly"];
