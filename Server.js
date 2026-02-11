import http from "http";
import { connectRedis } from "./Redis/redis.js";
import DB1 from "./DB/DB1.js";
import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";

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
const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Server is listening on port ${port}`));
