import request from "supertest";
import app from "../src/app";
import {
  createHrUser,
  createDepartment,
  createCountry,
  createEmployee,
  createSalary,
} from "./helpers";

describe("Salary APIs", () => {
  test("sets joining salary for an employee", async () => {
    const { user, token } = await createHrUser({ email: "hr.sal.join@acme.com" });
    const department = await createDepartment("Engineering");
    const country = await createCountry();
    const employee = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: country.id,
    });

    const res = await request(app)
      .post(`/api/employees/${employee.id}/salary`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 50000,
        currencyCode: "INR",
        payPeriod: "monthly",
        effectiveFrom: "2024-01-15",
        changeType: "joining",
        changeReason: "Joined ACME",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe("50000");
    expect(res.body.data.isCurrent).toBe(true);
    expect(res.body.data.changeType).toBe("joining");
  });

  test("closes current salary and inserts hike", async () => {
    const { user, token } = await createHrUser({ email: "hr.sal.hike@acme.com" });
    const department = await createDepartment("Engineering");
    const country = await createCountry();
    const employee = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: country.id,
    });
    await createSalary({
      employeeId: employee.id,
      changedById: user.id,
      amount: 50000,
      effectiveFrom: new Date("2024-01-15"),
    });

    const res = await request(app)
      .post(`/api/employees/${employee.id}/salary`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 65000,
        payPeriod: "monthly",
        effectiveFrom: "2025-01-01",
        changeType: "hike",
        changeReason: "Annual hike",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe("65000");
    expect(res.body.data.isCurrent).toBe(true);

    const history = await request(app)
      .get(`/api/employees/${employee.id}/salaries`)
      .set("Authorization", `Bearer ${token}`);

    expect(history.status).toBe(200);
    expect(history.body.data.length).toBe(2);
    expect(history.body.data.filter((s: { isCurrent: boolean }) => s.isCurrent).length).toBe(1);
  });

  test("lists salary history", async () => {
    const { user, token } = await createHrUser({ email: "hr.sal.list@acme.com" });
    const department = await createDepartment("Engineering");
    const country = await createCountry();
    const employee = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: country.id,
    });
    await createSalary({
      employeeId: employee.id,
      changedById: user.id,
    });

    const res = await request(app)
      .get(`/api/employees/${employee.id}/salaries`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});
