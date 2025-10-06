// src/modules/company/auth/controller.js
const { registerCompany, becomeProvider } = require("./service");
const { RegisterCompanyDto } = require("./dto");

async function register(req, res) {
  try {
    // Convert raw body → DTO
    const dto = new RegisterCompanyDto(req.body);

    const user = await registerCompany(dto);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
}


async function becomeProviderHandler(req, res) {
  try {
    const userId = req.user.userId;
    const result = await becomeProvider(userId, req.body);

    if (result.alreadyProvider) {
      return res
        .status(200)
        .json({ message: "Already a provider", profile: result.profile });
    }

    res.status(201).json({ success: true, profile: result.profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export {
  register,
  becomeProviderHandler,
};
