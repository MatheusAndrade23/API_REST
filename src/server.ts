import fastify from "fastify";
import { knex } from "./database";

const app = fastify();

app.get("/", async (request, reply) => {
  const test = knex;
});

app.listen({ port: 3000 }).then(() => {
  console.log("Server is running on port 3000");
});
