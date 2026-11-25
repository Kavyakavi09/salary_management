import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

export type CountryMetricsRow = {
  countryId: number;
  country: string;
  currencyCode: string;
  payPeriod: string;
  minAmount: number | string;
  maxAmount: number | string;
  avgAmount: number | string;
  employeeCount: number | bigint;
};

export type JobTitleMetricsRow = {
  jobTitle: string;
  currencyCode: string;
  payPeriod: string;
  avgAmount: number | string;
  employeeCount: number | bigint;
};

const analyticsRepository = {
  byCountry(filters: {
    countryId?: number;
    currencyCode?: string;
    payPeriod?: string;
  }) {
    return prisma.$queryRaw<CountryMetricsRow[]>(Prisma.sql`
      SELECT
        c.id AS "countryId",
        c.name AS "country",
        s.currency_code AS "currencyCode",
        s.pay_period AS "payPeriod",
        MIN(s.amount) AS "minAmount",
        MAX(s.amount) AS "maxAmount",
        AVG(s.amount) AS "avgAmount",
        COUNT(*) AS "employeeCount"
      FROM salaries s
      INNER JOIN employees e ON e.id = s.employee_id
      INNER JOIN countries c ON c.id = e.country_id
      WHERE s.effective_to IS NULL
        AND e.deleted_at IS NULL
        AND e.status = 'active'
        ${
          filters.countryId !== undefined
            ? Prisma.sql`AND e.country_id = ${filters.countryId}`
            : Prisma.empty
        }
        ${
          filters.currencyCode
            ? Prisma.sql`AND s.currency_code = ${filters.currencyCode}`
            : Prisma.empty
        }
        ${
          filters.payPeriod
            ? Prisma.sql`AND s.pay_period = ${filters.payPeriod}`
            : Prisma.empty
        }
      GROUP BY c.id, c.name, s.currency_code, s.pay_period
      ORDER BY c.name ASC, s.currency_code ASC, s.pay_period ASC
    `);
  },

  byJobTitle(filters: {
    countryId?: number;
    jobTitle?: string;
    currencyCode?: string;
    payPeriod?: string;
  }) {
    return prisma.$queryRaw<JobTitleMetricsRow[]>(Prisma.sql`
      SELECT
        e.job_title AS "jobTitle",
        s.currency_code AS "currencyCode",
        s.pay_period AS "payPeriod",
        AVG(s.amount) AS "avgAmount",
        COUNT(*) AS "employeeCount"
      FROM salaries s
      INNER JOIN employees e ON e.id = s.employee_id
      WHERE s.effective_to IS NULL
        AND e.deleted_at IS NULL
        AND e.status = 'active'
        ${
          filters.countryId !== undefined
            ? Prisma.sql`AND e.country_id = ${filters.countryId}`
            : Prisma.empty
        }
        ${
          filters.jobTitle
            ? Prisma.sql`AND e.job_title = ${filters.jobTitle}`
            : Prisma.empty
        }
        ${
          filters.currencyCode
            ? Prisma.sql`AND s.currency_code = ${filters.currencyCode}`
            : Prisma.empty
        }
        ${
          filters.payPeriod
            ? Prisma.sql`AND s.pay_period = ${filters.payPeriod}`
            : Prisma.empty
        }
      GROUP BY e.job_title, s.currency_code, s.pay_period
      ORDER BY e.job_title ASC, s.currency_code ASC, s.pay_period ASC
    `);
  },
};

export default analyticsRepository;
