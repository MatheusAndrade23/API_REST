import { expect, it, beforeAll, afterAll, describe, beforeEach } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "Salary",
        amount: 3000,
        type: "credit",
      })
      .expect(201);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Salary",
        amount: 3000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    if (!cookies || cookies.length == 0) {
      throw new Error("No cookies found");
    }

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        amount: 3000,
      }),
    ]);
  });

  it("should be able to get a specific transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Salary",
        amount: 3000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    if (!cookies || cookies.length == 0) {
      throw new Error("No cookies found");
    }

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        amount: 3000,
      })
    );
  });

  it("should be able to get the summary", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Salary",
        amount: 3000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    if (!cookies || cookies.length == 0) {
      throw new Error("No cookies found");
    }

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Salary",
        amount: 2500,
        type: "debit",
      });

    const getSummaryResponse = await request(app.server)
      .get(`/transactions/summary`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getSummaryResponse.body.summary).toEqual(
      expect.objectContaining({
        amount: 500,
      })
    );
  });
});
