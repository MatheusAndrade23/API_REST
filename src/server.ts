import fastify from "fastify";
import { knex } from "./database";

import { env } from "./env";

const app = fastify();

app.get("/", async (request, reply) => {
  const test = knex;
});

app.listen({ port: env.PORT }).then(() => {
  console.log("Server is running on port 3000");
});
