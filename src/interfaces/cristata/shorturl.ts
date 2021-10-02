import { GitHubUserID } from './profiles';

interface IShortURL {
  original_url: string;
  code: string;
  domain: string;
  timestamps: {
    created_at: string; // ISO string
    modified_at: string; // ISO string
  };
  people: {
    created_by?: GitHubUserID | { name: string; photo: string };
    modified_by?: GitHubUserID[];
    last_modified_by: GitHubUserID | { name: string; photo: string };
  };
}

export type { IShortURL };
