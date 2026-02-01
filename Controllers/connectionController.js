import Connection from "../Models/User";

// Get all connections
export const getAll = async (req, res) => {
  try {
    // const connections = await Connection.find()
    //   .populate("user", "name email")
    //   .populate("connectedUser", "name email");
    // res.status(200).json(connections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get connection by ID
export const getById = async (req, res) => {
  try {
    // const { id } = req.params;
    // const connection = await Connection.findById(id)
    //   .populate("user", "name email")
    //   .populate("connectedUser", "name email");
    // if (!connection)
    //   return res.status(404).json({ message: "Connection not found" });
    // res.status(200).json(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create connection
export const create = async (req, res) => {
  try {
    // const connection = await Connection.create(req.body);
    // res.status(201).json(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update connection
export const update = async (req, res) => {
  try {
    // const { id } = req.params;
    // const connection = await Connection.findByIdAndUpdate(id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    // if (!connection)
    //   return res.status(404).json({ message: "Connection not found" });
    // res.status(200).json(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete connection
export const remove = async (req, res) => {
  try {
    // const { id } = req.params;
    // const connection = await Connection.findByIdAndDelete(id);
    // if (!connection)
    //   return res.status(404).json({ message: "Connection not found" });
    // res.status(200).json({ message: "Connection deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
