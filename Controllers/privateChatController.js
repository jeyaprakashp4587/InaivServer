import Chat from "../Models/privateChat.js";

// Get all chats
export const getAll = async (req, res) => {
  try {
    const chats = await Chat.find().populate("participants", "name email");
    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get chat by ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id)
      .populate("participants", "name email")
      .populate("messages.sender", "name email");
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create chat
export const create = async (req, res) => {
  try {
    const chat = await Chat.create(req.body);
    res.status(201).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update chat
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete chat
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findByIdAndDelete(id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json({ message: "Chat deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
