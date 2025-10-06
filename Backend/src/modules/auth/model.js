// src/modules/company/auth/model.js
const { PrismaClient, Prisma } = require("@prisma/client"); // <-- add Prisma

const prisma = new PrismaClient();

// User queries
async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}


// Provider profile queries
async function findProviderProfile(userId) {
  return prisma.providerProfile.findUnique({ where: { userId } });
}


module.exports = {
  findUserByEmail,
  findUserById,
  findProviderProfile,
};
