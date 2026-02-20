import initializeFirebaseAdmin from "../Firebase/firebaseAdmin.js";
const admin = initializeFirebaseAdmin();

export const verifyFirebaseToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      provider: decoded.firebase?.sign_in_provider,
      imgUrl: decoded.picture,
      email: decoded.email,
    };
    console.log("sucess");

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
