import { assert } from "chai";
import request from "supertest";
import { app } from "../app";
import { admins } from "../data/admin";

describe("Signup and login", () => {
  it("signup with invalid email", async () => {
    const { status } = await request(app).post("/auth/signup").send({
      email: "wrongemail",
      password: "12355",
      name: "mario",
      surname: "giammario",
    });
    assert.equal(status, 401);
  });

  it("signup with already existent email", async () => {
    const { status } = await request(app).post("/auth/signup").send({
      email: admins[0].email,
      password: "12355",
      name: "pio",
      surname: "sanpio",
    });
    assert.equal(status, 401);
  });

  it("signup with right email", async () => {
    const credentials = {
      email: "carloleonardi83@gmail.com",
      password: "12355",
      name: "Carlo",
      surname: "Leonardi",
    };
    const { status } = await request(app)
      .post("/auth/signup")
      .send(credentials);
    assert.equal(status, 201);
    const { status: statusLogin } = await request(app)
      .post("/auth/login")
      .send(credentials);
    assert.equal(statusLogin, 401);

    const wrongUuid = "wrong uuid";
    const { status: statusVerifyWrong } = await request(app).get(
      `/auth/verify/${wrongUuid}`
    );
    assert.equal(statusVerifyWrong, 401);

    const rightUuid = admins.find(
      ({ email }) => email === credentials.email
    )?.uuid;
    const { status: statusVerifyRight } = await request(app).get(
      `/auth/verify/${rightUuid}`
    );
    assert.equal(statusVerifyRight, 200);

    const { status: statusLoginAfterVerify } = await request(app)
      .post("/auth/login")
      .send(credentials);
    assert.equal(statusLoginAfterVerify, 200);
  });
});

describe("Auth with confirmed admin", () => {
  it("failed login", async () => {
    const { status } = await request(app)
      .post("/auth/login")
      .send({ email: "wrongemail", password: "12355" });
    assert.equal(status, 401);
  });
  it.only("ok login", async () => {
    const { email, password, name, surname } = admins[0];
    const {
      status,
      body: { token },
    } = await request(app).post("/auth/login").send({ email, password });
    assert.equal(status, 200);
    assert.notEqual(token, undefined);
    const { status: secondStatus, body } = await request(app)
      .get("/auth/me")
      .set("authorization", token);
    assert.equal(secondStatus, 200);
    assert(body.name, name);
    assert(body.email, email);
    assert(body.surname, surname);
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
