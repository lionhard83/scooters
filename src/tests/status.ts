import { assert } from "chai";
import request from "supertest";
import { app } from "../app";

describe("status", () => {
  it("server is running", async () => {
    const { status } = await request(app).get("/status");
    assert.equal(status, 200);
  });
});
