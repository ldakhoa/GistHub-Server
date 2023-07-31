import { User } from "./User";

export interface Gist {
  id?: string;
  updatedAt?: Date;
  description?: string;
  comments?: number;
  owner?: User;
  stargazerCount?: number;
  fileCount?: number;
  files?: { [filename: string]: File };
}

export interface File {
  filename?: string;
}
