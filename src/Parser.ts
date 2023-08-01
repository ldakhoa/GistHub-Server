import type { Cheerio, Element } from "cheerio";
import * as cheerio from "cheerio";
import { Gist, File } from "./Gist";
import { User } from "./User";

class ParserController {
  private readonly urlString: string;
  private readonly cache: Cache | null;

  constructor(urlString: string, cache?: Cache) {
    this.urlString = urlString;
    this.cache = cache || null;
  }

  async parse(index?: number): Promise<Gist[]> {
    const gists: Gist[] = [];

    if (index) {
      const gistsFromUrl = await this.gistsFromUrl(index);
      gists.push(...gistsFromUrl);
    } else {
      let pageIndex = 1;
      while (pageIndex > 0) {
        const gistsFromUrl = await this.gistsFromUrl(pageIndex);

        if (gistsFromUrl.length === 0) {
          break;
        }

        gists.push(...gistsFromUrl);
        pageIndex++;
      }
    }

    return gists;
  }

  async gistsFromUrl(index: number): Promise<Gist[]> {
    try {
      const url = this.buildPagingUrl(index);

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

    // Updated date
    const lastActiveTag = snippet
      .find("div.color-fg-muted.f6 relative-time[datetime]")
      .first();
    if (lastActiveTag) {
      const lastActiveDateStr = lastActiveTag.attr("datetime") ?? "";
      const updatedAt = new Date(lastActiveDateStr);
      // gist.updated_at = updatedAt;
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

  buildPagingUrl(index: number): string {
    return index >= 2 ? `${this.urlString}?page=${index}` : this.urlString;
  }
}

export { ParserController };
