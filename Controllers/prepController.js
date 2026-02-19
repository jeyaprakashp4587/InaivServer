import DB1 from "../DB/DB1.js";
import { aiQuestions } from "../utils/GPT AI/Questions.js";

export const getAllPreparations = async (req, res) => {
  try {
    const examsCollections = await DB1.collection("preparations")
      .find({})
      .toArray();
    return res.status(200).json(examsCollections);
  } catch (error) {
    throw new Error("internal server error");
  }
};
export const getPreparationData = async (req, res) => {
  try {
    const data = req.body;
    console.log("data", data);

    // return;
    const response = await aiQuestions(data);
    console.log(response);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
