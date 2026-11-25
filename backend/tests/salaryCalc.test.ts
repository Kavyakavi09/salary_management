import request from "supertest";
import app from "../src/app";
import {
  createHrUser,
  createDepartment,
  createCountry,
  createEmployee,
  createSalary,
} from "./helpers";

describe("Salary calculate API", () => {
  test("rejects unauthenticated access", async () => {
    const res = await request(app).post("/api/salary/calculate");
    expect(res.status).toBe(401);
  });

  test("calculates net pay from grossSalary and countryId", async () => {
    const { token } = await createHrUser({ email: "hr.calc.raw@acme.com" });
    const country = await createCountry({
      name: "India",
      currencyCode: "INR",
      tdsRate: 0.2,
    });

    const res = await request(app)
      .post("/api/salary/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({ grossSalary: 100000, countryId: country.id });

    expect(res.status).toBe(200);
    expect(res.body.data.gross).toBe("100000.00");
    expect(res.body.data.tdsRate).toBe("0.2000");
    expect(res.body.data.deduction).toBe("20000.00");
    expect(res.body.data.net).toBe("80000.00");
    expect(res.body.data.currencyCode).toBe("INR");
  });

  test("calculates net pay from employee current salary + country TDS", async () => {
    const { user, token } = await createHrUser({ email: "hr.calc.emp@acme.com" });
    const department = await createDepartment("Engineering");
    const country = await createCountry({
      name: "United States",
      currencyCode: "USD",
      tdsRate: 0.3,
    });
    const employee = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: country.id,
    });
    await createSalary({
      employeeId: employee.id,
      changedById: user.id,
      amount: 10000,
      currencyCode: "USD",
    });

    const res = await request(app)
      .post("/api/salary/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({ employeeId: employee.id });

    expect(res.status).toBe(200);
    expect(res.body.data.employeeId).toBe(employee.id);
    expect(res.body.data.gross).toBe("10000.00");
    expect(res.body.data.deduction).toBe("3000.00");
    expect(res.body.data.net).toBe("7000.00");
  });

  test("fails when employee has no current salary", async () => {
    const { user, token } = await createHrUser({ email: "hr.calc.none@acme.com" });
    const department = await createDepartment("Engineering");
    const country = await createCountry();
    const employee = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: country.id,
    });

    const res = await request(app)
      .post("/api/salary/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({ employeeId: employee.id });

    expect(res.status).toBe(400);
  });

  test("applies 0% TDS for other countries", async () => {
    const { token } = await createHrUser({ email: "hr.calc.other@acme.com" });
    const country = await createCountry({
      name: "Other",
      currencyCode: "USD",
      tdsRate: 0,
    });

    const res = await request(app)
      .post("/api/salary/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({ grossSalary: 5000, countryId: country.id });

    expect(res.status).toBe(200);
    expect(res.body.data.deduction).toBe("0.00");
    expect(res.body.data.net).toBe("5000.00");
  });
});
