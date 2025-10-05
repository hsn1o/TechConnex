// src/modules/company/profile/service.js
import { UpsertCustomerProfileSchema } from "./dto.js";
import {
  findCustomerProfileByUserId,
  upsertCustomerProfile,
} from "./model.js";

export async function getMyProfile(userId) {
  return findCustomerProfileByUserId(userId);
}

export async function getProfileByUserId(userId) {
  return findCustomerProfileByUserId(userId);
}

export async function upsertMyProfile(userId, body) {
  const parsed = UpsertCustomerProfileSchema.safeParse(body);
  if (!parsed.success) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.issues = parsed.error.flatten();
    throw error;
  }
  return upsertCustomerProfile(userId, parsed.data);
}
