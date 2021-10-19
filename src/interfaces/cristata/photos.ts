import { IProfile } from './profiles';

type GitHubUserID = number;

interface IPhoto {
  _id: string;
  name?: string;
  timestamps?: {
    created_at?: string; // ISO string
    modified_at?: string; // ISO string
  };
  people: {
    photo_created_by?: string;
    uploaded_by?: IProfile;
    modified_by?: IProfile[];
    last_modified_by: IProfile;
  };
  tags?: string[];
  file_type: string;
  photo_url: string;
  dimensions: {
    x: number;
    y: number;
  };
  versions?: IPhoto[]; // store previous versions
  hidden?: boolean;
}

export type { IPhoto };
