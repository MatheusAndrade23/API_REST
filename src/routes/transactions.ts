import { FastifyInstance } from "fastify";
import crypto from "node:crypto";

import { z } from "zod";
import { knex } from "./../database";

import { checkSessionIdExists } from "./../middlewares/check-session-id-exists";

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get("/", { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const transactions = await knex("transactions")
      .where("session_id", sessionId)
      .select("*");

    return { transactions };
  });

  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const getTransactionsParamsSchema = z.object({
      id: z.string(),
    });

    const { id } = getTransactionsParamsSchema.parse(request.params);

    const transaction = await knex("transactions")
      .where({
        session_id: sessionId,
        id,
      })
      .first();

    return { transaction };
  });

  app.get(
    "/summary",
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies;

      const summary = await knex("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return { summary };
    }
  );

  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      type: z.enum(["credit", "debit"]),
      amount: z.number(),
    });

    const { title, type, amount } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : -amount,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
};
