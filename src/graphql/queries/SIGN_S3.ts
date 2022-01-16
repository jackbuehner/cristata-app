import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

/**
 * Gets a signed s3 URL for uploading photos and documents to an existing s3 bucket.
 */
const SIGN_S3 = gql(
  jsonToGraphQLQuery({
    query: {
      __variables: {
        fileName: 'String!',
        fileType: 'String!',
        s3Bucket: 'String!',
      },
      s3Sign: {
        __args: {
          fileName: new VariableType('fileName'),
          fileType: new VariableType('fileType'),
          s3Bucket: new VariableType('s3Bucket'),
        },
        signedRequest: true,
        location: true,
      },
    },
  })
);

type SIGN_S3__TYPE =
  | {
      s3Sign?: SIGN_S3__DOC_TYPE;
    }
  | undefined;

type SIGN_S3__DOC_TYPE = {
  signedRequest: string;
  location: string;
};

export { SIGN_S3 };
export type { SIGN_S3__TYPE, SIGN_S3__DOC_TYPE };
