export interface IGetDiscussion {
  organization: {
    team: {
      discussions: {
        totalCount: number;
        edges: Array<{
          node: {
            id: string;
            author: {
              login: string;
            };
            bodyHTML: string;
            comments: {
              totalCount: number;
              edges: Array<IGetDiscussionReplyDetails>;
            };
            lastEditedAt: string | null;
            isPrivate: boolean;
            isPinned: boolean;
            publishedAt: string;
            reactions: {
              totalCount: number;
            };
            title: string;
            updatedAt: string;
            viewerCanDelete: boolean;
            viewerCanPin: boolean;
            viewerCanReact: boolean;
            viewerCanSubscribe: boolean;
            viewerCanUpdate: boolean;
            viewerCannotUpdateReasons: any[];
            viewerDidAuthor: boolean;
            viewerSubscription: 'SUBSCRIBED' | 'IGNORED';
            number: number;
            editor: {
              login: string;
            } | null;
            reactionGroups: Array<IGetDiscussionReactionGroup>;
          };
          cursor: string;
        }>;
      };
    };
  };
}

export interface IGetDiscussionSingle {
  organization: {
    team: {
      discussion: {
        id: string;
        author: {
          login: string;
        };
        bodyHTML: string;
        comments: {
          totalCount: number;
          edges: Array<IGetDiscussionReplyDetails>;
        };
        lastEditedAt: string | null;
        isPrivate: boolean;
        isPinned: boolean;
        publishedAt: string;
        reactions: {
          totalCount: number;
        };
        title: string;
        updatedAt: string;
        viewerCanDelete: boolean;
        viewerCanPin: boolean;
        viewerCanReact: boolean;
        viewerCanSubscribe: boolean;
        viewerCanUpdate: boolean;
        viewerCannotUpdateReasons: any[];
        viewerDidAuthor: boolean;
        viewerSubscription: 'SUBSCRIBED' | 'IGNORED';
        number: number;
        editor: {
          login: string;
        } | null;
        reactionGroups: Array<IGetDiscussionReactionGroup>;
      };
      cursor: string;
    };
  };
}

export interface IGetDiscussionReactionGroup {
  content: 'THUMBS_UP' | 'THUMBS_DOWN' | 'LAUGH' | 'HOORAY' | 'CONFUSED' | 'HEART' | 'ROCKET' | 'EYES';
  viewerHasReacted: boolean;
  users: {
    totalCount: number;
  };
}

export interface IGetDiscussionReplyDetails {
  node: {
    author: {
      login: string;
    };
    createdAt: string;
  };
}

export interface IGetDiscussionComments {
  organization: {
    team: {
      discussion: {
        comments: {
          edges: Array<{
            cursor: string;
            node: {
              id: string;
              author: {
                login: string;
              };
              bodyHTML: string;
              lastEditedAt: string | null;
              publishedAt: string;
              updatedAt: string;
              viewerCanDelete: boolean;
              viewerCanReact: boolean;
              viewerCanUpdate: boolean;
              viewerCannotUpdateReasons: any[];
              number: number;
              editor: {
                login: string;
              } | null;
              reactions: {
                totalCount: number;
              };
              reactionGroups: Array<IGetDiscussionReactionGroup>;
            };
          }>;
        };
      };
    };
  };
}
