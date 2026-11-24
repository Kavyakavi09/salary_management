import { prisma } from "../config/db";

const hrUserRepository = {
  findByEmail(email: string) {
    return prisma.hrUser.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.hrUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: string;
  }) {
    return prisma.hrUser.create({ data });
  },
};

export default hrUserRepository;
