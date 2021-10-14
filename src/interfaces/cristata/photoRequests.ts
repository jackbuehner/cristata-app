type GitHubUserID = number;
type GitHubTeamNodeID = string;

// use these as the stages for photo requests
enum Stage {
  NEW = 1.1,
  IN_PROGRESS = 2.1,
  FULFILLED = 3.1,
}

// interface for each photo request
interface IPhotoRequest {
  name?: string;
  permissions: {
    teams?: GitHubTeamNodeID[];
    users: GitHubUserID[];
  };
  timestamps?: {
    created_at?: string; // ISO string
    modified_at?: string; // ISO string
  };
  people: {
    created_by?: GitHubUserID | { name: string; photo: string; _id: string };
    modified_by?: GitHubUserID[];
    last_modified_by: GitHubUserID | { name: string; photo: string; _id: string };
    requested_by?: GitHubUserID | { name: string; photo: string; _id: string };
  };
  stage?: Stage;
  description?: string;
  article_id?: string; // _id from article
  versions?: IPhotoRequest[]; // store previous versions of the request
  hidden?: boolean;
}

export type { IPhotoRequest };
