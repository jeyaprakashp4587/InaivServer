import express from "express";
import authRoutes from "./Routes/authroutes.js";
import groupsRoutes from "./Routes/groupsRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import privateChatsRoutes from "./Routes/privateChatsRoutes.js";
// import connectionRoutes from "./Routes/connectionroutes.js";
import sellNotesRoutes from "./Routes/sellNotesRoutes.js";
import groupChatRoutes from "./Routes/groupChatRoutes.js";
import freelanceRoutes from "./Routes/freelanceRoutes.js";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();

// middlewares
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// health check
app.get("/get", (req, res) => {
  console.log("server alive");
  res.send("Server is alive");
});

// routes
app.use("/auth", authRoutes);
app.use("/groups", groupsRoutes);
app.use("/user", userRoutes);
app.use("/privateChats", privateChatsRoutes);
app.use("/sellNotes", sellNotesRoutes);
app.use("/groupChat", groupChatRoutes);
app.use("/freelance", freelanceRoutes);

export default app;
