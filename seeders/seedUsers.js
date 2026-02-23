import mongoose from "mongoose";
import User from "../Models/User.js";
import DB1 from "../DB/DB1.js";

const colleges = [
  "Francis Xavier Engineering College",
  "Manonmaniam Sundaranar University",
  "National Engineering College",
  "Sadakathullah Appa College",
  "Einstein College of Engineering",
];

const departments = [
  "Computer Science",
  "Information Technology",
  "Electronics and Communication",
  "Mechanical Engineering",
  "Computer Applications",
];

const names = [
  "Sathish Kumar",
  "Arun Prakash",
  "Karthik Raja",
  "Muthu Selvam",
  "Vigneshwaran",
  "Suresh",
  "Naveen Kumar",
  "Bala Murugan",
  "Rajesh",
  "Hari Prasad",
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateUsers = (count = 100) => {
  const users = [];

  for (let i = 0; i < count; i++) {
    users.push({
      name: getRandom(names),
      uid: `TVL_UID_${i + 1}`,
      FCMtoken: "",
      college: {
        collegeName: getRandom(colleges),
        department: getRandom(departments),
        year: String(Math.floor(Math.random() * 4) + 1),
      },
      imgUrl: "",
      groups: [],
      Connections: [],
    });
  }

  return users;
};

const seedUsers = async () => {
  try {
    console.log("🌱 Seeding users...");

    await User.deleteMany(); // ⚠️ wipes users collection
    const users = generateUsers(200);

    await User.insertMany(users);

    console.log(`✅ ${users.length} users seeded successfully`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedUsers();
