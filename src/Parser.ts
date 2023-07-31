import axios from "axios";
import cheerio from "cheerio";
import { Gist, File } from "./Gist";
import { User } from "./User";

class ParserController {
  private readonly urlString: string;

  constructor(urlString: string) {
    this.urlString = urlString;
  }

  async parse(): Promise<Gist[]> {
    let index = 1;
    const gists: Gist[] = [];

    while (index > 0) {
      const gistsFromUrl = await this.gistsFromUrl(index);

      if (gistsFromUrl.length === 0) {
        break;
      }

      gists.push(...gistsFromUrl);
      index += 1;
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

      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const gistSnippets = $("div.gist-snippet");

      const gists: Gist[] = [];

      gistSnippets.each((_, snippet) => {
        const gist = this.gistFromSnippet($(snippet));
        gists.push(gist);
      });

      return gists;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  gistFromSnippet(snippet: cheerio.Cheerio): Gist {
    const gist: Gist = {};
    const user: User = {};

    // Avatar user
    const avatar = snippet
      .find("img[src*=avatars.githubusercontent.com]")
      .first();
    if (avatar) {
      const avatarURL = avatar.attr("src");
      user.avatarUrl = avatarURL;
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
    console.log("Gist URL: ", gistUrl);

    if (gistUrl) {
      // Extract username and gist ID using regular expression
      const regex = /(?:\/|:\/\/gist\.github\.com\/)([^/]+)\/([^/?]+)/;
      const matches = gistUrl.match(regex);

      if (matches && matches.length >= 3) {
        const username = matches[1];
        const gistId = matches[2];
        user.userName = username;
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
      gist.updatedAt = updatedAt;
    }

    // File count
    const fileCountElement = snippet
      .find(`a[href*="/${user.userName}/${gist.id}"]`)
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