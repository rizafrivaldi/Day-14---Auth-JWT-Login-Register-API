const { prismaClient } = require("@prismaClient");

const prisma = new PrismaClient({
  log: ["query"],
});

module.exports = prisma;
