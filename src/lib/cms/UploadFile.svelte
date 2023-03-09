<script lang="ts">
  import { goto } from '$app/navigation';
  import {
    CreateFile,
    SignS3,
    type CreateFileMutation,
    type CreateFileMutationVariables,
    type SignS3Query,
    type SignS3QueryVariables,
  } from '$graphql/graphql';
  import { query } from '$graphql/query';
  import { toast } from 'react-toastify';
  import { v4 as uuidv4 } from 'uuid';

  export let tenant: string;
  export let loading = false;
  export let uploadStatus: string | null = null;
  export let uploadProgress: number = 0;
  export let refetchData: () => Promise<void>;
  export let uploadInput: HTMLInputElement | null = null;

  $: if (uploadProgress > 0) uploadStatus = `Uploading (${(uploadProgress * 100).toFixed(0)}%)...`;

  /**
   * Gets a signed request and file url for a file that needs to be uploaded to the s3 bucket
   */
  const getSignedRequest = async (file: File, uuid: string): Promise<SignS3Query['s3Sign']> => {
    return query<SignS3Query, SignS3QueryVariables>({
      fetch,
      tenant,
      query: SignS3,
      variables: {
        fileName: uuid || file.name,
        fileType: file.type,
        s3Bucket: `app.cristata.${tenant}.files`,
      },
    })
      .then((data) => {
        if (!data?.errors && !data?.data) throw new Error('Signed url was not sent by the server');
        return data.data?.s3Sign;
      })
      .then((data) => data)
      .catch((error) => {
        console.error(error);
        loading = false;
        uploadStatus = null;
        toast.error(`Failed to get signed s3 url: ${error.message}`);
        return undefined;
      });
  };

  /**
   * Uploads the file to the s3 bucket using the signed request url
   */
  const uploadFile = async (file: File, signedRequest: string) => {
    return fetch2(signedRequest, {
      method: 'PUT',
      body: file,
      credentials: 'omit',
      headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
      onUploadProgress(evt, progress) {
        uploadProgress = progress || 0;
      },
    })
      .then(() => {
        uploadProgress = 0;
        return true;
      })
      .catch((error) => {
        uploadProgress = 0;
        loading = false;
        uploadStatus = null;
        console.error(error);
        toast.error(`Failed to upload file with signed s3 url: ${error?.message || JSON.stringify(error)}`);
        return false;
      });
  };

  /**
   * Adds a new file to s3 and the database
   */
  const addNewFile = async (file: File) => {
    loading = true;
    const uuid = uuidv4();

    // get the signed request url and the target url for the file
    uploadStatus = 'Preparing to upload...';
    const requestData = await getSignedRequest(file, uuid);

    if (requestData?.signedRequest && requestData.location) {
      // upload the file to s3
      const isUploaded = await uploadFile(file, requestData.signedRequest);

      if (isUploaded) {
        uploadStatus = 'Finishing upload...';
        query<CreateFileMutation, CreateFileMutationVariables>({
          fetch,
          tenant,
          query: CreateFile,
          variables: {
            name: file.name,
            file_type: file.type,
            size_bytes: file.size,
            uuid: uuid,
          },
        })
          .then(async (res) => {
            if (!res) throw new Error('The server did not send a response after attempting to add the file.');
            if (!res.data)
              throw new Error('The server did not return any data after attempting to add the file.');
            if (!res.data.fileCreate)
              throw new Error(`The server did not respond with the uploaded file's identifier.`);
            const _id = res.data.fileCreate._id;

            loading = false;
            uploadStatus = null;
            await refetchData();

            // open the document
            if (_id) {
              goto(`/${tenant}/cms/collection/files/${_id}`);
            }
          })
          .catch(async (error) => {
            loading = false;
            uploadStatus = null;
            await refetchData();

            // log and toast errors
            console.error(error.graphQLErrors?.[0]?.message || error.message);
            toast.error(error.graphQLErrors?.[0]?.message || error.message);
          });
      }
    }
  };
</script>

<input
  bind:this={uploadInput}
  type={`file`}
  on:change={async (e) => {
    if (e.currentTarget.files) {
      addNewFile(e.currentTarget.files[0]);
    }
  }}
  style="display: none;"
/>
