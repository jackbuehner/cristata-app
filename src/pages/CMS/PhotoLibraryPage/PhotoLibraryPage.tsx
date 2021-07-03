import useAxios from 'axios-hooks';
import { toast } from 'react-toastify';
import { PageHead } from '../../../components/PageHead';
import { db } from '../../../utils/axios/db';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { themeType } from '../../../utils/theme/theme';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Button, IconButton } from '../../../components/Button';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { IPhoto } from '../../../interfaces/cristata/photos';

function PhotoLibraryPage() {
  const theme = useTheme() as themeType;
  const [{ data, loading }, refetch] = useAxios<IPhoto[]>(`/photos`);

  // keep track of whether something is loading
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // keep track of the upload progress
  const [uploadProgress, setUploadProgress] = useState<number>(0); // should be between 0 and 1

  // keep track of the upload status
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  useEffect(() => {
    if (uploadProgress > 0 && uploadProgress < 1)
      setUploadStatus(`Uploading (${(uploadProgress * 100).toFixed(0)}%)...`);
  }, [uploadProgress]);

  /**
   * Gets a signed request and file url for a file that needs to be uploaded to the s3 bucket
   */
  const getSignedRequest = async (file: File) => {
    return db
      .get(
        `/sign-s3?file-name=${uuidv4()}&file-type=${file.type}&s3-bucket=${
          process.env.NODE_ENV === 'production' ? 'paladin-photo-library' : 'paladin-photo-library-test'
        }`
      )
      .then(({ data }: { data: { signedRequest: string; url: string } }) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
        setUploadStatus(null);
        toast.error(`Failed to get signed s3 url: ${error}`);
        return { signedRequest: undefined, url: undefined };
      });
  };

  /**
   * Uploads the file to the s3 bucket using the signed request url
   */
  const uploadFile = async (file: File, signedRequest: string) => {
    return axios
      .put(signedRequest, file, {
        headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) setUploadProgress(progressEvent.loaded / progressEvent.total);
        },
      })
      .then(() => {
        setUploadProgress(0);
        return true;
      })
      .catch((error) => {
        setUploadProgress(0);
        setIsLoading(false);
        setUploadStatus(null);
        console.error(error);
        toast.error(`Failed to upload file with signed s3 url: ${error}`);
        return false;
      });
  };

  /**
   * Gets the dimensions of a file. Errors may occur if the file is not an image.
   */
  const getImageDimensions = (file: File) => {
    try {
      let dimensions = {
        x: 0,
        y: 0,
      };

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          // initiate the JavaScript Image object.
          let image = new Image();

          // set the Base64 string return from FileReader as source.
          image.src = e.target.result.toString();

          // get the width and height once the image loads
          image.onload = () => {
            dimensions.x = image.naturalWidth;
            dimensions.y = image.naturalHeight;
          };
        }
      };

      return dimensions;
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * adds a new file to s3 and the database
   */
  const addNewFile = async (file: File) => {
    setIsLoading(true);

    // get the signed request url and the target url for the file
    setUploadStatus('Preparing to upload...');
    const { signedRequest, url } = await getSignedRequest(file);

    // get the image dimensions
    setUploadStatus('Calculating photo information...');
    const imageDimensions = getImageDimensions(file);

    if (signedRequest && url) {
      // upload the file to s3
      const isUploaded = await uploadFile(file, signedRequest);

      if (isUploaded) {
        setUploadStatus('Finishing upload...');
        db.post(`/photos`, {
          name: file.name,
          file_type: file.type,
          photo_url: url,
          dimensions: {
            x: imageDimensions?.x,
            y: imageDimensions?.y,
          },
          size: file.size,
        })
          .then(({ data }) => {
            setIsLoading(false);
            setUploadStatus(null);

            // refresh the page of photos with the new photo
            refetch();

            // open the photo metadata
            console.log(data);
          })
          .catch((error) => {
            console.error(error);
            setIsLoading(false);
            setUploadStatus(null);
            toast.error(`Failed to store photo details in database: ${error}`);
          });
      }
    }
  };

  // create a ref for the actual input element and provide a function to click it
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const upload = () => {
    uploadInputRef?.current?.click();
  };

  return (
    <>
      <PageHead
        title={`Photo libary`}
        description={uploadStatus || `📷 📷 📷 📷 📷 📷 📷 📷 📷 📷`}
        // if upload progress is between 0 and 1, provide the upload progress; otherwise, just show whether something is loading
        isLoading={uploadProgress && uploadProgress !== 1 ? uploadProgress : isLoading}
        buttons={
          <>
            <IconButton onClick={() => refetch()} icon={<ArrowClockwise24Regular />}>
              Refresh
            </IconButton>
            <Button onClick={upload}>Upload</Button>
          </>
        }
      />
      <Wrapper theme={theme}>
        <input
          ref={uploadInputRef}
          type={`file`}
          accept={`.png, .jpg, .jpeg, .jpe, .jfif, .webp, .svg, .gif`}
          onChange={async (e) => {
            if (e.target.files) {
              addNewFile(e.target.files[0]);
            }
          }}
          style={{ display: 'none' }}
        />
        <Grid>
          {
            // show a grid of the photos
            data?.map((photo: any, index: number) => {
              return (
                <Card key={index} theme={theme}>
                  <ImageBG src={photo.photo_url} />
                  <ImageLabel theme={theme}>{photo.name}</ImageLabel>
                </Card>
              );
            })
          }
        </Grid>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: 100%;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  box-sizing: border-box;
  overflow: auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
`;

const Card = styled.div<{ theme: themeType }>`
  width: 100%;
  height: 144px;
  border: 1px solid;
  border-radius: ${({ theme }) => theme.radius};
`;

const ImageBG = styled.div<{ src: string }>`
  width: 100%;
  height: calc(100% - 34px);
  background-image: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const ImageLabel = styled.div<{ theme: themeType }>`
  font-size: 14px;
  font-family: ${({ theme }) => theme.font.detail};
  padding: 0 10px;
  align-items: center;
  line-height: 34px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export { PhotoLibraryPage };
