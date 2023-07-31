import express, { Express, Request, Response } from "express";
import { ParserController } from "./src/Parser";

const app: Express = express();
const port = "8080";

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/users/:username/starred", async (req: Request, res: Response) => {
  const { username } = req.params;

  const urlString = `https://gist.github.com/${username}/starred`;
  const parser = new ParserController(urlString);

  try {
    const gists = await parser.parse();
    res.json(gists);
  } catch (error) {
    // TODO: Catch error
  }

  return [];
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
