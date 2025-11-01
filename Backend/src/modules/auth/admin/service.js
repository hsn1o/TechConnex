import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "./model.js";


const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const authService = {
  async register({ name, email, password }) {
    const existing = await userModel.findByEmail(email);
    if (existing) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.createAdmin({
      email,
      password: hashedPassword,
      name,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return { token, user };
  },

  async login(email, password) {
    const user = await userModel.findByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    if (!user.role.includes("ADMIN")) throw new Error("Access denied: not an admin");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return { token, user };
  },
};
