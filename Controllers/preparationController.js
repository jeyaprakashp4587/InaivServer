import DB1 from "../DB/DB1";

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
