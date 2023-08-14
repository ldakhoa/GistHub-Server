import { Hono } from "hono";
import { ParserController } from "./Parser";
import { Gist } from "./Gist";
import { buildUrl } from "./GistBuildUrl";

const app = new Hono();
const cache = caches.default;
const parserController = new ParserController(cache);

function createDiscoverRoute(endpoint: string) {
  return async (res: {
    req: { query: (arg: string) => any };
    json: (arg: Gist[]) => any;
  }) => {
    const page = res.req.query("page");
    const direction = res.req.query("direction");
    const sort = res.req.query("sort");

    const url = buildUrl(endpoint, {
      direction: direction,
      sort: sort,
      page: page ?? "1",
    });
    const gists = await parserController.parseGists(url);

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

  const url = buildUrl(`${username}/starred`, {
    direction: direction,
    sort: sort,
    page: page ?? "1",
  });

  const gists = await parserController.parseGists(url);

  return res.json(gists);
});

app.get("/search", async (res) => {
  const query = encodeURIComponent(res.req.query("q") ?? "").replace(
    /%20/g,
    "+"
  ); // replace spaces with +

  // Sort options: s=sort, o=direction
  // Most stars
  // Fewest stars
  // Most forks
  // Fewest forks
  // Recently updated
  // Least recently updated
  const sort = res.req.query("s");
  const direction = res.req.query("o");

  const page = res.req.query("p");

  const url = buildUrl("search", {
    s: sort,
    o: direction,
    q: query,
    p: page ?? "1",
    ref: "searchresult",
  });
  const gists = await parserController.parseGists(url);
  const languages = await parserController.parseSearchResultLanguages(url);

  const response = {
    gists,
    languages,
  };
  return res.json(response);
});

export default app;
