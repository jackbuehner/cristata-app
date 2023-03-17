import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  JSON: any;
  ObjectID: any;
  Void: any;
};

export type Activity = {
  __typename?: 'Activity';
  _id: Scalars['ObjectID'];
  added?: Maybe<Scalars['JSON']>;
  archived: Scalars['Boolean'];
  at: Scalars['Date'];
  colName: Scalars['String'];
  deleted?: Maybe<Scalars['JSON']>;
  docId: Scalars['ObjectID'];
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  locked: Scalars['Boolean'];
  name?: Maybe<Scalars['String']>;
  people?: Maybe<CollectionPeople>;
  timestamps?: Maybe<CollectionTimestamps>;
  type: Scalars['String'];
  updated?: Maybe<Scalars['JSON']>;
  userIds: Array<Maybe<User>>;
  yState?: Maybe<Scalars['String']>;
};

export type ActivityModifyInput = {
  added?: InputMaybe<Scalars['JSON']>;
  deleted?: InputMaybe<Scalars['JSON']>;
  updated?: InputMaybe<Scalars['JSON']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type ApiUsage = {
  __typename?: 'ApiUsage';
  billable: Scalars['Float'];
  since: Scalars['Date'];
  total: Scalars['Float'];
};

export type Billing = {
  __typename?: 'Billing';
  features: BillingFeatures;
  stripe_customer_id?: Maybe<Scalars['String']>;
  stripe_subscription_id?: Maybe<Scalars['String']>;
  subscription_active: Scalars['Boolean'];
  subscription_last_payment?: Maybe<Scalars['String']>;
  /** Gets the usage to be used for billing */
  usage: Usage;
};

export type BillingFeatures = {
  __typename?: 'BillingFeatures';
  allowDiskUse: Scalars['Boolean'];
};

export type Collection = {
  __typename?: 'Collection';
  _id: Scalars['ObjectID'];
  archived: Scalars['Boolean'];
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  locked: Scalars['Boolean'];
  people?: Maybe<CollectionPeople>;
  timestamps?: Maybe<CollectionTimestamps>;
  yState?: Maybe<Scalars['String']>;
};

export type CollectionActionAccess = {
  __typename?: 'CollectionActionAccess';
  archive?: Maybe<Scalars['Boolean']>;
  create: Scalars['Boolean'];
  /** Only for the users collection */
  deactivate?: Maybe<Scalars['Boolean']>;
  delete: Scalars['Boolean'];
  get: Scalars['Boolean'];
  hide: Scalars['Boolean'];
  lock: Scalars['Boolean'];
  modify: Scalars['Boolean'];
  /** Only for collections that allow publishing */
  publish?: Maybe<Scalars['Boolean']>;
  watch: Scalars['Boolean'];
};

export type CollectionActivity = {
  __typename?: 'CollectionActivity';
  _id: Scalars['ObjectID'];
  action: Scalars['String'];
  at: Scalars['Date'];
  in: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type CollectionHistory = {
  __typename?: 'CollectionHistory';
  at: Scalars['Date'];
  type: Scalars['String'];
  user?: Maybe<User>;
};

export type CollectionPeople = {
  __typename?: 'CollectionPeople';
  created_by?: Maybe<User>;
  last_modified_by?: Maybe<User>;
  modified_by?: Maybe<Array<Maybe<User>>>;
  watching?: Maybe<Array<Maybe<User>>>;
};

export type CollectionPermissions = {
  __typename?: 'CollectionPermissions';
  teams: Array<Maybe<Scalars['String']>>;
  users: Array<Maybe<User>>;
};

export type CollectionPermissionsInput = {
  teams?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  users?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
};

export type CollectionTimestamps = {
  __typename?: 'CollectionTimestamps';
  created_at: Scalars['Date'];
  modified_at: Scalars['Date'];
};

export type Configuration = {
  __typename?: 'Configuration';
  apps: ConfigurationApps;
  collection?: Maybe<ConfigurationCollection>;
  collections?: Maybe<Array<Maybe<ConfigurationCollection>>>;
  dashboard: ConfigurationDashboard;
  navigation: ConfigurationNavigation;
  security: ConfigurationSecurity;
  void?: Maybe<Scalars['Void']>;
};


export type ConfigurationCollectionArgs = {
  name: Scalars['String'];
};

export type ConfigurationApps = {
  __typename?: 'ConfigurationApps';
  profiles: ConfigurationProfilesApp;
  void?: Maybe<Scalars['Void']>;
};

export type ConfigurationCollection = {
  __typename?: 'ConfigurationCollection';
  by: ConfigurationCollectionBy;
  /** Whether the current user has 'create' and 'get' permisson on this collection */
  canCreateAndGet?: Maybe<Scalars['Boolean']>;
  canPublish?: Maybe<Scalars['Boolean']>;
  generationOptions?: Maybe<ConfigurationCollectionGenerationOptions>;
  name: Scalars['String'];
  pluralName: Scalars['String'];
  raw: Scalars['JSON'];
  /** Use SchemaDef type from genSchema.ts */
  schemaDef: Scalars['JSON'];
  withPermissions?: Maybe<Scalars['Boolean']>;
};

export type ConfigurationCollectionBy = {
  __typename?: 'ConfigurationCollectionBy';
  many: Scalars['String'];
  one: Scalars['String'];
};

export type ConfigurationCollectionGenerationOptions = {
  __typename?: 'ConfigurationCollectionGenerationOptions';
  disableArchiveMutation?: Maybe<Scalars['Boolean']>;
  disableCreateMutation?: Maybe<Scalars['Boolean']>;
  disableHideMutation?: Maybe<Scalars['Boolean']>;
  disablePublishMutation?: Maybe<Scalars['Boolean']>;
  dynamicPreviewHref?: Maybe<Scalars['String']>;
  independentPublishedDocCopy?: Maybe<Scalars['Boolean']>;
  mandatoryWatchers?: Maybe<Array<Maybe<Scalars['String']>>>;
  nameField?: Maybe<Scalars['String']>;
  previewUrl?: Maybe<Scalars['String']>;
};

export type ConfigurationDashboard = {
  __typename?: 'ConfigurationDashboard';
  collectionRows: Array<Maybe<ConfigurationDashboardCollectionRow>>;
};

export type ConfigurationDashboardCollectionRow = {
  __typename?: 'ConfigurationDashboardCollectionRow';
  arrPath: Scalars['String'];
  dataKeys: ConfigurationDashboardCollectionRowDataKeys;
  header: ConfigurationDashboardCollectionRowHeader;
  query: Scalars['String'];
  to: ConfigurationDashboardCollectionRowTo;
};

export type ConfigurationDashboardCollectionRowDataKeys = {
  __typename?: 'ConfigurationDashboardCollectionRowDataKeys';
  _id: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  lastModifiedAt: Scalars['String'];
  lastModifiedBy: Scalars['String'];
  name: Scalars['String'];
  photo?: Maybe<Scalars['String']>;
};

export type ConfigurationDashboardCollectionRowHeader = {
  __typename?: 'ConfigurationDashboardCollectionRowHeader';
  icon: Scalars['String'];
  label: Scalars['String'];
};

export type ConfigurationDashboardCollectionRowTo = {
  __typename?: 'ConfigurationDashboardCollectionRowTo';
  idPrefix: Scalars['String'];
  idSuffix: Scalars['String'];
};

export type ConfigurationNavigation = {
  __typename?: 'ConfigurationNavigation';
  /** Get the items to use for the main navigation panel in the app. */
  main: Array<Maybe<ConfigurationNavigationMainItem>>;
  /** Get the groups of items to use for the sub navigation panel in the app. */
  sub: Array<Maybe<ConfigurationNavigationSubGroup>>;
};


export type ConfigurationNavigationSubArgs = {
  key: Scalars['String'];
};

export type ConfigurationNavigationMainItem = {
  __typename?: 'ConfigurationNavigationMainItem';
  icon: Scalars['String'];
  label: Scalars['String'];
  subNav?: Maybe<Scalars['String']>;
  to: Scalars['String'];
};

export type ConfigurationNavigationSubGroup = {
  __typename?: 'ConfigurationNavigationSubGroup';
  items: Array<Maybe<ConfigurationNavigationSubGroupItems>>;
  label: Scalars['String'];
  uuid: Scalars['String'];
};

export type ConfigurationNavigationSubGroupInput = {
  items: Array<InputMaybe<ConfigurationNavigationSubGroupItemsInput>>;
  label: Scalars['String'];
  uuid: Scalars['String'];
};

export type ConfigurationNavigationSubGroupItems = {
  __typename?: 'ConfigurationNavigationSubGroupItems';
  hiddenFilter?: Maybe<ConfigurationNavigationSubGroupItemsHiddenFilter>;
  icon: Scalars['String'];
  label: Scalars['String'];
  to: Scalars['String'];
  uuid: Scalars['String'];
};

export type ConfigurationNavigationSubGroupItemsHiddenFilter = {
  __typename?: 'ConfigurationNavigationSubGroupItemsHiddenFilter';
  notInTeam?: Maybe<Array<Scalars['String']>>;
};

export type ConfigurationNavigationSubGroupItemsHiddenFilterInput = {
  notInTeam?: InputMaybe<Array<Scalars['String']>>;
};

export type ConfigurationNavigationSubGroupItemsInput = {
  icon: Scalars['String'];
  isHidden?: InputMaybe<ConfigurationNavigationSubGroupItemsHiddenFilterInput>;
  label: Scalars['String'];
  to: Scalars['String'];
  uuid: Scalars['String'];
};

export type ConfigurationProfilesApp = {
  __typename?: 'ConfigurationProfilesApp';
  defaultFieldDescriptions: ConfigurationProfilesAppFieldDescriptions;
  fieldDescriptions: ConfigurationProfilesAppFieldDescriptions;
};

export type ConfigurationProfilesAppFieldDescriptions = {
  __typename?: 'ConfigurationProfilesAppFieldDescriptions';
  biography: Scalars['String'];
  email: Scalars['String'];
  name: Scalars['String'];
  phone: Scalars['String'];
  title: Scalars['String'];
  twitter: Scalars['String'];
};

export type ConfigurationSecurity = {
  __typename?: 'ConfigurationSecurity';
  introspection: Scalars['Boolean'];
  secrets: ConfigurationSecuritySecrets;
  tokens: Array<Maybe<ConfigurationSecurityToken>>;
};

export type ConfigurationSecuritySecrets = {
  __typename?: 'ConfigurationSecuritySecrets';
  fathom?: Maybe<ConfigurationSecuritySecretsFathom>;
};

export type ConfigurationSecuritySecretsFathom = {
  __typename?: 'ConfigurationSecuritySecretsFathom';
  dashboardPassword: Scalars['String'];
  siteId: Scalars['String'];
};

export type ConfigurationSecurityToken = {
  __typename?: 'ConfigurationSecurityToken';
  expires: Scalars['String'];
  name: Scalars['String'];
  scope: ConfigurationSecurityTokenScope;
  token: Scalars['String'];
};

export type ConfigurationSecurityTokenScope = {
  __typename?: 'ConfigurationSecurityTokenScope';
  admin?: Maybe<Scalars['Boolean']>;
};

export type Content = {
  __typename?: 'Content';
  _id: Scalars['ObjectID'];
  alert?: Maybe<Scalars['String']>;
  aliases?: Maybe<Array<Maybe<Scalars['String']>>>;
  archived: Scalars['Boolean'];
  body: Scalars['String'];
  center_text?: Maybe<Scalars['Boolean']>;
  dual_columns?: Maybe<Scalars['Boolean']>;
  enable_password_protection: Scalars['Boolean'];
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  locked: Scalars['Boolean'];
  name: Scalars['String'];
  people?: Maybe<PublishableCollectionPeople>;
  quick_links?: Maybe<Array<Maybe<ContentQuick_Links>>>;
  show_table_of_contents?: Maybe<Scalars['Boolean']>;
  slug: Scalars['String'];
  stage?: Maybe<Scalars['Float']>;
  timestamps?: Maybe<PublishableCollectionTimestamps>;
  yState?: Maybe<Scalars['String']>;
};

export type ContentModifyInput = {
  alert?: InputMaybe<Scalars['String']>;
  aliases?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  body?: InputMaybe<Scalars['String']>;
  center_text?: InputMaybe<Scalars['Boolean']>;
  dual_columns?: InputMaybe<Scalars['Boolean']>;
  enable_password_protection?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  quick_links?: InputMaybe<Array<InputMaybe<ContentModifyInputQuick_Links>>>;
  show_table_of_contents?: InputMaybe<Scalars['Boolean']>;
  slug?: InputMaybe<Scalars['String']>;
  stage?: InputMaybe<Scalars['Float']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type ContentModifyInputQuick_Links = {
  label?: InputMaybe<Scalars['String']>;
  path?: InputMaybe<Scalars['String']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type ContentQuick_Links = {
  __typename?: 'ContentQuick_links';
  label?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
};

export type File = {
  __typename?: 'File';
  _id: Scalars['ObjectID'];
  archived: Scalars['Boolean'];
  file_type: Scalars['String'];
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  href?: Maybe<Scalars['String']>;
  locked: Scalars['Boolean'];
  name: Scalars['String'];
  note?: Maybe<Scalars['String']>;
  people?: Maybe<CollectionPeople>;
  require_auth?: Maybe<Scalars['Boolean']>;
  size_bytes: Scalars['Int'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  timestamps?: Maybe<CollectionTimestamps>;
  uuid: Scalars['String'];
  yState?: Maybe<Scalars['String']>;
};

export type FileCollectionActionAccess = {
  __typename?: 'FileCollectionActionAccess';
  archive?: Maybe<FileCollectionActionAccessObject>;
  bypassDocPermissions?: Maybe<FileCollectionActionAccessObject>;
  create?: Maybe<FileCollectionActionAccessObject>;
  delete?: Maybe<FileCollectionActionAccessObject>;
  get?: Maybe<FileCollectionActionAccessObject>;
  hide?: Maybe<FileCollectionActionAccessObject>;
  lock?: Maybe<FileCollectionActionAccessObject>;
  modify?: Maybe<FileCollectionActionAccessObject>;
  publish?: Maybe<FileCollectionActionAccessObject>;
  watch?: Maybe<FileCollectionActionAccessObject>;
};

export type FileCollectionActionAccessInput = {
  archive?: InputMaybe<FileCollectionActionAccessObjectInput>;
  bypassDocPermissions?: InputMaybe<FileCollectionActionAccessObjectInput>;
  create?: InputMaybe<FileCollectionActionAccessObjectInput>;
  delete?: InputMaybe<FileCollectionActionAccessObjectInput>;
  get?: InputMaybe<FileCollectionActionAccessObjectInput>;
  hide?: InputMaybe<FileCollectionActionAccessObjectInput>;
  lock?: InputMaybe<FileCollectionActionAccessObjectInput>;
  modify?: InputMaybe<FileCollectionActionAccessObjectInput>;
  publish?: InputMaybe<FileCollectionActionAccessObjectInput>;
  watch?: InputMaybe<FileCollectionActionAccessObjectInput>;
};

export type FileCollectionActionAccessObject = {
  __typename?: 'FileCollectionActionAccessObject';
  teams?: Maybe<Array<Scalars['String']>>;
  users?: Maybe<Array<Scalars['String']>>;
};

export type FileCollectionActionAccessObjectInput = {
  teams?: InputMaybe<Array<Scalars['String']>>;
  users?: InputMaybe<Array<Scalars['String']>>;
};

export type FileModifyInput = {
  name?: InputMaybe<Scalars['String']>;
  note?: InputMaybe<Scalars['String']>;
  require_auth?: InputMaybe<Scalars['Boolean']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  yState?: InputMaybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  billing: MutationBilling;
  /**
   * Set whether an existing Content document is archived.
   * This mutation sets archived: true by default.
   * Archived Content documents should not be presented to clients
   * unless they explicitly request to view archived items.
   */
  contentArchive?: Maybe<Content>;
  /**
   * Clone an existing Content document.
   * Certain fields are removed from the document (_id, slug, and any that start with __)
   */
  contentClone?: Maybe<Content>;
  /** Create a new Content document. */
  contentCreate?: Maybe<Content>;
  /** Deletes a Content document. */
  contentDelete?: Maybe<Scalars['Void']>;
  /**
   * Set whether an existing Content document is hidden.
   * This mutation sets hidden: true by default.
   * Hidden Content documents should not be presented to clients;
   * this is analogous to moving the document to a deleted items folder
   */
  contentHide?: Maybe<Content>;
  /**
   * Set whether an existing Content document is locked.
   * This mutation sets locked: true by default.
   * Locked Content documents should only be editable by the server
   * and by admins.
   */
  contentLock?: Maybe<Content>;
  /** Modify an existing Content document. */
  contentModify?: Maybe<Content>;
  /** Publishes an existing Content document. */
  contentPublish?: Maybe<Content>;
  /**
   * Add a watcher to a Content document.
   * This mutation adds the watcher by default. If a user _id is
   * not specified, for the watcher, the currently authenticated user will
   * be used.
   */
  contentWatch?: Maybe<Content>;
  deleteCollection?: Maybe<Scalars['Void']>;
  /**
   * Clone an existing File document.
   * Certain fields are removed from the document (_id, slug, and any that start with __)
   */
  fileClone?: Maybe<File>;
  /** Sets the action access config for the File collection. */
  fileCollectionSetActionAccess?: Maybe<FileCollectionActionAccess>;
  /** Create a new File document. */
  fileCreate?: Maybe<File>;
  /** Modify an existing File document. */
  fileModify?: Maybe<File>;
  /**
   * Set whether an existing Newsletter document is archived.
   * This mutation sets archived: true by default.
   * Archived Newsletter documents should not be presented to clients
   * unless they explicitly request to view archived items.
   */
  newsletterArchive?: Maybe<Newsletter>;
  /**
   * Clone an existing Newsletter document.
   * Certain fields are removed from the document (_id, slug, and any that start with __)
   */
  newsletterClone?: Maybe<Newsletter>;
  /** Create a new Newsletter document. */
  newsletterCreate?: Maybe<Newsletter>;
  /** Deletes a Newsletter document. */
  newsletterDelete?: Maybe<Scalars['Void']>;
  /**
   * Set whether an existing Newsletter document is hidden.
   * This mutation sets hidden: true by default.
   * Hidden Newsletter documents should not be presented to clients;
   * this is analogous to moving the document to a deleted items folder
   */
  newsletterHide?: Maybe<Newsletter>;
  /**
   * Set whether an existing Newsletter document is locked.
   * This mutation sets locked: true by default.
   * Locked Newsletter documents should only be editable by the server
   * and by admins.
   */
  newsletterLock?: Maybe<Newsletter>;
  /** Modify an existing Newsletter document. */
  newsletterModify?: Maybe<Newsletter>;
  /** Publishes an existing Newsletter document. */
  newsletterPublish?: Maybe<Newsletter>;
  /**
   * Add a watcher to a Newsletter document.
   * This mutation adds the watcher by default. If a user _id is
   * not specified, for the watcher, the currently authenticated user will
   * be used.
   */
  newsletterWatch?: Maybe<Newsletter>;
  /**
   * Clone an existing Photo document.
   * Certain fields are removed from the document (_id, slug, and any that start with __)
   */
  photoClone?: Maybe<Photo>;
  /** Sets the action access config for the Photo collection. */
  photoCollectionSetActionAccess?: Maybe<PhotoCollectionActionAccess>;
  /** Create a new Photo document. */
  photoCreate?: Maybe<Photo>;
  /** Modify an existing Photo document. */
  photoModify?: Maybe<Photo>;
  /**
   * Set whether an existing Post document is archived.
   * This mutation sets archived: true by default.
   * Archived Post documents should not be presented to clients
   * unless they explicitly request to view archived items.
   */
  postArchive?: Maybe<Post>;
  /**
   * Clone an existing Post document.
   * Certain fields are removed from the document (_id, slug, and any that start with __)
   */
  postClone?: Maybe<Post>;
  /** Create a new Post document. */
  postCreate?: Maybe<Post>;
  /** Deletes a Post document. */
  postDelete?: Maybe<Scalars['Void']>;
  /**
   * Set whether an existing Post document is hidden.
   * This mutation sets hidden: true by default.
   * Hidden Post documents should not be presented to clients;
   * this is analogous to moving the document to a deleted items folder
   */
  postHide?: Maybe<Post>;
  /**
   * Set whether an existing Post document is locked.
   * This mutation sets locked: true by default.
   * Locked Post documents should only be editable by the server
   * and by admins.
   */
  postLock?: Maybe<Post>;
  /** Modify an existing Post document. */
  postModify?: Maybe<Post>;
  /** Publishes an existing Post document. */
  postPublish?: Maybe<Post>;
  /**
   * Add a watcher to a Post document.
   * This mutation adds the watcher by default. If a user _id is
   * not specified, for the watcher, the currently authenticated user will
   * be used.
   */
  postWatch?: Maybe<Post>;
  /**
   * Set the groups of items to use for the sub navigation panel in the app.
   * System groups that are provided in the query are removed upon receipt.
   */
  setConfigurationNavigationSub: Array<Maybe<ConfigurationNavigationSubGroup>>;
  setProfilesAppFieldDescription?: Maybe<Scalars['Void']>;
  setRawConfigurationCollection?: Maybe<Scalars['JSON']>;
  setSecret: Scalars['String'];
  /**
   * Set whether an existing StandaloneEmail document is archived.
   * This mutation sets archived: true by default.
   * Archived StandaloneEmail documents should not be presented to clients
   * unless they explicitly request to view archived items.
   */
  standaloneEmailArchive?: Maybe<StandaloneEmail>;
  /**
   * Clone an existing StandaloneEmail document.
   * Certain fields are removed from the document (_id, slug, and any that start with __)
   */
  standaloneEmailClone?: Maybe<StandaloneEmail>;
  /** Create a new StandaloneEmail document. */
  standaloneEmailCreate?: Maybe<StandaloneEmail>;
  /** Deletes a StandaloneEmail document. */
  standaloneEmailDelete?: Maybe<Scalars['Void']>;
  /**
   * Set whether an existing StandaloneEmail document is hidden.
   * This mutation sets hidden: true by default.
   * Hidden StandaloneEmail documents should not be presented to clients;
   * this is analogous to moving the document to a deleted items folder
   */
  standaloneEmailHide?: Maybe<StandaloneEmail>;
  /**
   * Set whether an existing StandaloneEmail document is locked.
   * This mutation sets locked: true by default.
   * Locked StandaloneEmail documents should only be editable by the server
   * and by admins.
   */
  standaloneEmailLock?: Maybe<StandaloneEmail>;
  /** Modify an existing StandaloneEmail document. */
  standaloneEmailModify?: Maybe<StandaloneEmail>;
  /** Publishes an existing StandaloneEmail document. */
  standaloneEmailPublish?: Maybe<StandaloneEmail>;
  /**
   * Add a watcher to a StandaloneEmail document.
   * This mutation adds the watcher by default. If a user _id is
   * not specified, for the watcher, the currently authenticated user will
   * be used.
   */
  standaloneEmailWatch?: Maybe<StandaloneEmail>;
  /**
   * Set whether an existing Team document is archived.
   * This mutation sets archived: true by default.
   * Archived Team documents should not be presented to clients
   * unless they explicitly request to view archived items.
   */
  teamArchive?: Maybe<Team>;
  /**
   * Clone an existing Team document.
   * Certain fields are removed from the document (_id, slug, and any that start with __)
   */
  teamClone?: Maybe<Team>;
  /** Create a new Team document. */
  teamCreate?: Maybe<Team>;
  /** Deletes a Team document. */
  teamDelete?: Maybe<Scalars['Void']>;
  /**
   * Set whether an existing Team document is hidden.
   * This mutation sets hidden: true by default.
   * Hidden Team documents should not be presented to clients;
   * this is analogous to moving the document to a deleted items folder
   */
  teamHide?: Maybe<Team>;
  /**
   * Set whether an existing Team document is locked.
   * This mutation sets locked: true by default.
   * Locked Team documents should only be editable by the server
   * and by admins.
   */
  teamLock?: Maybe<Team>;
  /** Modify an existing Team document. */
  teamModify?: Maybe<Team>;
  /**
   * Add a watcher to a Team document.
   * This mutation adds the watcher by default. If a user _id is
   * not specified, for the watcher, the currently authenticated user will
   * be used.
   */
  teamWatch?: Maybe<Team>;
  /**
   * Clone an existing User document.
   * Certain fields are removed from the document (_id, slug, and any that start with __)
   */
  userClone?: Maybe<User>;
  /** Sets the action access config for the User collection. */
  userCollectionSetActionAccess?: Maybe<UserCollectionActionAccess>;
  /** Create a new User document. */
  userCreate?: Maybe<User>;
  /**
   * Toggle whether aan existing user is deactivated.
   * This mutation deactivates by default.
   */
  userDeactivate?: Maybe<User>;
  /**
   * Migrate a user without a local account.
   * Sends a email with the new user's new username and temporary password.
   * The user must sign in with the local account at least once within 48
   * hours to prevent their account from becoming inaccessable.
   */
  userMigrateToPassword?: Maybe<User>;
  /** Modify an existing User document. */
  userModify?: Maybe<User>;
  /** Change the password for the current user. */
  userPasswordChange?: Maybe<User>;
  /** Resend an invitation for a user with a temporary password. */
  userResendInvite?: Maybe<User>;
  /**
   * Set whether an existing WebConfig document is archived.
   * This mutation sets archived: true by default.
   * Archived WebConfig documents should not be presented to clients
   * unless they explicitly request to view archived items.
   */
  webConfigArchive?: Maybe<WebConfig>;
  /**
   * Clone an existing WebConfig document.
   * Certain fields are removed from the document (_id, slug, and any that start with __)
   */
  webConfigClone?: Maybe<WebConfig>;
  /** Create a new WebConfig document. */
  webConfigCreate?: Maybe<WebConfig>;
  /** Deletes a WebConfig document. */
  webConfigDelete?: Maybe<Scalars['Void']>;
  /**
   * Set whether an existing WebConfig document is hidden.
   * This mutation sets hidden: true by default.
   * Hidden WebConfig documents should not be presented to clients;
   * this is analogous to moving the document to a deleted items folder
   */
  webConfigHide?: Maybe<WebConfig>;
  /**
   * Set whether an existing WebConfig document is locked.
   * This mutation sets locked: true by default.
   * Locked WebConfig documents should only be editable by the server
   * and by admins.
   */
  webConfigLock?: Maybe<WebConfig>;
  /** Modify an existing WebConfig document. */
  webConfigModify?: Maybe<WebConfig>;
  /**
   * Add a watcher to a WebConfig document.
   * This mutation adds the watcher by default. If a user _id is
   * not specified, for the watcher, the currently authenticated user will
   * be used.
   */
  webConfigWatch?: Maybe<WebConfig>;
};


export type MutationContentArchiveArgs = {
  _id: Scalars['ObjectID'];
  archive?: InputMaybe<Scalars['Boolean']>;
};


export type MutationContentCloneArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationContentCreateArgs = {
  alert?: InputMaybe<Scalars['String']>;
  aliases?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  body?: InputMaybe<Scalars['String']>;
  center_text?: InputMaybe<Scalars['Boolean']>;
  dual_columns?: InputMaybe<Scalars['Boolean']>;
  enable_password_protection?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  show_table_of_contents?: InputMaybe<Scalars['Boolean']>;
  slug?: InputMaybe<Scalars['String']>;
  stage?: InputMaybe<Scalars['Float']>;
};


export type MutationContentDeleteArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationContentHideArgs = {
  _id: Scalars['ObjectID'];
  hide?: InputMaybe<Scalars['Boolean']>;
};


export type MutationContentLockArgs = {
  _id: Scalars['ObjectID'];
  lock?: InputMaybe<Scalars['Boolean']>;
};


export type MutationContentModifyArgs = {
  _id: Scalars['ObjectID'];
  input: ContentModifyInput;
};


export type MutationContentPublishArgs = {
  _id: Scalars['ObjectID'];
  publish?: InputMaybe<Scalars['Boolean']>;
  published_at?: InputMaybe<Scalars['Date']>;
};


export type MutationContentWatchArgs = {
  _id: Scalars['ObjectID'];
  watch?: InputMaybe<Scalars['Boolean']>;
  watcher?: InputMaybe<Scalars['ObjectID']>;
};


export type MutationDeleteCollectionArgs = {
  name: Scalars['String'];
};


export type MutationFileCloneArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationFileCollectionSetActionAccessArgs = {
  actionAccess: FileCollectionActionAccessInput;
};


export type MutationFileCreateArgs = {
  file_type: Scalars['String'];
  name: Scalars['String'];
  note?: InputMaybe<Scalars['String']>;
  require_auth?: InputMaybe<Scalars['Boolean']>;
  size_bytes: Scalars['Int'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  uuid: Scalars['String'];
};


export type MutationFileModifyArgs = {
  _id: Scalars['ObjectID'];
  input: FileModifyInput;
};


export type MutationNewsletterArchiveArgs = {
  _id: Scalars['ObjectID'];
  archive?: InputMaybe<Scalars['Boolean']>;
};


export type MutationNewsletterCloneArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationNewsletterCreateArgs = {
  advancement_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  announcements?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  camping_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  fundraiser_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  high_adventure_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  name?: InputMaybe<Scalars['String']>;
  past_announcements?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  pinned_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  service_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  stage?: InputMaybe<Scalars['Float']>;
};


export type MutationNewsletterDeleteArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationNewsletterHideArgs = {
  _id: Scalars['ObjectID'];
  hide?: InputMaybe<Scalars['Boolean']>;
};


export type MutationNewsletterLockArgs = {
  _id: Scalars['ObjectID'];
  lock?: InputMaybe<Scalars['Boolean']>;
};


export type MutationNewsletterModifyArgs = {
  _id: Scalars['ObjectID'];
  input: NewsletterModifyInput;
};


export type MutationNewsletterPublishArgs = {
  _id: Scalars['ObjectID'];
  publish?: InputMaybe<Scalars['Boolean']>;
  published_at?: InputMaybe<Scalars['Date']>;
};


export type MutationNewsletterWatchArgs = {
  _id: Scalars['ObjectID'];
  watch?: InputMaybe<Scalars['Boolean']>;
  watcher?: InputMaybe<Scalars['ObjectID']>;
};


export type MutationPhotoCloneArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationPhotoCollectionSetActionAccessArgs = {
  actionAccess: PhotoCollectionActionAccessInput;
};


export type MutationPhotoCreateArgs = {
  file_type: Scalars['String'];
  height: Scalars['Int'];
  json?: InputMaybe<Scalars['JSON']>;
  legacy_caption?: InputMaybe<Scalars['String']>;
  legacy_thumbnail_id?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  note?: InputMaybe<Scalars['String']>;
  require_auth?: InputMaybe<Scalars['Boolean']>;
  size_bytes: Scalars['Int'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  uuid: Scalars['String'];
  width: Scalars['Int'];
};


export type MutationPhotoModifyArgs = {
  _id: Scalars['ObjectID'];
  input: PhotoModifyInput;
};


export type MutationPostArchiveArgs = {
  _id: Scalars['ObjectID'];
  archive?: InputMaybe<Scalars['Boolean']>;
};


export type MutationPostCloneArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationPostCreateArgs = {
  body?: InputMaybe<Scalars['String']>;
  button_text?: InputMaybe<Scalars['String']>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  description: Scalars['String'];
  enable_password_protection?: InputMaybe<Scalars['Boolean']>;
  legacy_markdown?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  slug?: InputMaybe<Scalars['String']>;
  stage?: InputMaybe<Scalars['Float']>;
  submitted_by: Array<InputMaybe<Scalars['String']>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


export type MutationPostDeleteArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationPostHideArgs = {
  _id: Scalars['ObjectID'];
  hide?: InputMaybe<Scalars['Boolean']>;
};


export type MutationPostLockArgs = {
  _id: Scalars['ObjectID'];
  lock?: InputMaybe<Scalars['Boolean']>;
};


export type MutationPostModifyArgs = {
  _id: Scalars['ObjectID'];
  input: PostModifyInput;
};


export type MutationPostPublishArgs = {
  _id: Scalars['ObjectID'];
  publish?: InputMaybe<Scalars['Boolean']>;
  published_at?: InputMaybe<Scalars['Date']>;
};


export type MutationPostWatchArgs = {
  _id: Scalars['ObjectID'];
  watch?: InputMaybe<Scalars['Boolean']>;
  watcher?: InputMaybe<Scalars['ObjectID']>;
};


export type MutationSetConfigurationNavigationSubArgs = {
  input: Array<InputMaybe<ConfigurationNavigationSubGroupInput>>;
  key: Scalars['String'];
};


export type MutationSetProfilesAppFieldDescriptionArgs = {
  description?: InputMaybe<Scalars['String']>;
  field: Scalars['String'];
};


export type MutationSetRawConfigurationCollectionArgs = {
  name: Scalars['String'];
  raw?: InputMaybe<Scalars['JSON']>;
};


export type MutationSetSecretArgs = {
  key: Scalars['String'];
  value: Scalars['String'];
};


export type MutationStandaloneEmailArchiveArgs = {
  _id: Scalars['ObjectID'];
  archive?: InputMaybe<Scalars['Boolean']>;
};


export type MutationStandaloneEmailCloneArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationStandaloneEmailCreateArgs = {
  body?: InputMaybe<Scalars['String']>;
  header_date: Scalars['Date'];
  legacy_markdown?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  sender_name: Scalars['String'];
  stage?: InputMaybe<Scalars['Float']>;
};


export type MutationStandaloneEmailDeleteArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationStandaloneEmailHideArgs = {
  _id: Scalars['ObjectID'];
  hide?: InputMaybe<Scalars['Boolean']>;
};


export type MutationStandaloneEmailLockArgs = {
  _id: Scalars['ObjectID'];
  lock?: InputMaybe<Scalars['Boolean']>;
};


export type MutationStandaloneEmailModifyArgs = {
  _id: Scalars['ObjectID'];
  input: StandaloneEmailModifyInput;
};


export type MutationStandaloneEmailPublishArgs = {
  _id: Scalars['ObjectID'];
  publish?: InputMaybe<Scalars['Boolean']>;
  published_at?: InputMaybe<Scalars['Date']>;
};


export type MutationStandaloneEmailWatchArgs = {
  _id: Scalars['ObjectID'];
  watch?: InputMaybe<Scalars['Boolean']>;
  watcher?: InputMaybe<Scalars['ObjectID']>;
};


export type MutationTeamArchiveArgs = {
  _id: Scalars['ObjectID'];
  archive?: InputMaybe<Scalars['Boolean']>;
};


export type MutationTeamCloneArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationTeamCreateArgs = {
  members: Array<InputMaybe<Scalars['ObjectID']>>;
  name: Scalars['String'];
  organizers: Array<InputMaybe<Scalars['ObjectID']>>;
  slug: Scalars['String'];
};


export type MutationTeamDeleteArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationTeamHideArgs = {
  _id: Scalars['ObjectID'];
  hide?: InputMaybe<Scalars['Boolean']>;
};


export type MutationTeamLockArgs = {
  _id: Scalars['ObjectID'];
  lock?: InputMaybe<Scalars['Boolean']>;
};


export type MutationTeamModifyArgs = {
  _id: Scalars['ObjectID'];
  input: TeamModifyInput;
};


export type MutationTeamWatchArgs = {
  _id: Scalars['ObjectID'];
  watch?: InputMaybe<Scalars['Boolean']>;
  watcher?: InputMaybe<Scalars['ObjectID']>;
};


export type MutationUserCloneArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationUserCollectionSetActionAccessArgs = {
  actionAccess: UserCollectionActionAccessInput;
};


export type MutationUserCreateArgs = {
  biography?: InputMaybe<Scalars['String']>;
  current_title?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  flags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  github_id?: InputMaybe<Scalars['Int']>;
  group?: InputMaybe<Scalars['Float']>;
  last_magic_code?: InputMaybe<Scalars['String']>;
  methods?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['Float']>;
  photo?: InputMaybe<Scalars['String']>;
  retired?: InputMaybe<Scalars['Boolean']>;
  slug?: InputMaybe<Scalars['String']>;
  twitter?: InputMaybe<Scalars['String']>;
  username: Scalars['String'];
};


export type MutationUserDeactivateArgs = {
  _id: Scalars['ObjectID'];
  deactivate?: InputMaybe<Scalars['Boolean']>;
};


export type MutationUserMigrateToPasswordArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationUserModifyArgs = {
  _id: Scalars['ObjectID'];
  input: UserModifyInput;
};


export type MutationUserPasswordChangeArgs = {
  newPassword: Scalars['String'];
  oldPassword: Scalars['String'];
};


export type MutationUserResendInviteArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationWebConfigArchiveArgs = {
  _id: Scalars['ObjectID'];
  archive?: InputMaybe<Scalars['Boolean']>;
};


export type MutationWebConfigCloneArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationWebConfigCreateArgs = {
  config?: InputMaybe<Scalars['JSON']>;
  name: Scalars['String'];
};


export type MutationWebConfigDeleteArgs = {
  _id: Scalars['ObjectID'];
};


export type MutationWebConfigHideArgs = {
  _id: Scalars['ObjectID'];
  hide?: InputMaybe<Scalars['Boolean']>;
};


export type MutationWebConfigLockArgs = {
  _id: Scalars['ObjectID'];
  lock?: InputMaybe<Scalars['Boolean']>;
};


export type MutationWebConfigModifyArgs = {
  _id: Scalars['ObjectID'];
  input: WebConfigModifyInput;
};


export type MutationWebConfigWatchArgs = {
  _id: Scalars['ObjectID'];
  watch?: InputMaybe<Scalars['Boolean']>;
  watcher?: InputMaybe<Scalars['ObjectID']>;
};

export type MutationBilling = {
  __typename?: 'MutationBilling';
  features: MutationBillingFeatures;
};

export type MutationBillingFeatures = {
  __typename?: 'MutationBillingFeatures';
  allowDiskUse: Scalars['Boolean'];
};


export type MutationBillingFeaturesAllowDiskUseArgs = {
  allowDiskUse: Scalars['Boolean'];
};

export type Newsletter = {
  __typename?: 'Newsletter';
  _id: Scalars['ObjectID'];
  advancement_mini_posts?: Maybe<Array<Maybe<Post>>>;
  announcements?: Maybe<Array<Maybe<Post>>>;
  archived: Scalars['Boolean'];
  camping_mini_posts?: Maybe<Array<Maybe<Post>>>;
  fundraiser_mini_posts?: Maybe<Array<Maybe<Post>>>;
  hidden: Scalars['Boolean'];
  high_adventure_mini_posts?: Maybe<Array<Maybe<Post>>>;
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  locked: Scalars['Boolean'];
  manual_calendar?: Maybe<Array<Maybe<NewsletterManual_Calendar>>>;
  name: Scalars['String'];
  past_announcements?: Maybe<Array<Maybe<Post>>>;
  people?: Maybe<PublishableCollectionPeople>;
  pinned_mini_posts?: Maybe<Array<Maybe<Post>>>;
  service_mini_posts?: Maybe<Array<Maybe<Post>>>;
  stage?: Maybe<Scalars['Float']>;
  timestamps?: Maybe<PublishableCollectionTimestamps>;
  yState?: Maybe<Scalars['String']>;
};

export type NewsletterManual_Calendar = {
  __typename?: 'NewsletterManual_calendar';
  events?: Maybe<Scalars['String']>;
  month?: Maybe<Scalars['String']>;
};

export type NewsletterModifyInput = {
  advancement_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  announcements?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  camping_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  fundraiser_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  high_adventure_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  manual_calendar?: InputMaybe<Array<InputMaybe<NewsletterModifyInputManual_Calendar>>>;
  name?: InputMaybe<Scalars['String']>;
  past_announcements?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  pinned_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  service_mini_posts?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  stage?: InputMaybe<Scalars['Float']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type NewsletterModifyInputManual_Calendar = {
  events?: InputMaybe<Scalars['String']>;
  month?: InputMaybe<Scalars['String']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type PagedActivity = {
  __typename?: 'PagedActivity';
  docs: Array<Maybe<Activity>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedCollectionActivity = {
  __typename?: 'PagedCollectionActivity';
  docs: Array<Maybe<CollectionActivity>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedContent = {
  __typename?: 'PagedContent';
  docs: Array<Maybe<Content>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedFile = {
  __typename?: 'PagedFile';
  docs: Array<Maybe<File>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedNewsletter = {
  __typename?: 'PagedNewsletter';
  docs: Array<Maybe<Newsletter>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedPhoto = {
  __typename?: 'PagedPhoto';
  docs: Array<Maybe<Photo>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedPost = {
  __typename?: 'PagedPost';
  docs: Array<Maybe<Post>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedPrunedContent = {
  __typename?: 'PagedPrunedContent';
  docs: Array<Maybe<PrunedContent>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedPrunedNewsletter = {
  __typename?: 'PagedPrunedNewsletter';
  docs: Array<Maybe<PrunedNewsletter>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedPrunedPost = {
  __typename?: 'PagedPrunedPost';
  docs: Array<Maybe<PrunedPost>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedPrunedStandaloneEmail = {
  __typename?: 'PagedPrunedStandaloneEmail';
  docs: Array<Maybe<PrunedStandaloneEmail>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedPrunedUser = {
  __typename?: 'PagedPrunedUser';
  docs: Array<Maybe<PrunedUser>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedPrunedWebConfig = {
  __typename?: 'PagedPrunedWebConfig';
  docs: Array<Maybe<PrunedWebConfig>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedStandaloneEmail = {
  __typename?: 'PagedStandaloneEmail';
  docs: Array<Maybe<StandaloneEmail>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedTeam = {
  __typename?: 'PagedTeam';
  docs: Array<Maybe<Team>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedUser = {
  __typename?: 'PagedUser';
  docs: Array<Maybe<User>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type PagedWebConfig = {
  __typename?: 'PagedWebConfig';
  docs: Array<Maybe<WebConfig>>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  nextPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pagingCounter?: Maybe<Scalars['Int']>;
  prevPage?: Maybe<Scalars['Int']>;
  totalDocs?: Maybe<Scalars['Int']>;
  totalPages?: Maybe<Scalars['Int']>;
};

export type Photo = {
  __typename?: 'Photo';
  _id: Scalars['ObjectID'];
  archived: Scalars['Boolean'];
  file_type: Scalars['String'];
  height: Scalars['Int'];
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  href?: Maybe<Scalars['String']>;
  json?: Maybe<Scalars['JSON']>;
  legacy_caption?: Maybe<Scalars['String']>;
  legacy_thumbnail_id?: Maybe<Scalars['String']>;
  locked: Scalars['Boolean'];
  name: Scalars['String'];
  note?: Maybe<Scalars['String']>;
  people?: Maybe<PhotoPeople>;
  photo_url?: Maybe<Scalars['String']>;
  require_auth?: Maybe<Scalars['Boolean']>;
  size_bytes: Scalars['Int'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  timestamps?: Maybe<CollectionTimestamps>;
  uuid: Scalars['String'];
  width: Scalars['Int'];
  yState?: Maybe<Scalars['String']>;
};

export type PhotoCollectionActionAccess = {
  __typename?: 'PhotoCollectionActionAccess';
  archive?: Maybe<PhotoCollectionActionAccessObject>;
  bypassDocPermissions?: Maybe<PhotoCollectionActionAccessObject>;
  create?: Maybe<PhotoCollectionActionAccessObject>;
  delete?: Maybe<PhotoCollectionActionAccessObject>;
  get?: Maybe<PhotoCollectionActionAccessObject>;
  hide?: Maybe<PhotoCollectionActionAccessObject>;
  lock?: Maybe<PhotoCollectionActionAccessObject>;
  modify?: Maybe<PhotoCollectionActionAccessObject>;
  publish?: Maybe<PhotoCollectionActionAccessObject>;
  watch?: Maybe<PhotoCollectionActionAccessObject>;
};

export type PhotoCollectionActionAccessInput = {
  archive?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
  bypassDocPermissions?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
  create?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
  delete?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
  get?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
  hide?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
  lock?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
  modify?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
  publish?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
  watch?: InputMaybe<PhotoCollectionActionAccessObjectInput>;
};

export type PhotoCollectionActionAccessObject = {
  __typename?: 'PhotoCollectionActionAccessObject';
  teams?: Maybe<Array<Scalars['String']>>;
  users?: Maybe<Array<Scalars['String']>>;
};

export type PhotoCollectionActionAccessObjectInput = {
  teams?: InputMaybe<Array<Scalars['String']>>;
  users?: InputMaybe<Array<Scalars['String']>>;
};

export type PhotoModifyInput = {
  json?: InputMaybe<Scalars['JSON']>;
  name?: InputMaybe<Scalars['String']>;
  note?: InputMaybe<Scalars['String']>;
  people?: InputMaybe<PhotoModifyInputPeople>;
  require_auth?: InputMaybe<Scalars['Boolean']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  yState?: InputMaybe<Scalars['String']>;
};

export type PhotoModifyInputPeople = {
  photo_created_by?: InputMaybe<Scalars['String']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type PhotoPeople = {
  __typename?: 'PhotoPeople';
  created_by?: Maybe<User>;
  last_modified_by?: Maybe<User>;
  modified_by?: Maybe<Array<Maybe<User>>>;
  photo_created_by?: Maybe<Scalars['String']>;
  watching?: Maybe<Array<Maybe<User>>>;
};

export type Post = {
  __typename?: 'Post';
  _id: Scalars['ObjectID'];
  archived: Scalars['Boolean'];
  body: Scalars['String'];
  button_text: Scalars['String'];
  categories: Array<Maybe<Scalars['String']>>;
  description: Scalars['String'];
  enable_password_protection: Scalars['Boolean'];
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  legacy_markdown: Scalars['Boolean'];
  locked: Scalars['Boolean'];
  name: Scalars['String'];
  people?: Maybe<PublishableCollectionPeople>;
  permissions?: Maybe<PostPermissions>;
  slug?: Maybe<Scalars['String']>;
  stage?: Maybe<Scalars['Float']>;
  submitted_by: Array<Maybe<Scalars['String']>>;
  tags: Array<Maybe<Scalars['String']>>;
  timestamps?: Maybe<PublishableCollectionTimestamps>;
  yState?: Maybe<Scalars['String']>;
};

export type PostModifyInput = {
  body?: InputMaybe<Scalars['String']>;
  button_text?: InputMaybe<Scalars['String']>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  description?: InputMaybe<Scalars['String']>;
  enable_password_protection?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  permissions?: InputMaybe<PostModifyInputPermissions>;
  slug?: InputMaybe<Scalars['String']>;
  stage?: InputMaybe<Scalars['Float']>;
  submitted_by?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  yState?: InputMaybe<Scalars['String']>;
};

export type PostModifyInputPermissions = {
  teams?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  users?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  yState?: InputMaybe<Scalars['String']>;
};

export type PostPermissions = {
  __typename?: 'PostPermissions';
  teams: Array<Maybe<Scalars['ObjectID']>>;
  users: Array<Maybe<User>>;
};

export type PrunedContent = {
  __typename?: 'PrunedContent';
  _id: Scalars['ObjectID'];
  alert?: Maybe<Scalars['String']>;
  aliases?: Maybe<Array<Maybe<Scalars['String']>>>;
  body: Scalars['String'];
  center_text?: Maybe<Scalars['Boolean']>;
  dual_columns?: Maybe<Scalars['Boolean']>;
  enable_password_protection: Scalars['Boolean'];
  name: Scalars['String'];
  quick_links?: Maybe<Array<Maybe<ContentQuick_Links>>>;
  show_table_of_contents?: Maybe<Scalars['Boolean']>;
  slug: Scalars['String'];
  timestamps?: Maybe<PrunedContentTimestamps>;
};

export type PrunedContentQuick_Links = {
  __typename?: 'PrunedContentQuick_links';
  void?: Maybe<Scalars['Void']>;
};

export type PrunedContentTimestamps = {
  __typename?: 'PrunedContentTimestamps';
  published_at: Scalars['Date'];
  updated_at: Scalars['Date'];
};

export type PrunedNewsletter = {
  __typename?: 'PrunedNewsletter';
  _id: Scalars['ObjectID'];
  advancement_mini_posts?: Maybe<Array<Maybe<Post>>>;
  announcements?: Maybe<Array<Maybe<Post>>>;
  camping_mini_posts?: Maybe<Array<Maybe<Post>>>;
  fundraiser_mini_posts?: Maybe<Array<Maybe<Post>>>;
  high_adventure_mini_posts?: Maybe<Array<Maybe<Post>>>;
  manual_calendar?: Maybe<Array<Maybe<NewsletterManual_Calendar>>>;
  name: Scalars['String'];
  past_announcements?: Maybe<Array<Maybe<Post>>>;
  pinned_mini_posts?: Maybe<Array<Maybe<Post>>>;
  service_mini_posts?: Maybe<Array<Maybe<Post>>>;
  timestamps?: Maybe<PrunedNewsletterTimestamps>;
};

export type PrunedNewsletterManual_Calendar = {
  __typename?: 'PrunedNewsletterManual_calendar';
  void?: Maybe<Scalars['Void']>;
};

export type PrunedNewsletterTimestamps = {
  __typename?: 'PrunedNewsletterTimestamps';
  published_at: Scalars['Date'];
  updated_at: Scalars['Date'];
};

export type PrunedPost = {
  __typename?: 'PrunedPost';
  _id: Scalars['ObjectID'];
  body: Scalars['String'];
  button_text: Scalars['String'];
  categories: Array<Maybe<Scalars['String']>>;
  description: Scalars['String'];
  enable_password_protection: Scalars['Boolean'];
  legacy_markdown: Scalars['Boolean'];
  name: Scalars['String'];
  permissions?: Maybe<PrunedPostPermissions>;
  slug?: Maybe<Scalars['String']>;
  submitted_by: Array<Maybe<Scalars['String']>>;
  tags: Array<Maybe<Scalars['String']>>;
  timestamps?: Maybe<PrunedPostTimestamps>;
};

export type PrunedPostPermissions = {
  __typename?: 'PrunedPostPermissions';
  void?: Maybe<Scalars['Void']>;
};

export type PrunedPostTimestamps = {
  __typename?: 'PrunedPostTimestamps';
  published_at: Scalars['Date'];
  updated_at: Scalars['Date'];
};

export type PrunedStandaloneEmail = {
  __typename?: 'PrunedStandaloneEmail';
  _id: Scalars['ObjectID'];
  body: Scalars['String'];
  header_date: Scalars['Date'];
  legacy_markdown: Scalars['Boolean'];
  name: Scalars['String'];
  sender_name: Scalars['String'];
  timestamps?: Maybe<PrunedStandaloneEmailTimestamps>;
};

export type PrunedStandaloneEmailTimestamps = {
  __typename?: 'PrunedStandaloneEmailTimestamps';
  published_at: Scalars['Date'];
  updated_at: Scalars['Date'];
};

export type PrunedUser = {
  __typename?: 'PrunedUser';
  _id: Scalars['ObjectID'];
  biography?: Maybe<Scalars['String']>;
  constantcontact?: Maybe<PrunedUserConstantcontact>;
  current_title?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  github_id?: Maybe<Scalars['Int']>;
  group?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
  photo?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  timestamps?: Maybe<PrunedUserTimestamps>;
  twitter?: Maybe<Scalars['String']>;
};

export type PrunedUserConstantcontact = {
  __typename?: 'PrunedUserConstantcontact';
  void?: Maybe<Scalars['Void']>;
};

export type PrunedUserTimestamps = {
  __typename?: 'PrunedUserTimestamps';
  void?: Maybe<Scalars['Void']>;
};

export type PrunedWebConfig = {
  __typename?: 'PrunedWebConfig';
  _id: Scalars['ObjectID'];
  config?: Maybe<Scalars['JSON']>;
  name: Scalars['String'];
  timestamps?: Maybe<PrunedWebConfigTimestamps>;
};

export type PrunedWebConfigTimestamps = {
  __typename?: 'PrunedWebConfigTimestamps';
  void?: Maybe<Scalars['Void']>;
};

export type PublishableCollection = {
  __typename?: 'PublishableCollection';
  _id: Scalars['ObjectID'];
  archived: Scalars['Boolean'];
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  locked: Scalars['Boolean'];
  people?: Maybe<PublishableCollectionPeople>;
  timestamps?: Maybe<PublishableCollectionTimestamps>;
  yState?: Maybe<Scalars['String']>;
};

export type PublishableCollectionPeople = {
  __typename?: 'PublishableCollectionPeople';
  created_by?: Maybe<User>;
  last_modified_by?: Maybe<User>;
  last_published_by?: Maybe<User>;
  modified_by?: Maybe<Array<Maybe<User>>>;
  published_by?: Maybe<Array<Maybe<User>>>;
  watching?: Maybe<Array<Maybe<User>>>;
};

export type PublishableCollectionTimestamps = {
  __typename?: 'PublishableCollectionTimestamps';
  created_at: Scalars['Date'];
  modified_at: Scalars['Date'];
  published_at: Scalars['Date'];
  updated_at: Scalars['Date'];
};

export type Query = {
  __typename?: 'Query';
  /**
   * Get a set of Activity documents by _id.
   * If _id is omitted, the API will return all Activity documents.
   */
  activities?: Maybe<PagedActivity>;
  /** Get a Activity document by _id. */
  activity?: Maybe<Activity>;
  billing: Billing;
  /** Get the recent activity in the specified collections */
  collectionActivity?: Maybe<PagedCollectionActivity>;
  configuration?: Maybe<Configuration>;
  /** Get a Content document by _id. */
  content?: Maybe<Content>;
  /**
   * Get the permissions of the currently authenticated user for the
   * Content collection.
   */
  contentActionAccess?: Maybe<CollectionActionAccess>;
  /**
   * Get a pruned Content document by _id.
   * Provide the date of to ensure that the correct document is provided
   * (in case the slug is not unique).
   */
  contentBySlugPublic?: Maybe<PrunedContent>;
  /** Get a pruned Content document by _id. */
  contentPublic?: Maybe<PrunedContent>;
  /**
   * Get a set of Content documents by _id.
   * If _id is omitted, the API will return all Content documents.
   */
  contents?: Maybe<PagedContent>;
  /**
   * Get a set of pruned Content documents by _id.
   * If _id is omitted, the API will return all Content documents.
   */
  contentsPublic?: Maybe<PagedPrunedContent>;
  /**
   * Get an authenticated URL to the fathom analytics dashboard.
   * Only administrators can use this query.
   */
  fathomDashboard?: Maybe<Scalars['String']>;
  /** Get a File document by _id. */
  file?: Maybe<File>;
  /**
   * Get the permissions of the currently authenticated user for the
   * File collection.
   */
  fileActionAccess?: Maybe<CollectionActionAccess>;
  /**
   * Get a set of File documents by _id.
   * If _id is omitted, the API will return all File documents.
   */
  files?: Maybe<PagedFile>;
  /** Get a Newsletter document by _id. */
  newsletter?: Maybe<Newsletter>;
  /**
   * Get the permissions of the currently authenticated user for the
   * Newsletter collection.
   */
  newsletterActionAccess?: Maybe<CollectionActionAccess>;
  /** Get a pruned Newsletter document by _id. */
  newsletterPublic?: Maybe<PrunedNewsletter>;
  /**
   * Get a set of Newsletter documents by _id.
   * If _id is omitted, the API will return all Newsletter documents.
   */
  newsletters?: Maybe<PagedNewsletter>;
  /**
   * Get a set of pruned Newsletter documents by _id.
   * If _id is omitted, the API will return all Newsletter documents.
   */
  newslettersPublic?: Maybe<PagedPrunedNewsletter>;
  /** Get a Photo document by _id. */
  photo?: Maybe<Photo>;
  /**
   * Get the permissions of the currently authenticated user for the
   * Photo collection.
   */
  photoActionAccess?: Maybe<CollectionActionAccess>;
  /**
   * Get a set of Photo documents by _id.
   * If _id is omitted, the API will return all Photo documents.
   */
  photos?: Maybe<PagedPhoto>;
  /** Get a Post document by _id. */
  post?: Maybe<Post>;
  /**
   * Get the permissions of the currently authenticated user for the
   * Post collection.
   */
  postActionAccess?: Maybe<CollectionActionAccess>;
  /**
   * Get a pruned Post document by _id.
   * Provide the date of to ensure that the correct document is provided
   * (in case the slug is not unique).
   */
  postBySlugPublic?: Maybe<PrunedPost>;
  /** Get a pruned Post document by _id. */
  postPublic?: Maybe<PrunedPost>;
  /**
   * Get a set of Post documents by _id.
   * If _id is omitted, the API will return all Post documents.
   */
  posts?: Maybe<PagedPost>;
  /**
   * Get a set of pruned Post documents by _id.
   * If _id is omitted, the API will return all Post documents.
   */
  postsPublic?: Maybe<PagedPrunedPost>;
  /** Get a signed s3 URL for uploading photos and documents to an existing s3 bucket. */
  s3Sign?: Maybe<S3SignedResponse>;
  /** Get a StandaloneEmail document by _id. */
  standaloneEmail?: Maybe<StandaloneEmail>;
  /**
   * Get the permissions of the currently authenticated user for the
   * StandaloneEmail collection.
   */
  standaloneEmailActionAccess?: Maybe<CollectionActionAccess>;
  /** Get a pruned StandaloneEmail document by _id. */
  standaloneEmailPublic?: Maybe<PrunedStandaloneEmail>;
  /**
   * Get a set of StandaloneEmail documents by _id.
   * If _id is omitted, the API will return all StandaloneEmail documents.
   */
  standaloneEmails?: Maybe<PagedStandaloneEmail>;
  /**
   * Get a set of pruned StandaloneEmail documents by _id.
   * If _id is omitted, the API will return all StandaloneEmail documents.
   */
  standaloneEmailsPublic?: Maybe<PagedPrunedStandaloneEmail>;
  /** Get a Team document by _id. */
  team?: Maybe<Team>;
  /**
   * Get the permissions of the currently authenticated user for the
   * Team collection.
   */
  teamActionAccess?: Maybe<CollectionActionAccess>;
  /** Lists the active users who are not assigned to any teams. */
  teamUnassignedUsers?: Maybe<Array<Maybe<User>>>;
  /**
   * Get a set of Team documents by _id.
   * If _id is omitted, the API will return all Team documents.
   */
  teams?: Maybe<PagedTeam>;
  /** Get some details about the tenant. */
  tenant?: Maybe<TenantDetails>;
  /**
   * Get a user by _id. If _id is omitted, the API will return the current
   * user.
   */
  user?: Maybe<User>;
  /**
   * Get the permissions of the currently authenticated user for the
   * User collection.
   */
  userActionAccess?: Maybe<CollectionActionAccess>;
  /**
   * Get a pruned User document by _id.
   * Provide the date of to ensure that the correct document is provided
   * (in case the slug is not unique).
   */
  userBySlugPublic?: Maybe<PrunedUser>;
  /**
   * Returns whether the username exists in the database.
   * Also return the pruned user.
   */
  userExists: UserExistsResponse;
  /** Returns the sign-on methods for the username. */
  userMethods: Array<Maybe<Scalars['String']>>;
  /** Get a pruned User document by _id. */
  userPublic?: Maybe<PrunedUser>;
  /** Returns a list of documents in collections that reference this user */
  userReferences: Array<UserReference>;
  /**
   * Get a set of User documents by _id.
   * If _id is omitted, the API will return all User documents.
   */
  users?: Maybe<PagedUser>;
  /**
   * Get a set of pruned User documents by _id.
   * If _id is omitted, the API will return all User documents.
   */
  usersPublic?: Maybe<PagedPrunedUser>;
  /** Get a WebConfig document by _id. */
  webConfig?: Maybe<WebConfig>;
  /**
   * Get the permissions of the currently authenticated user for the
   * WebConfig collection.
   */
  webConfigActionAccess?: Maybe<CollectionActionAccess>;
  /** Gets the announcements for the home page */
  webConfigAnnouncementsPublic?: Maybe<Array<Maybe<WebConfigAnnouncementsPublic>>>;
  /** Gets forms and documents for the forms and documents page */
  webConfigFormsDocumentsPublic?: Maybe<Array<Maybe<WebConfigFormsDocumentsPublic>>>;
  /** Get a pruned WebConfig document by _id. */
  webConfigPublic?: Maybe<PrunedWebConfig>;
  /**
   * Get a set of WebConfig documents by _id.
   * If _id is omitted, the API will return all WebConfig documents.
   */
  webConfigs?: Maybe<PagedWebConfig>;
  /**
   * Get a set of pruned WebConfig documents by _id.
   * If _id is omitted, the API will return all WebConfig documents.
   */
  webConfigsPublic?: Maybe<PagedPrunedWebConfig>;
  /** Get the docs in the different workflow categories */
  workflow?: Maybe<Array<WorkflowGroup>>;
};


export type QueryActivitiesArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryActivityArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryCollectionActivityArgs = {
  collections?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  exclude?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  limit: Scalars['Int'];
  page?: InputMaybe<Scalars['Int']>;
};


export type QueryContentArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryContentActionAccessArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryContentBySlugPublicArgs = {
  date?: InputMaybe<Scalars['Date']>;
  slug: Scalars['String'];
};


export type QueryContentPublicArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryContentsArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryContentsPublicArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryFileArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryFileActionAccessArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryFilesArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryNewsletterArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryNewsletterActionAccessArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryNewsletterPublicArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryNewslettersArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryNewslettersPublicArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryPhotoArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryPhotoActionAccessArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryPhotosArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryPostArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryPostActionAccessArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryPostBySlugPublicArgs = {
  date?: InputMaybe<Scalars['Date']>;
  slug: Scalars['String'];
};


export type QueryPostPublicArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryPostsArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryPostsPublicArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryS3SignArgs = {
  fileName: Scalars['String'];
  fileType: Scalars['String'];
  s3Bucket: Scalars['String'];
};


export type QueryStandaloneEmailArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryStandaloneEmailActionAccessArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryStandaloneEmailPublicArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryStandaloneEmailsArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryStandaloneEmailsPublicArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryTeamArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryTeamActionAccessArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryTeamsArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryUserArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryUserActionAccessArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryUserBySlugPublicArgs = {
  date?: InputMaybe<Scalars['Date']>;
  slug: Scalars['String'];
};


export type QueryUserExistsArgs = {
  username: Scalars['String'];
};


export type QueryUserMethodsArgs = {
  username: Scalars['String'];
};


export type QueryUserPublicArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryUserReferencesArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
  collections?: InputMaybe<Array<Scalars['String']>>;
  exclude?: InputMaybe<Array<Scalars['String']>>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QueryUsersArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryUsersPublicArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryWebConfigArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryWebConfigActionAccessArgs = {
  _id?: InputMaybe<Scalars['ObjectID']>;
};


export type QueryWebConfigPublicArgs = {
  _id: Scalars['ObjectID'];
};


export type QueryWebConfigsArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryWebConfigsPublicArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  filter?: InputMaybe<Scalars['JSON']>;
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};


export type QueryWorkflowArgs = {
  collections?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  exclude?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type S3SignedResponse = {
  __typename?: 'S3SignedResponse';
  location: Scalars['String'];
  signedRequest: Scalars['String'];
};

export type StandaloneEmail = {
  __typename?: 'StandaloneEmail';
  _id: Scalars['ObjectID'];
  archived: Scalars['Boolean'];
  body: Scalars['String'];
  header_date: Scalars['Date'];
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  legacy_markdown: Scalars['Boolean'];
  locked: Scalars['Boolean'];
  name: Scalars['String'];
  people?: Maybe<PublishableCollectionPeople>;
  sender_name: Scalars['String'];
  stage: Scalars['Float'];
  timestamps?: Maybe<PublishableCollectionTimestamps>;
  yState?: Maybe<Scalars['String']>;
};

export type StandaloneEmailModifyInput = {
  body?: InputMaybe<Scalars['String']>;
  header_date?: InputMaybe<Scalars['Date']>;
  name?: InputMaybe<Scalars['String']>;
  sender_name?: InputMaybe<Scalars['String']>;
  stage?: InputMaybe<Scalars['Float']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type Team = {
  __typename?: 'Team';
  _id: Scalars['ObjectID'];
  archived: Scalars['Boolean'];
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  locked: Scalars['Boolean'];
  members: Array<Maybe<User>>;
  name: Scalars['String'];
  organizers: Array<Maybe<User>>;
  people?: Maybe<CollectionPeople>;
  slug: Scalars['String'];
  timestamps?: Maybe<CollectionTimestamps>;
  yState?: Maybe<Scalars['String']>;
};

export type TeamModifyInput = {
  members?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  name?: InputMaybe<Scalars['String']>;
  organizers?: InputMaybe<Array<InputMaybe<Scalars['ObjectID']>>>;
  slug?: InputMaybe<Scalars['String']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type TenantDetails = {
  __typename?: 'TenantDetails';
  displayName?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type Usage = {
  __typename?: 'Usage';
  api?: Maybe<ApiUsage>;
  storage: UsageStorage;
};


export type UsageApiArgs = {
  month?: InputMaybe<Scalars['Int']>;
  year?: InputMaybe<Scalars['Int']>;
};

export type UsageStorage = {
  __typename?: 'UsageStorage';
  database: Scalars['Float'];
  files: Scalars['Float'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ObjectID'];
  archived: Scalars['Boolean'];
  biography?: Maybe<Scalars['String']>;
  constantcontact?: Maybe<UserConstantcontact>;
  current_title?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  flags: Array<Maybe<Scalars['String']>>;
  github_id?: Maybe<Scalars['Int']>;
  group?: Maybe<Scalars['Float']>;
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  last_magic_code?: Maybe<Scalars['String']>;
  locked: Scalars['Boolean'];
  methods?: Maybe<Array<Maybe<Scalars['String']>>>;
  name: Scalars['String'];
  people?: Maybe<CollectionPeople>;
  phone?: Maybe<Scalars['Float']>;
  photo?: Maybe<Scalars['String']>;
  retired?: Maybe<Scalars['Boolean']>;
  slug: Scalars['String'];
  teams?: Maybe<PagedTeam>;
  timestamps?: Maybe<UserTimestamps>;
  twitter?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  yState?: Maybe<Scalars['String']>;
};


export type UserTeamsArgs = {
  _id: Scalars['ObjectID'];
  limit: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['JSON']>;
};

export type UserCollectionActionAccess = {
  __typename?: 'UserCollectionActionAccess';
  archive?: Maybe<UserCollectionActionAccessObject>;
  bypassDocPermissions?: Maybe<UserCollectionActionAccessObject>;
  create?: Maybe<UserCollectionActionAccessObject>;
  deactivate?: Maybe<UserCollectionActionAccessObject>;
  delete?: Maybe<UserCollectionActionAccessObject>;
  get?: Maybe<UserCollectionActionAccessObject>;
  hide?: Maybe<UserCollectionActionAccessObject>;
  lock?: Maybe<UserCollectionActionAccessObject>;
  modify?: Maybe<UserCollectionActionAccessObject>;
  publish?: Maybe<UserCollectionActionAccessObject>;
  watch?: Maybe<UserCollectionActionAccessObject>;
};

export type UserCollectionActionAccessInput = {
  archive?: InputMaybe<UserCollectionActionAccessObjectInput>;
  bypassDocPermissions?: InputMaybe<UserCollectionActionAccessObjectInput>;
  create?: InputMaybe<UserCollectionActionAccessObjectInput>;
  deactivate?: InputMaybe<UserCollectionActionAccessObjectInput>;
  delete?: InputMaybe<UserCollectionActionAccessObjectInput>;
  get?: InputMaybe<UserCollectionActionAccessObjectInput>;
  hide?: InputMaybe<UserCollectionActionAccessObjectInput>;
  lock?: InputMaybe<UserCollectionActionAccessObjectInput>;
  modify?: InputMaybe<UserCollectionActionAccessObjectInput>;
  publish?: InputMaybe<UserCollectionActionAccessObjectInput>;
  watch?: InputMaybe<UserCollectionActionAccessObjectInput>;
};

export type UserCollectionActionAccessObject = {
  __typename?: 'UserCollectionActionAccessObject';
  teams?: Maybe<Array<Scalars['String']>>;
  users?: Maybe<Array<Scalars['String']>>;
};

export type UserCollectionActionAccessObjectInput = {
  teams?: InputMaybe<Array<Scalars['String']>>;
  users?: InputMaybe<Array<Scalars['String']>>;
};

export type UserConstantcontact = {
  __typename?: 'UserConstantcontact';
  access_token?: Maybe<Scalars['String']>;
  expires_at?: Maybe<Scalars['Int']>;
  refresh_token?: Maybe<Scalars['String']>;
};

export type UserExistsResponse = {
  __typename?: 'UserExistsResponse';
  doc?: Maybe<PrunedUser>;
  exists: Scalars['Boolean'];
  methods: Array<Maybe<Scalars['String']>>;
};

export type UserModifyInput = {
  biography?: InputMaybe<Scalars['String']>;
  constantcontact?: InputMaybe<UserModifyInputConstantcontact>;
  current_title?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  group?: InputMaybe<Scalars['Float']>;
  name?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['Float']>;
  photo?: InputMaybe<Scalars['String']>;
  slug?: InputMaybe<Scalars['String']>;
  timestamps?: InputMaybe<UserModifyInputTimestamps>;
  twitter?: InputMaybe<Scalars['String']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type UserModifyInputConstantcontact = {
  access_token?: InputMaybe<Scalars['String']>;
  expires_at?: InputMaybe<Scalars['Int']>;
  refresh_token?: InputMaybe<Scalars['String']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type UserModifyInputTimestamps = {
  joined_at?: InputMaybe<Scalars['Date']>;
  last_active_at?: InputMaybe<Scalars['Date']>;
  last_login_at?: InputMaybe<Scalars['Date']>;
  left_at?: InputMaybe<Scalars['Date']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type UserReference = {
  __typename?: 'UserReference';
  _id: Scalars['String'];
  count: Scalars['Int'];
  docs: Array<UserReferenceDoc>;
};

export type UserReferenceDoc = {
  __typename?: 'UserReferenceDoc';
  _id: Scalars['ObjectID'];
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type UserTimestamps = {
  __typename?: 'UserTimestamps';
  created_at: Scalars['Date'];
  joined_at: Scalars['Date'];
  last_active_at: Scalars['Date'];
  last_login_at: Scalars['Date'];
  left_at: Scalars['Date'];
  modified_at: Scalars['Date'];
};

export type WebConfig = {
  __typename?: 'WebConfig';
  _id: Scalars['ObjectID'];
  archived: Scalars['Boolean'];
  config?: Maybe<Scalars['JSON']>;
  hidden: Scalars['Boolean'];
  history?: Maybe<Array<Maybe<CollectionHistory>>>;
  locked: Scalars['Boolean'];
  name: Scalars['String'];
  people?: Maybe<CollectionPeople>;
  timestamps?: Maybe<CollectionTimestamps>;
  yState?: Maybe<Scalars['String']>;
};

export type WebConfigAnnouncementsPublic = {
  __typename?: 'WebConfigAnnouncementsPublic';
  href?: Maybe<Scalars['String']>;
  href_text?: Maybe<Scalars['String']>;
  photo?: Maybe<Photo>;
  subtitle?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type WebConfigFormsDocumentsPublic = {
  __typename?: 'WebConfigFormsDocumentsPublic';
  documents: Array<Maybe<File>>;
  label: Scalars['String'];
};

export type WebConfigModifyInput = {
  config?: InputMaybe<Scalars['JSON']>;
  name?: InputMaybe<Scalars['String']>;
  yState?: InputMaybe<Scalars['String']>;
};

export type WithPermissions = {
  __typename?: 'WithPermissions';
  permissions: CollectionPermissions;
};

export type WithPermissionsInput = {
  permissions?: InputMaybe<CollectionPermissionsInput>;
};

export type WorkflowGroup = {
  __typename?: 'WorkflowGroup';
  _id: Scalars['Int'];
  count: Scalars['Int'];
  docs: Array<Maybe<WorkflowGroupDoc>>;
};

export type WorkflowGroupDoc = {
  __typename?: 'WorkflowGroupDoc';
  _id: Scalars['ObjectID'];
  in: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  stage: Scalars['Float'];
};


export const BasicProfileMe = gql`
    query BasicProfileMe {
  user {
    _id
    name
    email
    current_title
    photo
  }
}
    `;
export const CollectionConfig = gql`
    query CollectionConfig($collectionName: String!) {
  configuration {
    collection(name: $collectionName) {
      name
      pluralName
      canPublish
      withPermissions
      schemaDef
      generationOptions {
        mandatoryWatchers
        previewUrl
        dynamicPreviewHref
        nameField
        disableCreateMutation
        disableHideMutation
        disableArchiveMutation
        disablePublishMutation
        independentPublishedDocCopy
      }
      by {
        one
        many
      }
      canCreateAndGet
    }
  }
}
    `;
export const CreateFile = gql`
    mutation CreateFile($name: String!, $file_type: String!, $size_bytes: Int!, $uuid: String!) {
  fileCreate(
    name: $name
    file_type: $file_type
    size_bytes: $size_bytes
    uuid: $uuid
  ) {
    _id
  }
}
    `;
export const CreateTeam = gql`
    mutation CreateTeam($name: String!, $slug: String!, $members: [ObjectID]!, $organizers: [ObjectID]!) {
  teamCreate(name: $name, slug: $slug, members: $members, organizers: $organizers) {
    _id
  }
}
    `;
export const DashboardConfig = gql`
    query DashboardConfig {
  configuration {
    dashboard {
      collectionRows {
        arrPath
        header {
          icon
          label
        }
        query
        to {
          idPrefix
          idSuffix
        }
        dataKeys {
          _id
          description
          lastModifiedAt
          lastModifiedBy
          name
          photo
        }
      }
    }
  }
}
    `;
export const DeleteTeam = gql`
    mutation DeleteTeam($_id: ObjectID!) {
  teamDelete(_id: $_id)
}
    `;
export const FathomDashboard = gql`
    query FathomDashboard {
  fathomDashboard
}
    `;
export const GlobalConfig = gql`
    query GlobalConfig {
  configuration {
    collections {
      name
      pluralLabel: pluralName
      canCreateAndGet
    }
    navigation {
      main {
        icon
        label
        to
      }
      cmsNav: sub(key: "cms") {
        label
        uuid
        items {
          icon
          label
          to
          uuid
        }
      }
    }
    dashboard {
      collectionRows {
        arrPath
        dataKeys {
          _id
          description
          name
          lastModifiedBy
          lastModifiedAt
          photo
        }
        header {
          icon
          label
        }
        query
        to {
          idPrefix
          idSuffix
        }
      }
    }
  }
}
    `;
export const Profile = gql`
    query Profile($_id: ObjectID!) {
  user(_id: $_id) {
    _id
    name
    phone
    email
    twitter
    biography
    current_title
    photo
    retired
    slug
    username
    flags
    timestamps {
      joined_at
      created_at
      modified_at
      last_login_at
      last_active_at
    }
    people {
      created_by {
        name
      }
      last_modified_by {
        name
      }
    }
    teams(_id: $_id, limit: 100) {
      docs {
        _id
        name
      }
    }
    hidden
    locked
    archived
    methods
  }
  userActionAccess(_id: $_id) {
    modify
    deactivate
  }
}
    `;
export const ProfilesAppSettings = gql`
    query ProfilesAppSettings {
  configuration {
    apps {
      profiles {
        fieldDescriptions {
          name
          email
          phone
          twitter
          biography
          title
        }
        defaultFieldDescriptions {
          name
          email
          phone
          twitter
          biography
          title
        }
      }
    }
    collection(name: "User") {
      raw
    }
  }
}
    `;
export const RemoveUserFromTeam = gql`
    mutation RemoveUserFromTeam($_id: ObjectID!, $input: TeamModifyInput!) {
  teamModify(_id: $_id, input: $input) {
    _id
  }
}
    `;
export const ResendInvite = gql`
    mutation ResendInvite($_id: ObjectID!) {
  userResendInvite(_id: $_id) {
    _id
  }
}
    `;
export const SaveUserDeactivate = gql`
    mutation SaveUserDeactivate($_id: ObjectID!, $retired: Boolean) {
  userDeactivate(_id: $_id, deactivate: $retired) {
    retired
  }
}
    `;
export const SaveUserEdits = gql`
    mutation SaveUserEdits($_id: ObjectID!, $input: UserModifyInput!) {
  userModify(_id: $_id, input: $input) {
    _id
  }
}
    `;
export const SignS3 = gql`
    query SignS3($fileName: String!, $fileType: String!, $s3Bucket: String!) {
  s3Sign(fileName: $fileName, fileType: $fileType, s3Bucket: $s3Bucket) {
    signedRequest
    location
  }
}
    `;
export const Team = gql`
    query Team($team_id: ObjectID!) {
  teamActionAccess(_id: $team_id) {
    modify
    hide
  }
  userActionAccess {
    deactivate
  }
  team(_id: $team_id) {
    _id
    name
    slug
    members {
      _id
      name
      email
      current_title
      photo
      flags
      retired
    }
    organizers {
      _id
      name
      email
      current_title
      photo
      flags
      retired
    }
  }
}
    `;
export const TeamUnassignedUsers = gql`
    query TeamUnassignedUsers {
  teamUnassignedUsers {
    _id
    name
    current_title
    email
    photo
    flags
  }
}
    `;
export const TeamsList = gql`
    query TeamsList($page: Int, $limit: Int!) {
  teams(page: $page, limit: $limit, sort: "{ \\"_id\\": 1 }") {
    docs {
      _id
      name
      members {
        _id
      }
      organizers {
        _id
      }
    }
  }
}
    `;
export const UserReferences = gql`
    query UserReferences($_id: ObjectID!, $limit: Int) {
  userReferences(_id: $_id, limit: $limit) {
    count
    collection: _id
    docs {
      name
      url
    }
  }
}
    `;
export const UsersList = gql`
    query UsersList($page: Int, $limit: Int!) {
  users(page: $page, limit: $limit, sort: "{ \\"_id\\": 1 }") {
    docs {
      _id
      name
      r: retired
      c: current_title
    }
  }
}
    `;
export const WorkflowComplete = gql`
    query WorkflowComplete($collections: [String] = null, $exclude: [String] = null) {
  workflow(collections: $collections, exclude: $exclude) {
    _id
    count
    docs {
      _id
      name
      stage
      in
    }
  }
}
    `;
export const WorkflowCounts = gql`
    query WorkflowCounts {
  workflow {
    stage: _id
    count
  }
}
    `;
export type BasicProfileMeQueryVariables = Exact<{ [key: string]: never; }>;


export type BasicProfileMeQuery = { __typename?: 'Query', user?: { __typename?: 'User', _id: any, name: string, email?: string | null, current_title?: string | null, photo?: string | null } | null };

export type CollectionConfigQueryVariables = Exact<{
  collectionName: Scalars['String'];
}>;


export type CollectionConfigQuery = { __typename?: 'Query', configuration?: { __typename?: 'Configuration', collection?: { __typename?: 'ConfigurationCollection', name: string, pluralName: string, canPublish?: boolean | null, withPermissions?: boolean | null, schemaDef: any, canCreateAndGet?: boolean | null, generationOptions?: { __typename?: 'ConfigurationCollectionGenerationOptions', mandatoryWatchers?: Array<string | null> | null, previewUrl?: string | null, dynamicPreviewHref?: string | null, nameField?: string | null, disableCreateMutation?: boolean | null, disableHideMutation?: boolean | null, disableArchiveMutation?: boolean | null, disablePublishMutation?: boolean | null, independentPublishedDocCopy?: boolean | null } | null, by: { __typename?: 'ConfigurationCollectionBy', one: string, many: string } } | null } | null };

export type CreateFileMutationVariables = Exact<{
  name: Scalars['String'];
  file_type: Scalars['String'];
  size_bytes: Scalars['Int'];
  uuid: Scalars['String'];
}>;


export type CreateFileMutation = { __typename?: 'Mutation', fileCreate?: { __typename?: 'File', _id: any } | null };

export type CreateTeamMutationVariables = Exact<{
  name: Scalars['String'];
  slug: Scalars['String'];
  members: Array<InputMaybe<Scalars['ObjectID']>> | InputMaybe<Scalars['ObjectID']>;
  organizers: Array<InputMaybe<Scalars['ObjectID']>> | InputMaybe<Scalars['ObjectID']>;
}>;


export type CreateTeamMutation = { __typename?: 'Mutation', teamCreate?: { __typename?: 'Team', _id: any } | null };

export type DashboardConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardConfigQuery = { __typename?: 'Query', configuration?: { __typename?: 'Configuration', dashboard: { __typename?: 'ConfigurationDashboard', collectionRows: Array<{ __typename?: 'ConfigurationDashboardCollectionRow', arrPath: string, query: string, header: { __typename?: 'ConfigurationDashboardCollectionRowHeader', icon: string, label: string }, to: { __typename?: 'ConfigurationDashboardCollectionRowTo', idPrefix: string, idSuffix: string }, dataKeys: { __typename?: 'ConfigurationDashboardCollectionRowDataKeys', _id: string, description?: string | null, lastModifiedAt: string, lastModifiedBy: string, name: string, photo?: string | null } } | null> } } | null };

export type DeleteTeamMutationVariables = Exact<{
  _id: Scalars['ObjectID'];
}>;


export type DeleteTeamMutation = { __typename?: 'Mutation', teamDelete?: any | null };

export type FathomDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type FathomDashboardQuery = { __typename?: 'Query', fathomDashboard?: string | null };

export type GlobalConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type GlobalConfigQuery = { __typename?: 'Query', configuration?: { __typename?: 'Configuration', collections?: Array<{ __typename?: 'ConfigurationCollection', name: string, canCreateAndGet?: boolean | null, pluralLabel: string } | null> | null, navigation: { __typename?: 'ConfigurationNavigation', main: Array<{ __typename?: 'ConfigurationNavigationMainItem', icon: string, label: string, to: string } | null>, cmsNav: Array<{ __typename?: 'ConfigurationNavigationSubGroup', label: string, uuid: string, items: Array<{ __typename?: 'ConfigurationNavigationSubGroupItems', icon: string, label: string, to: string, uuid: string } | null> } | null> }, dashboard: { __typename?: 'ConfigurationDashboard', collectionRows: Array<{ __typename?: 'ConfigurationDashboardCollectionRow', arrPath: string, query: string, dataKeys: { __typename?: 'ConfigurationDashboardCollectionRowDataKeys', _id: string, description?: string | null, name: string, lastModifiedBy: string, lastModifiedAt: string, photo?: string | null }, header: { __typename?: 'ConfigurationDashboardCollectionRowHeader', icon: string, label: string }, to: { __typename?: 'ConfigurationDashboardCollectionRowTo', idPrefix: string, idSuffix: string } } | null> } } | null };

export type ProfileQueryVariables = Exact<{
  _id: Scalars['ObjectID'];
}>;


export type ProfileQuery = { __typename?: 'Query', user?: { __typename?: 'User', _id: any, name: string, phone?: number | null, email?: string | null, twitter?: string | null, biography?: string | null, current_title?: string | null, photo?: string | null, retired?: boolean | null, slug: string, username?: string | null, flags: Array<string | null>, hidden: boolean, locked: boolean, archived: boolean, methods?: Array<string | null> | null, timestamps?: { __typename?: 'UserTimestamps', joined_at: any, created_at: any, modified_at: any, last_login_at: any, last_active_at: any } | null, people?: { __typename?: 'CollectionPeople', created_by?: { __typename?: 'User', name: string } | null, last_modified_by?: { __typename?: 'User', name: string } | null } | null, teams?: { __typename?: 'PagedTeam', docs: Array<{ __typename?: 'Team', _id: any, name: string } | null> } | null } | null, userActionAccess?: { __typename?: 'CollectionActionAccess', modify: boolean, deactivate?: boolean | null } | null };

export type ProfilesAppSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfilesAppSettingsQuery = { __typename?: 'Query', configuration?: { __typename?: 'Configuration', apps: { __typename?: 'ConfigurationApps', profiles: { __typename?: 'ConfigurationProfilesApp', fieldDescriptions: { __typename?: 'ConfigurationProfilesAppFieldDescriptions', name: string, email: string, phone: string, twitter: string, biography: string, title: string }, defaultFieldDescriptions: { __typename?: 'ConfigurationProfilesAppFieldDescriptions', name: string, email: string, phone: string, twitter: string, biography: string, title: string } } }, collection?: { __typename?: 'ConfigurationCollection', raw: any } | null } | null };

export type RemoveUserFromTeamMutationVariables = Exact<{
  _id: Scalars['ObjectID'];
  input: TeamModifyInput;
}>;


export type RemoveUserFromTeamMutation = { __typename?: 'Mutation', teamModify?: { __typename?: 'Team', _id: any } | null };

export type ResendInviteMutationVariables = Exact<{
  _id: Scalars['ObjectID'];
}>;


export type ResendInviteMutation = { __typename?: 'Mutation', userResendInvite?: { __typename?: 'User', _id: any } | null };

export type SaveUserDeactivateMutationVariables = Exact<{
  _id: Scalars['ObjectID'];
  retired?: InputMaybe<Scalars['Boolean']>;
}>;


export type SaveUserDeactivateMutation = { __typename?: 'Mutation', userDeactivate?: { __typename?: 'User', retired?: boolean | null } | null };

export type SaveUserEditsMutationVariables = Exact<{
  _id: Scalars['ObjectID'];
  input: UserModifyInput;
}>;


export type SaveUserEditsMutation = { __typename?: 'Mutation', userModify?: { __typename?: 'User', _id: any } | null };

export type SignS3QueryVariables = Exact<{
  fileName: Scalars['String'];
  fileType: Scalars['String'];
  s3Bucket: Scalars['String'];
}>;


export type SignS3Query = { __typename?: 'Query', s3Sign?: { __typename?: 'S3SignedResponse', signedRequest: string, location: string } | null };

export type TeamQueryVariables = Exact<{
  team_id: Scalars['ObjectID'];
}>;


export type TeamQuery = { __typename?: 'Query', teamActionAccess?: { __typename?: 'CollectionActionAccess', modify: boolean, hide: boolean } | null, userActionAccess?: { __typename?: 'CollectionActionAccess', deactivate?: boolean | null } | null, team?: { __typename?: 'Team', _id: any, name: string, slug: string, members: Array<{ __typename?: 'User', _id: any, name: string, email?: string | null, current_title?: string | null, photo?: string | null, flags: Array<string | null>, retired?: boolean | null } | null>, organizers: Array<{ __typename?: 'User', _id: any, name: string, email?: string | null, current_title?: string | null, photo?: string | null, flags: Array<string | null>, retired?: boolean | null } | null> } | null };

export type TeamUnassignedUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type TeamUnassignedUsersQuery = { __typename?: 'Query', teamUnassignedUsers?: Array<{ __typename?: 'User', _id: any, name: string, current_title?: string | null, email?: string | null, photo?: string | null, flags: Array<string | null> } | null> | null };

export type TeamsListQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']>;
  limit: Scalars['Int'];
}>;


export type TeamsListQuery = { __typename?: 'Query', teams?: { __typename?: 'PagedTeam', docs: Array<{ __typename?: 'Team', _id: any, name: string, members: Array<{ __typename?: 'User', _id: any } | null>, organizers: Array<{ __typename?: 'User', _id: any } | null> } | null> } | null };

export type UserReferencesQueryVariables = Exact<{
  _id: Scalars['ObjectID'];
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type UserReferencesQuery = { __typename?: 'Query', userReferences: Array<{ __typename?: 'UserReference', count: number, collection: string, docs: Array<{ __typename?: 'UserReferenceDoc', name?: string | null, url?: string | null }> }> };

export type UsersListQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']>;
  limit: Scalars['Int'];
}>;


export type UsersListQuery = { __typename?: 'Query', users?: { __typename?: 'PagedUser', docs: Array<{ __typename?: 'User', _id: any, name: string, r?: boolean | null, c?: string | null } | null> } | null };

export type WorkflowCompleteQueryVariables = Exact<{
  collections?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
  exclude?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
}>;


export type WorkflowCompleteQuery = { __typename?: 'Query', workflow?: Array<{ __typename?: 'WorkflowGroup', _id: number, count: number, docs: Array<{ __typename?: 'WorkflowGroupDoc', _id: any, name?: string | null, stage: number, in: string } | null> }> | null };

export type WorkflowCountsQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkflowCountsQuery = { __typename?: 'Query', workflow?: Array<{ __typename?: 'WorkflowGroup', count: number, stage: number }> | null };
