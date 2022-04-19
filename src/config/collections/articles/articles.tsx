import { gql } from '@apollo/client';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { GitHubUserID, IProfile } from '../../../interfaces/cristata/profiles';
import { collection } from '../../collections';

const articles: collection = {
  createNew: ([loading, setIsLoading], client, toast, navigate) => {
    setIsLoading(true);
    client
      .mutate<{ articleCreate?: { _id: string } }>({
        mutation: gql`
          mutation Create($name: String!) {
            articleCreate(name: $name) {
              _id
            }
          }
        `,
        variables: {
          // generate a document name
          name: uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: '-',
          }),
        },
      })
      .then(({ data }) => {
        setIsLoading(false);
        // navigate to the new document upon successful creation
        navigate(`/cms/collection/articles/${data?.articleCreate?._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

// permissions groups
type Teams = string;

// interface for each article
interface IArticle {
  name?: string;
  permissions: {
    teams?: Teams[];
    users: GitHubUserID[];
  };
  locked?: boolean;
  timestamps: {
    created_at?: string;
    modified_at?: string;
    published_at?: string;
    target_publish_at?: string;
  };
  people: {
    authors?: IProfile[];
    created_by?: IProfile;
    modified_by?: IProfile[];
    last_modified_by: IProfile;
    published_by?: IProfile[];
    editors?: {
      primary?: IProfile;
      copy?: IProfile[];
    };
  };
  stage?: Stage;
  categories?: string[];
  tags?: string[];
  description?: string;
  photo_path: string;
  video_path?: string;
  photo_caption?: string;
  body?: string;
  versions?: IArticle[]; // store previous versions of the article
  hidden?: boolean;
  show_comments: boolean;
  legacy_html: boolean; // true if it is html from the old webflow
  history?: { type: string; user: GitHubUserID; at: string }[];
}
// use these as the stages for articles
enum Stage {
  PLANNING = 1.1,
  DRAFT = 2.1,
  PENDING_EDITOR_REVIEW = 3.1,
  PENDING_INTERVIEWEE_APPROVAL = 3.2,
  PENDING_EDIT = 3.4,
  PENDING_UPLOAD = 4.1,
  UPLOADED = 5.1,
  PUBLISHED = 5.2,
}

export { articles };
export type { IArticle };
