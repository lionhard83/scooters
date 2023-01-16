import { assert } from "chai";
import request from "supertest";
import { app } from "../app";

describe("Scooters", () => {
  it("add new scooter", async () => {
    const {
      body: { length: l1 },
    } = await request(app).get("/scooters");

    const initialLat = 15.39;
    const initialLong = 31.17;
    const {
      status: s2,
      body: { id, lat, long },
    } = await request(app)
      .post("/scooters")
      .send({ lat: initialLat, long: initialLong });
    assert.equal(s2, 200);
    assert.equal(lat, initialLat);
    assert.equal(long, initialLong);
    assert.notEqual(id, undefined);

    // contando i monopattini dopo dell'inserimento
    const {
      body: { length: l2 },
    } = await request(app).get("/scooters");

    assert.equal(l1 + 1, l2);
  });

  it("add new scooter (response: 400) missing lat", async () => {
    const { status } = await request(app)
      .post("/scooters")
      .send({ long: 14.3 });
    assert.equal(status, 400);
  });

  it("add new scooter (response: 400) missing long", async () => {
    const { status } = await request(app).post("/scooters").send({ lat: 14.3 });
    assert.equal(status, 400);
  });

  it("add new scooter (response: 400) missing both", async () => {
    const { status } = await request(app).post("/scooters").send({});
    assert.equal(status, 400);
  });

  it("add new scooter (response: 400) insert lat and long as string", async () => {
    const { status } = await request(app)
      .post("/scooters")
      .send({ lat: "31.16", long: "caio" });
    assert.equal(status, 400);
  });

  it("add new scooter (response: 200) insert lat and long as string but are number", async () => {
    const { status, body } = await request(app)
      .post("/scooters")
      .send({ lat: "37.5078772", long: "15.0830304" });
    assert.equal(status, 200);
  });

  it("add new scooter (response: 400) insert lat over +/-90 degrees", async () => {
    const { status } = await request(app)
      .post("/scooters")
      .send({ lat: "97.5078772", long: "15.0830304" });
    assert.equal(status, 400);
  });

  it("add new scooter (response: 400) insert long over +/-180 degrees", async () => {
    const { status, body } = await request(app)
      .post("/scooters")
      .send({ lat: "87.5078772", long: "-190.0830304" });
    assert.equal(status, 400);
  });
});
