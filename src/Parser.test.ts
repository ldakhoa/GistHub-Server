import { describe, expect, test } from "@jest/globals";
import { ParserController } from "./Parser";
import { Gist } from "./Gist";
import { buildUrl } from "./GistBuildUrl";

describe("ParserControllerTests", () => {
  const stubbedUrlString = "https://gist.github.com/gisthubtester/starred";
  const parserController = new ParserController();

  describe("parse", () => {
    test("should parse the snippets successfully", async () => {
      const urlPageOne = buildUrl("gisthubtester/starred");
      const urlPageTwo = buildUrl("gisthubtester/starred", {
        page: "2",
      });
      expect((await parserController.parse(urlPageOne)).length).toBe(10);
      expect((await parserController.parse(urlPageTwo)).length).toBe(1);
    });

    test("should return an empty array for an invalid URL", async () => {
      const failureUrlString = "https://gist.github.com/gisthubtester1000";
      const result = await parserController.parse(failureUrlString);
      expect(result).toEqual([]);
    });
  });

  describe("parseGistFromSnippet", () => {
    test("should parse the gist from snippet correctly", async () => {
      const stubbedGist: Gist = {
        id: "7cf4d30ae24b39e622f199c98d314be5",
        updated_at: "2023-07-29T08:37:29Z",
        isUpdated: false,
        description: "Test paging 3",
        comments: 1,
        owner: {
          login: "gisthubtester",
          avatar_url:
            "https://avatars.githubusercontent.com/u/121019184?s=60&v=4",
        },
        stargazerCount: 1,
        fileCount: 1,
        files: { "test11.md": { filename: "test11.md" } },
        fork: {
          totalCount: 0,
        },
      };

      const gists = await parserController.gistsFromUrl(stubbedUrlString);
      const gist = gists[0];
      expect(gist.updated_at).not.toBeNull();

      expect(gist).toEqual(stubbedGist);
    });
  });
});
