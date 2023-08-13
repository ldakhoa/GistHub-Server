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
  const direction = res.req.query("direction");
  const sort = res.req.query("sort");
  const page = res.req.query("page");

  const urlString = `https://gist.github.com/${username}/starred?direction=${direction}&sort=${sort}`;
  const cache = caches.default;
  const parser = new ParserController(urlString, cache);

  const pageIndex = parseInt(page ?? "1");
  const gists = await parser.parse(pageIndex);

  return res.json(gists);
});

app.get("/search", async (res) => {
  const query = encodeURIComponent(res.req.query("q") ?? "").replace(
    /%20/g,
    "+"
  ); // replace spaces with +

  const page = res.req.query("p");
  const urlString = `https://gist.github.com/search?q=${query}&ref=searchresult`;
  const cache = caches.default;
  const parser = new ParserController(urlString, cache);

  const pageIndex = parseInt(page ?? "1");
  const gists = await parser.parse(pageIndex);

  return res.json(gists);
});

export default app;
