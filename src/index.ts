import { Hono } from "hono";
import { ParserController } from "./Parser";
import { Gist } from "./Gist";

const app = new Hono();
const host = "https://gist.github.com";

function createRoute(url: string) {
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

app.get("/users/:username/starred", createRoute(":username/starred"));
app.get("/discover", createRoute("discover"));
app.get("/discover/starred", createRoute("starred"));
app.get("/discover/forked", createRoute("forked"));

export default app;
