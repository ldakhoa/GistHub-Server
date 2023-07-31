import { describe, expect, test, beforeEach, jest } from "@jest/globals";
import { ParserController } from "./Parser";
import { Gist } from "./Gist";

describe("ParserControllerTests", () => {
  const stubbedUrlString = "https://gist.github.com/gisthubtester/starred";

  describe("parse", () => {
    test("should parse the snippets successfully", async () => {
      const parserController = new ParserController(stubbedUrlString);
      const gists = await parserController.parse();
      console.log(">> ", gists);

      expect(gists.length).toBe(11);
      // expect((await parserController.parse()).length).toBe(11);
    });

    test("should return an empty array for an invalid URL", async () => {
      const failureUrlString = "https://gist.github.com/gisthubtester1000";
      const parserController = new ParserController(failureUrlString);
      const result = await parserController.parse();
      expect(result).toEqual([]);
    });
  });

  describe("parseGistFromSnippet", () => {
    test("should parse the gist from snippet correctly", async () => {
      const parserController = new ParserController(stubbedUrlString);
      const stubbedGist: Gist = {
        id: "7cf4d30ae24b39e622f199c98d314be5",
        updatedAt: undefined,
        description: "Test paging 3",
        comments: 1,
        owner: {
          userName: "gisthubtester",
          avatarUrl:
            "https://avatars.githubusercontent.com/u/121019184?s=60&v=4",
        },
        stargazerCount: 1,
        fileCount: 1,
        files: { "test11.md": { filename: "test11.md" } },
      };

      const gists = await parserController.gistsFromUrl(1);
      const gist = gists[0];
      expect(gist.updatedAt).not.toBeNull();

      stubbedGist.updatedAt = gist.updatedAt;
      expect(gist).toEqual(stubbedGist);
    });
  });

  describe("buildPagingUrl", () => {
    test("should build the paging URL correctly", () => {
      const parserController = new ParserController(stubbedUrlString);
      let index = 1;

      expect(parserController.buildPagingUrl(index)).not.toBeNull();

      const pureUrl = parserController.buildPagingUrl(index);
      expect(pureUrl).toBe(stubbedUrlString);

      index = 10;
      const pagingUrl = parserController.buildPagingUrl(index);
      expect(pagingUrl).toBe(
        `https://gist.github.com/gisthubtester/starred?page=${index}`
      );
    });
  });
});
