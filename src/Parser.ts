import type { Cheerio, Element } from "cheerio";
import * as cheerio from "cheerio";
import { Gist, File, Fork } from "./Gist";
import { User } from "./User";
import { SearchResultLanguage } from "./SearchResultLanguage";

class ParserController {
  private readonly cache: Cache | null;

  constructor(cache?: Cache) {
    this.cache = cache || null;
  }

  async parseGists(url: string): Promise<Gist[]> {
    const gists: Gist[] = [];

    const gistsFromUrl = await this.gistsFromUrl(url);
    gists.push(...gistsFromUrl);

    return gists;
  }

  async parseSearchResultLanguages(
    url: string
  ): Promise<SearchResultLanguage[]> {
    if (!url) {
      return [];
    }

    const response: Response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const languages: SearchResultLanguage[] = [];

    $("ul.filter-list li").each((_, element) => {
      const snippet = $(element);
      const nameWithCount = snippet.find(".filter-item").text().trim();
      const name = nameWithCount.split("\n")[1].trim();

      const count = snippet.find(".count").text().trim().replace(/,/g, "");

      languages.push({
        language: name,
        count: parseInt(count, 10),
      });
    });

    return languages;
  }

  async gistsFromUrl(url: string): Promise<Gist[]> {
    try {
      if (!url) {
        return [];
      }

      console.log(`Parsing Gists from ${url}...`);

      // Try to fetch the response from cache
      const cacheKey = new Request(url).url;
      const cacheResponse = await this.cache?.match(cacheKey);

      if (cacheResponse) {
        const cachedGists: Gist[] = await cacheResponse.json();
        return cachedGists;
      }

      const response: Response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      const gistSnippets = $("div.gist-snippet");

      const gists: Gist[] = [];

      gistSnippets.each((_, snippet) => {
        const gist = this.gistFromSnippet($(snippet));
        gists.push(gist);
      });

      // Store the response in cache
      const cacheResponseJson = JSON.stringify(gists);
      const cacheOptions = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const cacheResponseToCache = new Response(
        cacheResponseJson,
        cacheOptions
      );
      await this.cache?.put(cacheKey, cacheResponseToCache.clone());

      return gists;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  gistFromSnippet(snippet: Cheerio<Element>): Gist {
    const gist: Gist = {};
    const user: User = {};

    // Avatar user
    const avatar = snippet
      .find("img[src*=avatars.githubusercontent.com]")
      .first();
    if (avatar) {
      const avatarURL = avatar.attr("src");
      user.avatar_url = avatarURL;
    }

    // Title
    const fileName = snippet.find("a[href*=gist] strong").first()?.text();
    if (fileName) {
      const file: File = {
        filename: fileName,
      };
      const files: { [filename: string]: File } = {
        [fileName]: file,
      };
      gist.files = files;
    }

    // Gist url
    const gistUrl = snippet.find("a[href*=gist]").first()?.attr("href");

    if (gistUrl) {
      // Extract username and gist ID using regular expression
      const regex = /(?:\/|:\/\/gist\.github\.com\/)([^/]+)\/([^/?]+)/;
      const matches = gistUrl.match(regex);

      if (matches && matches.length >= 3) {
        const username = matches[1];
        const gistId = matches[2];
        user.login = username;
        gist.id = gistId;
      }
    }

    // Description
    const descriptionTag = snippet.find("span.f6.color-fg-muted").first();
    if (descriptionTag) {
      const description = descriptionTag.text().trim();
      gist.description = description;
    }

    const isUpdatedTag = snippet.find("div.color-fg-muted.f6").first().text();
    gist.isUpdated = isUpdatedTag.includes("active") ? true : false;

    // Updated date
    const lastActiveTag = snippet
      .find("div.color-fg-muted.f6 relative-time[datetime]")
      .first();
    if (lastActiveTag) {
      const lastActiveDateStr = lastActiveTag.attr("datetime") ?? "";
      const updatedAt = new Date(lastActiveDateStr);
      const formattedUpdatedAt = updatedAt
        .toISOString()
        .replace(/\.\d+Z$/, "Z");
      gist.updated_at = formattedUpdatedAt;
    }

    // File count
    const fileCountElement = snippet
      .find(`a[href*="/${user.login}/${gist.id}"]`)
      .first();
    if (fileCountElement) {
      const fileCountText = fileCountElement.text();
      const fileCount = parseInt(fileCountText.replace(/\D/g, ""));
      gist.fileCount = fileCount;
    }

    // Comment count
    const commentLink = snippet.find("a[href*=comments]").first();
    if (commentLink) {
      const commentCountText = commentLink.text();
      const commentCount = parseInt(commentCountText.replace(/\D/g, ""));
      gist.comments = commentCount;
    }

    // Fork count
    const forksLink = snippet.find("a[href$=/forks]").first();
    if (forksLink) {
      const forkCountText = forksLink.text();
      const forkCount = parseInt(forkCountText.replace(/\D/g, ""));
      const fork: Fork = {
        totalCount: forkCount,
      };
      gist.fork = fork;
    }

    // Stargazers count
    const stargazersLink = snippet.find("a[href$=/stargazers]").first();
    if (stargazersLink) {
      const stargazerCountText = stargazersLink.text();
      const stargazerCount = parseInt(stargazerCountText.replace(/\D/g, ""));
      gist.stargazerCount = stargazerCount;
    }

    gist.owner = user;

    return gist;
  }
}

export { ParserController };
