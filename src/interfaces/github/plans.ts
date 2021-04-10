export interface APIProject {
  owner_url: string;
  url: string;
  html_url: string;
  columns_url: string;
  id: number;
  node_id: string;
  name: string;
  body: string;
  number: number;
  state: string;
  creator: Creator;
  created_at: string;
  updated_at: string;
  organization_permission: string;
  private: boolean;
}

export interface FullAPIProject {
  owner_url: string;
  url: string;
  html_url: string;
  columns_url: string;
  id: number;
  node_id: string;
  name: string;
  body: string;
  number: number;
  state: string;
  creator: Creator;
  created_at: string;
  updated_at: string;
  organization_permission: string;
  private: boolean;
  columns?: Column[];
}

interface Column {
  url: string;
  project_url: string;
  cards_url: string;
  id: number;
  node_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

export interface Card {
  url: string;
  project_url: string;
  id: number;
  node_id: string;
  note?: string;
  archived: boolean;
  creator: Creator;
  created_at: string;
  updated_at: string;
  column_url: string;
  content_url?: string;
  issue?: Issue;
  column_id: number;
}

export interface Issue {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: User;
  labels: Label[];
  state: string;
  locked: boolean;
  assignee: User;
  assignees: User[];
  milestone: Milestone;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: any;
  author_association: string;
  active_lock_reason?: any;
  body: string;
  closed_by?: any;
  performed_via_github_app?: any;
}

interface Milestone {
  url: string;
  html_url: string;
  labels_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  description?: any;
  creator: User;
  open_issues: number;
  closed_issues: number;
  state: string;
  created_at: string;
  updated_at: string;
  due_on?: any;
  closed_at?: any;
}

interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface Creator extends User {}
