import request from "supertest";
import app from "../src/app";
import {
  createHrUser,
  createDepartment,
  createCountry,
  createEmployee,
} from "./helpers";

describe("Department CRUD APIs", () => {
  test("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/departments");
    expect(res.status).toBe(401);
  });

  test("creates a department", async () => {
    const { token } = await createHrUser({ email: "hr.dept.create@acme.com" });

    const res = await request(app)
      .post("/api/departments")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Platform" });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Platform");
  });

  test("lists departments", async () => {
    const { token } = await createHrUser({ email: "hr.dept.list@acme.com" });
    await createDepartment("Finance");

    const res = await request(app)
      .get("/api/departments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test("gets a department by id", async () => {
    const { token } = await createHrUser({ email: "hr.dept.get@acme.com" });
    const department = await createDepartment("Sales");

    const res = await request(app)
      .get(`/api/departments/${department.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(department.id);
  });

  test("updates a department", async () => {
    const { token } = await createHrUser({ email: "hr.dept.patch@acme.com" });
    const department = await createDepartment("Ops");

    const res = await request(app)
      .patch(`/api/departments/${department.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Operations" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Operations");
  });

  test("deletes a department with no employees", async () => {
    const { token } = await createHrUser({ email: "hr.dept.delete@acme.com" });
    const department = await createDepartment("Temp");

    const res = await request(app)
      .delete(`/api/departments/${department.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test("does not delete a department that has employees", async () => {
    const { user, token } = await createHrUser({
      email: "hr.dept.block@acme.com",
    });
    const department = await createDepartment("Engineering");
    const country = await createCountry();
    await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: country.id,
    });

    const res = await request(app)
      .delete(`/api/departments/${department.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
