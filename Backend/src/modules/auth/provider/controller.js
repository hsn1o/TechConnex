// src/modules/auth/provider/controller.js
import { registerProvider, becomeCustomer } from "./service.js";
import { RegisterProviderDto } from "./dto.js";

async function register(req, res) {
  try {
    // Convert raw body → DTO
    const dto = new RegisterProviderDto(req.body);

    const user = await registerProvider(dto);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
}

// async function login(req, res) {
//   try {
//     // Convert raw body → DTO
//     const dto = new LoginProviderDto(req.body);

//     const result = await loginProvider(dto.email, dto.password);
//     res.status(200).json({ success: true, ...result });
//   } catch (error) {
//     console.error(error);
//     res.status(401).json({ success: false, message: error.message });
//   }
// }

async function becomeCustomerHandler(req, res) {
  try {
    const userId = req.user.userId;
    const result = await becomeCustomer(userId, req.body);

    if (result.alreadyCustomer) {
      return res
        .status(200)
        .json({ message: "Already a customer", profile: result.profile });
    }

    res.status(201).json({ success: true, profile: result.profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export {
  register,
  // login,
  becomeCustomerHandler,
};
