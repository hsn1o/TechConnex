// src/modules/company/auth/controller.js
import { registerCompany, loginCompany, becomeProvider } from "./service.js";
import { RegisterCompanyDto, LoginCompanyDto } from "./dto.js";

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

async function login(req, res) {
  try {
    // Convert raw body → DTO
    const dto = new LoginCompanyDto(req.body);

    const result = await loginCompany(dto.email, dto.password);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: error.message });
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
  login,
  becomeProviderHandler,
};
