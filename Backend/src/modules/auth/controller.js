// src/modules/company/auth/controller.js
const { loginCompany } = require("./service");


async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginCompany({ email, password });
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}

module.exports = {
  login,
};
