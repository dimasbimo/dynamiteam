const { PrismaClient } = require('@prisma/client');

// Mencegah terlalu banyak koneksi Prisma saat hot-reload di development.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = { prisma };
