interface IAuthUser {
  id: string;
  nodeId: string;
  displayName: string;
  username: string;
  profileUrl: string;
  photos: Photo[];
  provider: string;
  member_status: boolean;
  teams: string[];
  accessToken: string;
  _id: string;
}

interface Photo {
  value: string;
}

export type { IAuthUser };
