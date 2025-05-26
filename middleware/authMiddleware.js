import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const { userId, sessionClaims } = req.auth || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    let user = await User.findById(userId);

    if (!user) {
      // Use Clerk claims or safe fallback defaults
      user = await User.create({
        _id: userId,
        username: sessionClaims?.username || sessionClaims?.sub || "QuickStayUser",
        email: sessionClaims?.email_address || "noemail@clerk.com",
        image: sessionClaims?.image_url || "https://www.gravatar.com/avatar?d=mp",
        role: "user",
        recentSearchedCities: [] // always start empty for a new user
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
