import Freelance from "../Models/Freelance.js";

// Get all freelance jobs
export const getAll = async (req, res) => {
  try {
    const freelances = await Freelance.find().populate("user", "name email");
    res.status(200).json(freelances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get freelance by ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const freelance = await Freelance.findById(id).populate("user", "name email");
    if (!freelance)
      return res.status(404).json({ message: "Freelance job not found" });
    res.status(200).json(freelance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create freelance job
export const create = async (req, res) => {
  try {
    const freelance = await Freelance.create(req.body);
    res.status(201).json(freelance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update freelance job
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const freelance = await Freelance.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!freelance)
      return res.status(404).json({ message: "Freelance job not found" });
    res.status(200).json(freelance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete freelance job
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const freelance = await Freelance.findByIdAndDelete(id);
    if (!freelance)
      return res.status(404).json({ message: "Freelance job not found" });
    res.status(200).json({ message: "Freelance job deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
