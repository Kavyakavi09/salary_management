import { Prisma, PayPeriod, SalaryChangeType } from "@prisma/client";
import { prisma } from "../config/db";

const salaryRepository = {
  findByEmployee(employeeId: string) {
    return prisma.salary.findMany({
      where: { employeeId },
      include: { currency: true },
      orderBy: [{ effectiveFrom: "desc" }, { createdAt: "desc" }],
    });
  },

  findCurrent(employeeId: string) {
    return prisma.salary.findFirst({
      where: { employeeId, effectiveTo: null },
      include: { currency: true },
    });
  },

  create(data: {
    employeeId: string;
    amount: Prisma.Decimal | number | string;
    currencyCode: string;
    payPeriod: PayPeriod;
    effectiveFrom: Date;
    effectiveTo?: Date | null;
    changeType: SalaryChangeType;
    changeReason?: string | null;
    changedById: string;
  }) {
    return prisma.salary.create({
      data,
      include: { currency: true },
    });
  },

  close(id: string, effectiveTo: Date) {
    return prisma.salary.update({
      where: { id },
      data: { effectiveTo },
      include: { currency: true },
    });
  },

  async reviseInTransaction(input: {
    currentId: string | null;
    closeDate: Date | null;
    next: {
      employeeId: string;
      amount: Prisma.Decimal | number | string;
      currencyCode: string;
      payPeriod: PayPeriod;
      effectiveFrom: Date;
      changeType: SalaryChangeType;
      changeReason?: string | null;
      changedById: string;
    };
  }) {
    return prisma.$transaction(async (tx) => {
      if (input.currentId && input.closeDate) {
        await tx.salary.update({
          where: { id: input.currentId },
          data: { effectiveTo: input.closeDate },
        });
      }

      return tx.salary.create({
        data: {
          ...input.next,
          effectiveTo: null,
        },
        include: { currency: true },
      });
    });
  },
};

export default salaryRepository;
