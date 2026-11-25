import request from "supertest";
import app from "../src/app";
import { createHrUser, createDepartment, createEmployee } from "./helpers";

describe("Employee CRUD APIs", () => {
  test("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/employees");
    expect(res.status).toBe(401);
  });

  test("creates an employee with departmentId", async () => {
    const { token } = await createHrUser({ email: "hr.create@acme.com" });
    const department = await createDepartment("Engineering");

    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        employeeCode: "EMP100",
        fullName: "Grace Hopper",
        email: "grace@acme.com",
        jobTitle: "Engineer",
        departmentId: department.id,
        country: "India",
        grossSalary: 100000,
        currencyCode: "INR",
        hireDate: "2024-03-01",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.departmentId).toBe(department.id);
    expect(res.body.data.grossSalary).toBe("100000");
    expect(res.body.data.pay).toBeUndefined();
  });

  test("lists employees with pagination", async () => {
    const { user, token } = await createHrUser({ email: "hr.list@acme.com" });
    const department = await createDepartment("Engineering");
    await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      employeeCode: "EMP200",
      email: "emp200@acme.com",
    });

    const res = await request(app)
      .get("/api/employees?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(1);
  });

  test("gets a single employee by id", async () => {
    const { user, token } = await createHrUser({ email: "hr.get@acme.com" });
    const department = await createDepartment("Engineering");
    const employee = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      employeeCode: "EMP300",
      email: "emp300@acme.com",
    });

    const res = await request(app)
      .get(`/api/employees/${employee.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(employee.id);
  });

  test("updates an employee", async () => {
    const { user, token } = await createHrUser({ email: "hr.patch@acme.com" });
    const engineering = await createDepartment("Engineering");
    const sales = await createDepartment("Sales");
    const employee = await createEmployee({
      hrUserId: user.id,
      departmentId: engineering.id,
      employeeCode: "EMP400",
      email: "emp400@acme.com",
    });

    const res = await request(app)
      .patch(`/api/employees/${employee.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobTitle: "Senior Engineer",
        departmentId: sales.id,
        grossSalary: 75000,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.departmentId).toBe(sales.id);
    expect(res.body.data.grossSalary).toBe("75000");
  });

  test("soft deletes an employee", async () => {
    const { user, token } = await createHrUser({ email: "hr.delete@acme.com" });
    const department = await createDepartment("Engineering");
    const employee = await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      employeeCode: "EMP500",
      email: "emp500@acme.com",
    });

    const del = await request(app)
      .delete(`/api/employees/${employee.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(del.status).toBe(200);

    const get = await request(app)
      .get(`/api/employees/${employee.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(get.status).toBe(404);
  });
});
