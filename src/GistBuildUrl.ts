const host = "https://gist.github.com";

export function buildUrl(
  path: string = "",
  query: Record<string, string | undefined> = {}
): string {
  const queryString = Object.entries(query)
    .filter(([_, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
    )
    .join("&");

  const url = new URL(`${host}/${path}`);
  url.search = queryString;

  return url.toString();
}