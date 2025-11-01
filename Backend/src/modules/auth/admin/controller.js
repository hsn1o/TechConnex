import { userModel } from "./model.js";
import { authService } from "./service.js";


export const authController = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const { token, user } = await authServiceervice.register({ name, email, password });

      res.status(201).json({
        message: "Admin registered successfully",
        token,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login(email, password);

      res.json({
        message: "Admin login successful",
        token,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },
  
  // ✅ new method
async getProfile(req, res) {
  try {
    console.log("🟢 Decoded user:", req.user);

    const userId = req.user.id; // ✅ now always defined
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.role.includes("ADMIN")) {
      return res.status(403).json({ error: "Unauthorized: admin only" });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("🔥 Error fetching admin profile:", error);
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
}



};
