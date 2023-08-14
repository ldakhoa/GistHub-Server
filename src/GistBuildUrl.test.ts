import { buildUrl } from "./GistBuildUrl";

describe("buildUrl", () => {
  test("should construct URL with path and query parameters", () => {
    const url1 = buildUrl("discover", { sort: "latest", page: "1" });
    expect(url1).toBe("https://gist.github.com/discover?sort=latest&page=1");

    const url2 = buildUrl("discover", { page: "1" });
    expect(url2).toBe("https://gist.github.com/discover?page=1");

    const url3 = buildUrl("discover/starred", { sort: "popular", page: "2" });
    expect(url3).toBe(
      "https://gist.github.com/discover/starred?sort=popular&page=2"
    );

    const url4 = buildUrl("starred", { user: "john", limit: undefined });
    expect(url4).toBe("https://gist.github.com/starred?user=john");
  });

  test("should construct URL without query parameters if query is empty", () => {
    const url = buildUrl("discover");
    expect(url).toBe("https://gist.github.com/discover");
  });

  test("should handle undefined values in query parameters", () => {
    const url = buildUrl("discover", { sort: undefined, page: "1" });
    expect(url).toBe("https://gist.github.com/discover?page=1");
  });

  test("should handle empty path and query", () => {
    const url = buildUrl();
    expect(url).toBe("https://gist.github.com/");
  });
});
