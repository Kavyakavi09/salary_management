import request from "supertest";
import app from "../src/app";
import {
  createHrUser,
  createDepartment,
  createCountry,
  createCurrency,
  createEmployee,
} from "./helpers";

describe("Country CRUD APIs", () => {
  test("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/countries");
    expect(res.status).toBe(401);
  });

  test("creates a country", async () => {
    const { token } = await createHrUser({ email: "hr.country.create@acme.com" });
    await createCurrency({ code: "INR" });

    const res = await request(app)
      .post("/api/countries")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "India", currencyCode: "INR", tdsRate: 0.2 });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("India");
    expect(res.body.data.currencyCode).toBe("INR");
    expect(res.body.data.tdsRate).toBe("0.2");
  });

  test("lists countries", async () => {
    const { token } = await createHrUser({ email: "hr.country.list@acme.com" });
    await createCountry({ name: "United States", currencyCode: "USD", tdsRate: 0.3 });

    const res = await request(app)
      .get("/api/countries")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test("gets a country by id", async () => {
    const { token } = await createHrUser({ email: "hr.country.get@acme.com" });
    const country = await createCountry({ name: "Other", tdsRate: 0 });

    const res = await request(app)
      .get(`/api/countries/${country.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(country.id);
  });

  test("updates a country", async () => {
    const { token } = await createHrUser({ email: "hr.country.patch@acme.com" });
    const country = await createCountry({ name: "Canada", currencyCode: "CAD", tdsRate: 0 });

    const res = await request(app)
      .patch(`/api/countries/${country.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ tdsRate: 0.1, currencyCode: "cad" });

    expect(res.status).toBe(200);
    expect(res.body.data.tdsRate).toBe("0.1");
    expect(res.body.data.currencyCode).toBe("CAD");
  });

  test("deletes a country with no employees", async () => {
    const { token } = await createHrUser({ email: "hr.country.delete@acme.com" });
    const country = await createCountry({ name: "TempLand" });

    const res = await request(app)
      .delete(`/api/countries/${country.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test("does not delete a country that has employees", async () => {
    const { user, token } = await createHrUser({
      email: "hr.country.block@acme.com",
    });
    const department = await createDepartment("Engineering");
    const country = await createCountry({ name: "India" });
    await createEmployee({
      hrUserId: user.id,
      departmentId: department.id,
      countryId: country.id,
    });

    const res = await request(app)
      .delete(`/api/countries/${country.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
