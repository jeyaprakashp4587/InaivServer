import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";
import User from "../Models/User.js";
import Group from "../Models/Group.js";

/* ---------------- GROUP DATA ---------------- */
const GROUPS_DATA = [
  {
    name: "Manonmaniam Sundaranar University",
    description:
      "A major state university in Tirunelveli known for science, arts, and research programs.",
    imageUrl:
      "https://res.cloudinary.com/dv72gyrn1/image/upload/v1770739403/msuniv_logo_hjfgeu.png",
    District: "Tirunelveli",
  },
  {
    name: "Francis Xavier Engineering College",
    description:
      "Well-known engineering college with strong placements and discipline-focused academics.",
    imageUrl:
      "https://res.cloudinary.com/dv72gyrn1/image/upload/v1770664931/be379e4c8e383c3484932401146aae73_dvakeg.png",
    District: "Tirunelveli",
  },
  {
    name: "St. Xavier's College",
    description:
      "Autonomous arts and science college with a long academic reputation in Tamil Nadu.",
    imageUrl: "",
    District: "Tirunelveli",
  },
  {
    name: "Sarah Tucker College",
    description:
      "Historic women's arts and science college known for quality education and academic culture.",
    imageUrl:
      "https://res.cloudinary.com/dv72gyrn1/image/upload/v1770739402/stxavies_re4x4x.png",
    District: "Tirunelveli",
  },
  {
    name: "PSN College of Engineering and Technology",
    description:
      "Engineering institution offering multiple UG and PG programs with industry exposure.",
    imageUrl:
      "https://res.cloudinary.com/dv72gyrn1/image/upload/v1770739401/psn_uyufnp.jpg",
    District: "Tirunelveli",
  },
];

/* ---------------- HELPERS ---------------- */
const NAMES = [
  "Sathish Kumar",
  "Arun Prakash",
  "Karthik Raja",
  "Muthu Selvam",
  "Vigneshwaran",
  "Bala Murugan",
  "Naveen Kumar",
  "Suresh",
  "Hari Prasad",
  "Rajesh",
];

const DEPARTMENTS = ["CSE", "IT", "ECE", "MECH", "EEE"];

const PROFILE_IMAGES = [
  "https://randomuser.me/api/portraits/men/12.jpg",
  "https://randomuser.me/api/portraits/men/33.jpg",
  "https://randomuser.me/api/portraits/men/54.jpg",
  "https://randomuser.me/api/portraits/women/18.jpg",
  "https://randomuser.me/api/portraits/women/41.jpg",
];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  try {
    console.log("🔥 FULL RESET SEED STARTED");

    await User.deleteMany();
    await Group.deleteMany();
    console.log("🧹 Old users & groups wiped");

    /* -------- CREATE GROUPS -------- */
    const createdGroups = await Group.insertMany(
      GROUPS_DATA.map((g) => ({
        ...g,
        members: [],
        admins: [],
        isVerified: false,
      })),
    );

    const groupMap = {};
    createdGroups.forEach((g) => (groupMap[g.name] = g));

    /* -------- CREATE USERS -------- */
    const users = [];

    for (let i = 0; i < 100; i++) {
      const group = random(createdGroups);
      const image = random(PROFILE_IMAGES);

      users.push({
        name: random(NAMES),
        uid: `UID_${i + 1}`,
        number: `9${(100000000 + i).toString()}`,
        imgUrl: image, // ✅ SET IMAGE
        college: {
          collegeName: group.name,
          department: random(DEPARTMENTS),
          year: String((i % 4) + 1),
        },
        groups: [],
        Connections: [],
      });
    }

    const createdUsers = await User.insertMany(users);
    console.log("✅ 100 users created");

    /* -------- ASSIGN MEMBERS + ADMINS -------- */
    createdUsers.forEach((user) => {
      const group = groupMap[user.college.collegeName];
      if (!group) return;

      group.members.push(user._id);
      user.groups.push({ groupId: group._id });
    });

    // ✅ MULTIPLE ADMINS (first 2 per group)
    createdGroups.forEach((group) => {
      group.admins = group.members.slice(0, 2);
    });

    /* -------- FORCE imgUrl persistence -------- */
    createdUsers.forEach((u, i) => {
      u.imgUrl = u.imgUrl || random(PROFILE_IMAGES);
    });

    await Promise.all([
      ...createdGroups.map((g) => g.save()),
      ...createdUsers.map((u) => u.save()),
    ]);

    console.log("✅ Members, admins & images fixed");

    /* -------- CONNECTIONS -------- */
    createdUsers.forEach((user) => {
      const others = createdUsers
        .filter((u) => u._id.toString() !== user._id.toString())
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      others.forEach((o) => user.Connections.push({ connectionId: o._id }));
    });

    await Promise.all(createdUsers.map((u) => u.save()));

    console.log("🎉 FULL SEED COMPLETED");
    process.exit(0);
  } catch (err) {
    console.error("❌ SEED FAILED", err);
    process.exit(1);
  }
};

seed();
