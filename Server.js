import express from "express";
import cors from "cors";
import http from "http";
import { connectRedis } from "./Redis/redis.js";
import DB1 from "./DB/DB1.js";
import authRoutes from "./Routes/authroutes.js";
import groupsRoutes from "./Routes/groupsRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import privateChatsRoutes from "./Routes/privateChatsRoutes.js";
// import connectionRoutes from "./Routes/connectionroutes.js";
import sellNotesRoutes from "./Routes/sellNotesRoutes.js";
import groupChatRoutes from "./Routes/gropuChatRoutes.js";
import freelanceRoutes from "./Routes/freelanceRoutes.js";
import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);
//init firebase admin sdk
import initializeFirebaseAdmin from "./Firebase/firebaseAdmin.js";
const admin = initializeFirebaseAdmin();
(async () => {
  try {
    await connectRedis();
  } catch (err) {
    console.warn(
      "Redis connection failed - server will run without cache:",
      err.message,
    );
  }
})();

DB1.on("connected", () => {
  console.log("DB1 is connected");
});
app.get("/get", (req, res) => {
  console.log("server alive");
  res.send("Server is alive");
});
// routes
app.use("/auth", authRoutes);
app.use("/group", groupsRoutes);
app.use("/user", userRoutes);
app.use("/privateChats", privateChatsRoutes);
// app.use("/connection", connectionRoutes);
app.use("/sellNotes", sellNotesRoutes);
app.use("/gropuChat", groupChatRoutes);
app.use("/freelance", freelanceRoutes);
const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Server is listening on port ${port}`));
