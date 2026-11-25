import { prisma } from "../config/db";

const currencyRepository = {
  findAll() {
    return prisma.currency.findMany({
      orderBy: { code: "asc" },
    });
  },

  findByCode(code: string) {
    return prisma.currency.findUnique({ where: { code } });
  },

  upsert(data: { code: string; name: string; symbol: string }) {
    return prisma.currency.upsert({
      where: { code: data.code },
      update: { name: data.name, symbol: data.symbol },
      create: data,
    });
  },
};

export default currencyRepository;
