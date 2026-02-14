import mongoose from "mongoose";
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

    const groupId = new mongoose.Types.ObjectId(id);
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const group = await Group.aggregate([
      { $match: { _id: groupId } },
      {
        $addFields: {
          isMember: { $in: [userId, "$members"] },
          isAdmin: { $in: [userId, "$admins"] },
          isPendingApproval: { $in: [userId, "$pendingJoinRequests"] },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "membersInfo",
        },
      },

      {
        $project: {
          name: 1,
          description: 1,
          imageUrl: 1,
          District: 1,
          isVerified: 1,
          isMember: 1,
          isAdmin: 1,
          isPendingApproval: 1,
          members: {
            $cond: {
              if: "$isMember",
              then: {
                $map: {
                  input: "$membersInfo",
                  as: "member",
                  in: {
                    _id: "$$member._id",
                    name: "$$member.name",
                    imgUrl: "$$member.imgUrl",
                  },
                },
              },
              else: [],
            },
          },
        },
      },
    ]);

    if (!group.length) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create group
export const create = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, description, imageUrl, District } = req.body;
    const group = await new Group({
      name: name,
      description: description,
      imageUrl: imageUrl,
      District: District,
      admins: [userId],
    });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// join group
export const joinGroup = async (req, res) => {
  try {
    const { userId } = req.user;
    const { groupId } = req.body;
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $push: { members: userId } },
      { new: true },
    );
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group);
  } catch (error) {
    console.error(error);
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
// get Suggestions groups
export const getSuggestionsGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log("userID", userId);

    const groups = await Group.aggregate([
      { $match: { members: { $ne: userId } } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "MembersInfo",
        },
      },
      {
        $addFields: {
          members: { $slice: ["$MembersInfo", 5] },
          membersCount: { $size: "$members" },
        },
      },
      {
        $project: {
          group: {
            name: "$name",
            description: "$description",
            imageUrl: "$imageUrl",
            District: "$District",
            isVerified: "$isVerified",
          },
          membersCount: 1,
          members: {
            name: 1,
            imgUrl: 1,
          },
        },
      },
    ]);
    if (groups && groups.length > 0) {
      return res.status(200).json(groups);
    } else {
      return res.status(404).json({ message: "No groups found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
