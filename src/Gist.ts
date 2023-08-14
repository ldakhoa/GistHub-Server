import { User } from "./User";

export interface Gist {
  id?: string;
  updated_at?: string;
  isUpdated?: boolean;
  description?: string;
  comments?: number;
  owner?: User;
  stargazerCount?: number;
  fileCount?: number;
  files?: { [filename: string]: File };
  fork?: Fork;
}

export interface File {
  filename?: string;
}

export interface Fork {
  totalCount: number;
}
