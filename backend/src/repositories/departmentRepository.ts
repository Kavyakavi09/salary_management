import { prisma } from "../config/db";

const departmentRepository = {
  findAll() {
    return prisma.department.findMany({
      orderBy: { name: "asc" },
    });
  },

  findById(id: number) {
    return prisma.department.findUnique({ where: { id } });
  },

  findByName(name: string) {
    return prisma.department.findUnique({ where: { name } });
  },

  create(name: string) {
    return prisma.department.create({ data: { name } });
  },

  update(id: number, name: string) {
    return prisma.department.update({
      where: { id },
      data: { name },
    });
  },

  delete(id: number) {
    return prisma.department.delete({ where: { id } });
  },

  countEmployees(departmentId: number) {
    return prisma.employee.count({
      where: { departmentId, deletedAt: null },
    });
  },
};

export default departmentRepository;
