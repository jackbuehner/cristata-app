import { gql } from '@apollo/client';

const WORKFLOW = gql`
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

type WORKFLOW__TYPE =
  | {
      workflow: {
        _id: number;
        count: number;
        docs: {
          _id: string;
          name?: string;
          stage: number;
          in: string;
        }[];
      }[];
    }
  | undefined;

export { WORKFLOW };
export type { WORKFLOW__TYPE };
