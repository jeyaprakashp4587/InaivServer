import { Notifications } from "../Models/Notification";
import User from "../Models/User";

export const getAllNotification = async (req, res) => {
  try {
    const { userId } = req.user;
    const notifications = await Notifications.aggregate([
      {
        $match: { notificationUser: userId },
      },
      { $skip: 10 },
      { $limit: 10 },
    ]);
  } catch (error) {}
};
