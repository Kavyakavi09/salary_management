import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

const countryRepository = {
  findAll() {
    return prisma.country.findMany({
      orderBy: { name: "asc" },
    });
  },

  findById(id: number) {
    return prisma.country.findUnique({ where: { id } });
  },

  findByName(name: string) {
    return prisma.country.findUnique({ where: { name } });
  },

  create(data: {
    name: string;
    currencyCode: string;
    tdsRate: Prisma.Decimal | number | string;
  }) {
    return prisma.country.create({ data });
  },

  update(
    id: number,
    data: {
      name?: string;
      currencyCode?: string;
      tdsRate?: Prisma.Decimal | number | string;
    }
  ) {
    return prisma.country.update({
      where: { id },
      data,
    });
  },

  delete(id: number) {
    return prisma.country.delete({ where: { id } });
  },

  countEmployees(countryId: number) {
    return prisma.employee.count({
      where: { countryId, deletedAt: null },
    });
  },
};

export default countryRepository;
