import { Hono } from "hono";
import { ParserController } from "./Parser";

const app = new Hono();

app.get("/users/:username/starred", async (res) => {
  const username = res.req.param("username");
  const page = res.req.query("page");

  const urlString = `https://gist.github.com/${username}/starred`;
  const cache = caches.default;
  const parser = new ParserController(urlString, cache);

  const pageIndex = parseInt(page ?? "1");
  const gists = await parser.parse(pageIndex);

  return res.json(gists);
});

export default app;
