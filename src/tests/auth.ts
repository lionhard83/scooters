import { assert } from "chai";
import request from "supertest";
import { app } from "../app";
import { admins } from "../data/admin";

describe("Auth", () => {
  it("failed login", async () => {
    const { status } = await request(app)
      .post("/auth/login")
      .send({ email: "wrongemail", password: "12355" });
    assert.equal(status, 401);
  });
  it("ok login", async () => {
    const { email, password } = admins[0];
    const {
      status,
      body: { token },
    } = await request(app).post("/auth/login").send({ email, password });
    assert.equal(status, 200);
    assert.notEqual(token, undefined);
    const { status: secondStatus } = await request(app)
      .get("/auth/onlyAdmin")
      .set("authorization", token);
    assert.equal(secondStatus, 200);
  });
  it("failed onlyAdmin without token", async () => {
    const { status } = await request(app).get("/auth/onlyAdmin");
    assert.equal(status, 401);
  });
  it("failed onlyAdmin wrong token", async () => {
    const { status } = await request(app)
      .get("/auth/onlyAdmin")
      .set("authorization", "wrong token");
    assert.equal(status, 401);
  });
});
