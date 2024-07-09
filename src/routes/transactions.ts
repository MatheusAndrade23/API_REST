import { FastifyInstance } from "fastify";
import crypto from "node:crypto";

import { z } from "zod";
import { knex } from "./../database";

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      type: z.enum(["credit", "debit"]),
      amount: z.number(),
    });

    const { title, type, amount } = createTransactionBodySchema.parse(
      request.body
    );

    await knex("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : -amount,
    });

    return reply.status(201).send();
  });
};
