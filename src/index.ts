import { Env, Hono } from "hono";
import { ParserController } from "./Parser";

const app = new Hono();

app.get("/users/:username/starred", async (res) => {
  const username = res.req.param("username");

  const urlString = `https://gist.github.com/${username}/starred`;
  const parser = new ParserController(urlString);

  const gists = await parser.parse();
  console.log(gists);

  return res.json(gists);
});

export default app;
