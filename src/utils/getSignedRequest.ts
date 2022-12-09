import { ApolloClient } from '@apollo/client';
import { SIGN_S3, SIGN_S3__TYPE } from '../graphql/queries';
import { v4 as uuidv4 } from 'uuid';

interface GetSignedRequestParams {
  uuid?: string;
  client: ApolloClient<object>;
  s3Bucket: string;
  file: File;
}

/**
 * Gets a pre-signed URL for uploading a file to an s3 bucket managed by Cristata.
 */
async function getSignedRequest({
  uuid,
  client,
  s3Bucket,
  file,
}: GetSignedRequestParams): Promise<GetSignedRequestReturn> {
  return client
    .mutate<SIGN_S3__TYPE>({
      mutation: SIGN_S3,
      variables: {
        fileName: uuid || uuidv4(),
        fileType: file.type,
        s3Bucket: s3Bucket,
      },
    })
    .then((data): GetSignedRequestReturn => {
      if (!data.errors && !data.data) throw new Error('signed url was not sent by the server');
      return [
        {
          signedRequest: data.data?.s3Sign?.signedRequest,
          location: data.data?.s3Sign?.location,
        },
        undefined,
      ];
    })
    .then((data) => data)
    .catch((error): GetSignedRequestReturn => {
      console.error(error);
      return [
        {
          signedRequest: undefined,
          location: undefined,
        },
        error,
      ];
    });
}

type GetSignedRequestReturn = [{ signedRequest?: string; location?: string }, any];

export { getSignedRequest };
