// src/utils/index.js
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const ok = (res, data = null, message = "OK") =>
  res.status(200).json({ success: true, message, data });

export const created = (res, data = null, message = "Created") =>
  res.status(201).json({ success: true, message, data });

export const badRequest = (res, message = "Bad Request", issues = null) =>
  res.status(400).json({ success: false, message, issues });

export const unauthorized = (res, message = "Unauthorized") =>
  res.status(401).json({ success: false, message });

export const notFound = (res, message = "Not Found") =>
  res.status(404).json({ success: false, message });

export const fail = (res, error, status = 500) => {
  const message =
    typeof error === "string" ? error : error?.message || "Internal Server Error";
  return res.status(status).json({ success: false, message });
};
