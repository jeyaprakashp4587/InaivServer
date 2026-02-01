import Group from "../Models/Group.js";

// Get all groups
export const getAll = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("members", "name email")
      .populate("admin", "name email");
    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get group by ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id)
      .populate("members", "name email")
      .populate("admin", "name email");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create group
export const create = async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update group
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete group
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findByIdAndDelete(id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json({ message: "Group deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
