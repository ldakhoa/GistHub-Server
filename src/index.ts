import { Hono } from "hono";
import { ParserController } from "./Parser";
import { Gist } from "./Gist";

const app = new Hono();
const host = "https://gist.github.com";

function createDiscoverRoute(url: string) {
  return async (res: {
    req: { query: (arg: string) => any };
    json: (arg: Gist[]) => any;
  }) => {
    const page = res.req.query("page");
    const urlString = `${host}/${url}`;
    const cache = caches.default;
    const parser = new ParserController(urlString, cache);

    const pageIndex = parseInt(page ?? "1");
    const gists = await parser.parse(pageIndex);

    return res.json(gists);
  };
}

app.get("/discover", createDiscoverRoute("discover"));
app.get("/discover/starred", createDiscoverRoute("starred"));
app.get("/discover/forked", createDiscoverRoute("forked"));

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
