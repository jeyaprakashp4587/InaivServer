import SellNote from "../Models/SellNote.js";

// Get all sell notes
export const getAll = async (req, res) => {
  try {
    const sellNotes = await SellNote.find().populate("author", "name email");
    res.status(200).json(sellNotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get sell note by ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const sellNote = await SellNote.findById(id).populate("author", "name email");
    if (!sellNote)
      return res.status(404).json({ message: "Sell note not found" });
    res.status(200).json(sellNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create sell note
export const create = async (req, res) => {
  try {
    const sellNote = await SellNote.create(req.body);
    res.status(201).json(sellNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update sell note
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const sellNote = await SellNote.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!sellNote)
      return res.status(404).json({ message: "Sell note not found" });
    res.status(200).json(sellNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete sell note
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const sellNote = await SellNote.findByIdAndDelete(id);
    if (!sellNote)
      return res.status(404).json({ message: "Sell note not found" });
    res.status(200).json({ message: "Sell note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
