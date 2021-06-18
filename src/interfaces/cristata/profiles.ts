type GitHubUserID = number;
type GitHubTeamID = number;

// interface for each user profile
interface IProfile {
  _id: string; // mongoDB ID
  name: string;
  phone: number;
  email: string;
  twitter: string;
  biography: string;
  current_title: string;
  timestamps: {
    created_at: string; // ISO string
    modified_at: string; // ISO string
    joined_at?: string; // ISO string
    left_at?: string; // ISO string
  };
  people: {
    created_by?: GitHubUserID;
    modified_by?: GitHubUserID[];
    last_modified_by: GitHubUserID;
  };
  photo: string; // url to photo
  versions: IProfile[]; // store previous versions of the user profile
  github_id: GitHubUserID;
  teams: GitHubTeamID[];
}

export type { IProfile };
