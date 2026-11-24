import request from "supertest";
import app from "../src/app";
import { createHrUser } from "./helpers";

describe("POST /api/auth/login", () => {
  test("logs in with valid credentials and returns a token", async () => {
    const { user, password } = await createHrUser({
      name: "ACME HR",
      email: "login.ok@acme.com",
      password: "Password123!",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successfully");
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.data).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  test("returns 400 when email or password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login.ok@acme.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email and Password are required");
  });

  test("returns 401 for an unknown email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "missing@acme.com",
      password: "Password123!",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid Credentials");
  });

  test("returns 401 for a wrong password", async () => {
    await createHrUser({
      email: "login.wrongpass@acme.com",
      password: "Password123!",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login.wrongpass@acme.com",
      password: "WrongPassword1!",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid Credentials");
  });
});
