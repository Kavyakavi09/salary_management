import request from "supertest";
import app from "../src/app";
import {
  createHrUser,
  createDepartment,
  createCountry,
  createEmployee,
  createSalary,
} from "./helpers";

describe("Salary metrics APIs", () => {
  test("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/analytics/by-country");
    expect(res.status).toBe(401);
  });

  test("returns metrics by country without mixing currencies", async () => {
    const { user, token } = await createHrUser({
      email: "hr.metrics.country@acme.com",
    });
    const department = await createDepartment("Engineering");
    const india = await createCountry({
      name: "India",
      currencyCode: "INR",
      tdsRate: 0.2,
    });
    const us = await createCountry({
      name: "United States",
      currencyCode: "USD",
      tdsRate: 0.3,
    });

    const e1 = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: india.id,
      employeeCode: "M1",
      email: "m1@acme.com",
      jobTitle: "Engineer",
    });
    const e2 = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: india.id,
      employeeCode: "M2",
      email: "m2@acme.com",
      jobTitle: "Engineer",
    });
    const e3 = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: us.id,
      employeeCode: "M3",
      email: "m3@acme.com",
      jobTitle: "Manager",
    });

    await createSalary({
      employeeId: e1.id,
      changedById: user.id,
      amount: 40000,
      currencyCode: "INR",
      payPeriod: "monthly",
    });
    await createSalary({
      employeeId: e2.id,
      changedById: user.id,
      amount: 60000,
      currencyCode: "INR",
      payPeriod: "monthly",
    });
    await createSalary({
      employeeId: e3.id,
      changedById: user.id,
      amount: 10000,
      currencyCode: "USD",
      payPeriod: "monthly",
    });

    const res = await request(app)
      .get("/api/analytics/by-country")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);

    const indiaRow = res.body.data.find(
      (row: { country: string; currencyCode: string }) =>
        row.country === "India" && row.currencyCode === "INR"
    );
    expect(indiaRow.min).toBe("40000.00");
    expect(indiaRow.max).toBe("60000.00");
    expect(indiaRow.average).toBe("50000.00");
    expect(indiaRow.employeeCount).toBe(2);
    expect(indiaRow.payPeriod).toBe("monthly");

    const usRow = res.body.data.find(
      (row: { country: string }) => row.country === "United States"
    );
    expect(usRow.currencyCode).toBe("USD");
    expect(usRow.average).toBe("10000.00");
    expect(usRow.employeeCount).toBe(1);
  });

  test("returns metrics by job title with optional country filter", async () => {
    const { user, token } = await createHrUser({
      email: "hr.metrics.job@acme.com",
    });
    const department = await createDepartment("Engineering");
    const india = await createCountry({ name: "India" });
    const us = await createCountry({
      name: "United States",
      currencyCode: "USD",
      tdsRate: 0.3,
    });

    const engIn = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: india.id,
      employeeCode: "J1",
      email: "j1@acme.com",
      jobTitle: "Engineer",
    });
    const engUs = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: us.id,
      employeeCode: "J2",
      email: "j2@acme.com",
      jobTitle: "Engineer",
    });
    const mgr = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: india.id,
      employeeCode: "J3",
      email: "j3@acme.com",
      jobTitle: "Manager",
    });

    await createSalary({
      employeeId: engIn.id,
      changedById: user.id,
      amount: 50000,
      currencyCode: "INR",
    });
    await createSalary({
      employeeId: engUs.id,
      changedById: user.id,
      amount: 8000,
      currencyCode: "USD",
    });
    await createSalary({
      employeeId: mgr.id,
      changedById: user.id,
      amount: 90000,
      currencyCode: "INR",
    });

    const all = await request(app)
      .get("/api/analytics/by-job-title")
      .set("Authorization", `Bearer ${token}`);

    expect(all.status).toBe(200);
    expect(all.body.data.length).toBe(3);

    const filtered = await request(app)
      .get(`/api/analytics/by-job-title?countryId=${india.id}&jobTitle=Engineer`)
      .set("Authorization", `Bearer ${token}`);

    expect(filtered.status).toBe(200);
    expect(filtered.body.data.length).toBe(1);
    expect(filtered.body.data[0].jobTitle).toBe("Engineer");
    expect(filtered.body.data[0].currencyCode).toBe("INR");
    expect(filtered.body.data[0].average).toBe("50000.00");
    expect(filtered.body.data[0].employeeCount).toBe(1);
  });

  test("does not mix monthly and annual pay periods", async () => {
    const { user, token } = await createHrUser({
      email: "hr.metrics.period@acme.com",
    });
    const department = await createDepartment("Engineering");
    const country = await createCountry();

    const monthlyEmp = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: country.id,
      employeeCode: "P1",
      email: "p1@acme.com",
    });
    const annualEmp = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: country.id,
      employeeCode: "P2",
      email: "p2@acme.com",
    });

    await createSalary({
      employeeId: monthlyEmp.id,
      changedById: user.id,
      amount: 50000,
      payPeriod: "monthly",
    });
    await createSalary({
      employeeId: annualEmp.id,
      changedById: user.id,
      amount: 600000,
      payPeriod: "annual",
    });

    const res = await request(app)
      .get("/api/analytics/by-country")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(
      res.body.data.map((row: { payPeriod: string }) => row.payPeriod).sort()
    ).toEqual(["annual", "monthly"]);
  });
});
