import { toast } from 'react-toastify';
import { PageHead } from '../../../components/PageHead';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { themeType } from '../../../utils/theme/theme';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Button, IconButton } from '../../../components/Button';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import Color from 'color';
import { useHistory, useParams } from 'react-router-dom';
import { PhotoLibraryFlyout } from './PhotoLibraryFlyout';
import ReactTooltip from 'react-tooltip';
import { ApolloError, NetworkStatus, useQuery } from '@apollo/client';
import {
  CREATE_PHOTO,
  CREATE_PHOTO__TYPE,
  MODIFY_PHOTO,
  MODIFY_PHOTO__TYPE,
  PHOTOS_BASIC,
  PHOTOS_BASIC__TYPE,
  SIGN_S3,
  SIGN_S3__DOC_TYPE,
  SIGN_S3__TYPE,
} from '../../../graphql/queries';
import { CircularProgress } from '@material-ui/core';
import { client } from '../../../graphql/client';

function PhotoLibraryPage() {
  const theme = useTheme() as themeType;
  const history = useHistory();

  // get the photos
  const { data, loading, error, refetch, networkStatus, fetchMore } = useQuery<PHOTOS_BASIC__TYPE>(
    PHOTOS_BASIC,
    {
      notifyOnNetworkStatusChange: true,
      variables: { limit: 25 },
    }
  );
  const photos = data?.photos.docs;

  // keep track of whether something is loading
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  useEffect(() => {
    if (loading) setIsLoading(loading);
    else if (networkStatus === NetworkStatus.refetch) setIsLoading(loading);
    else if (networkStatus === NetworkStatus.fetchMore) setIsLoading(loading);
    else setIsLoading(false);
  }, [loading, networkStatus]);

  // keep track of the upload progress
  const [uploadProgress, setUploadProgress] = useState<number>(0); // should be between 0 and 1

  // keep track of the upload status
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  useEffect(() => {
    if (uploadProgress > 0 && uploadProgress < 1)
      setUploadStatus(`Uploading (${(uploadProgress * 100).toFixed(0)}%)...`);
  }, [uploadProgress]);

  // get the url parameters from the route
  let { photo_id } = useParams<{ photo_id?: string }>();

  // set document title
  useEffect(() => {
    document.title = `Photo library - Cristata`;
  }, []);

  // create a ref for the spinner that appears when more items can be loaded
  const SpinnerRef = useRef<HTMLDivElement>(null);
  // also create a ref for the photo grid container
  const WrapperRef = useRef<HTMLDivElement>(null);

  // use IntersectionObserver to detect when the load more items spinner is
  // intersecting in the photo grid, and then attempt to load more rows of the table
  useEffect(() => {
    let observer: IntersectionObserver;
    if (SpinnerRef.current && WrapperRef.current) {
      const options: IntersectionObserverInit = {
        root: WrapperRef.current,
        threshold: 0.75, // require at least 75% intersection
      };
      const callback: IntersectionObserverCallback = (entries, observer) => {
        entries.forEach((spinner) => {
          if (spinner.isIntersecting && !loading && networkStatus !== NetworkStatus.refetch) {
            // make spinner visible
            if (SpinnerRef.current) SpinnerRef.current.style.opacity = '1';
            // fetch more rows of data
            if (data?.photos?.hasNextPage) {
              fetchMore({
                variables: {
                  page: data.photos.nextPage,
                },
              });
            }
          } else {
            // make spinner invisible until it is intersecting enough
            if (SpinnerRef.current) SpinnerRef.current.style.opacity = '0';
          }
        });
      };
      observer = new IntersectionObserver(callback, options);
      observer.observe(SpinnerRef.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [
    data?.photos?.docs,
    data?.photos?.hasNextPage,
    data?.photos?.nextPage,
    fetchMore,
    loading,
    networkStatus,
    SpinnerRef,
    WrapperRef,
  ]);

  /**
   * Gets a signed request and file url for a file that needs to be uploaded to the s3 bucket
   */
  const getSignedRequest = async (file: File) => {
    return client
      .mutate<SIGN_S3__TYPE>({
        mutation: SIGN_S3,
        variables: {
          fileName: uuidv4(),
          fileType: file.type,
          s3Bucket:
            process.env.NODE_ENV === 'production' ? 'paladin-photo-library' : 'paladin-photo-library-test',
        },
      })
      .then((data) => {
        if (!data.errors && !data.data) throw new Error('signed url was not sent by the server');
        return data.data?.s3Sign as SIGN_S3__DOC_TYPE;
      })
      .then((data) => data)
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
        setUploadStatus(null);
        toast.error(`Failed to get signed s3 url: ${error.message}`);
        return { signedRequest: undefined, location: undefined };
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
    const { signedRequest, location: photoUrl } = await getSignedRequest(file);

    // get the image dimensions
    setUploadStatus('Calculating photo information...');
    const imageDimensions = getImageDimensions(file);

    if (signedRequest && photoUrl) {
      // upload the file to s3
      const isUploaded = await uploadFile(file, signedRequest);

      if (isUploaded) {
        setUploadStatus('Finishing upload...');
        await client
          .mutate<CREATE_PHOTO__TYPE>({
            mutation: CREATE_PHOTO,
            variables: { name: file.name },
          })
          .then((res) => {
            // save the _id of the new photo
            const _id = res.data?.photoCreate._id;

            if (_id) {
              client
                .mutate<MODIFY_PHOTO__TYPE>({
                  mutation: MODIFY_PHOTO,
                  variables: {
                    _id,
                    input: {
                      file_type: file.type,
                      photo_url: photoUrl,
                      dimensions: {
                        x: imageDimensions?.x,
                        y: imageDimensions?.y,
                      },
                      size: file.size,
                    },
                  },
                })
                .then(() => {
                  setIsLoading(false);
                  setUploadStatus(null);

                  // refresh the page of photos with the new photo
                  refetch();

                  // open the photo metadata
                  history.push(`/cms/photos/library/${_id}`);
                })
                .catch((error: ApolloError) => {
                  setIsLoading(false);
                  setUploadStatus(null);

                  // refresh the page of photos with the new photo
                  refetch();

                  // log and toast errors
                  console.error(error.graphQLErrors?.[0]?.message || error.message);
                  toast.error(error.graphQLErrors?.[0]?.message || error.message);
                });
            }
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

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  return (
    <>
      <PageHead
        title={`Photo libary`}
        description={uploadStatus || `📷 📷 📷 📷 📷 📷 📷 📷 📷 📷`}
        // if upload progress is between 0 and 1, provide the upload progress; otherwise, just show whether something is loading
        isLoading={uploadProgress && uploadProgress !== 1 ? uploadProgress : isLoading}
        buttons={
          <>
            <IconButton
              data-tip={'Refresh library'}
              onClick={() => refetch()}
              icon={<ArrowClockwise24Regular />}
            >
              Refresh
            </IconButton>
            <Button onClick={upload} disabled={!!isLoading || !!uploadStatus || !!error}>
              Upload
            </Button>
          </>
        }
      />
      {error ? (
        <pre>{JSON.stringify(error, null, 2)}</pre>
      ) : (
        <WrapperWrapper theme={theme}>
          <Wrapper theme={theme} ref={WrapperRef}>
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
                photos?.map((photo: any, index: number) => {
                  return (
                    <Card
                      key={index}
                      theme={theme}
                      isSelected={photo_id === photo._id}
                      onClick={() => {
                        if (photo_id !== photo._id) history.push(`/cms/photos/library/${photo._id}`);
                      }}
                    >
                      <ImageBG src={photo.photo_url} theme={theme} />
                      <ImageLabel theme={theme}>{photo.name}</ImageLabel>
                    </Card>
                  );
                })
              }
              {data?.photos?.hasNextPage ? (
                <div ref={SpinnerRef}>
                  <Spinner theme={theme} />
                </div>
              ) : null}
            </Grid>
          </Wrapper>
          {photo_id ? <PhotoLibraryFlyout photo_id={photo_id}></PhotoLibraryFlyout> : null}
        </WrapperWrapper>
      )}
    </>
  );
}

const WrapperWrapper = styled.div<{ theme?: themeType }>`
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  display: flex;
`;

const Wrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
  flex-grow: 1;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  grid-auto-rows: min-content;
  gap: 10px;
  width: 100%;
`;

const Card = styled.div<{ theme: themeType; isSelected: boolean }>`
  width: 100%;
  height: 144px;
  box-shadow: ${({ theme, isSelected }) =>
    `0 0 0 1px ${
      isSelected ? theme.color.primary[800] : Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()
    }`};
  border-radius: ${({ theme }) => theme.radius};
  ${({ theme, isSelected }) => `
    &:hover, &:focus, &:active {
      background-color: ${Color(theme.color.primary[800]).alpha(0.2).string()};
      box-shadow: 0 0 0 1px ${
        isSelected ? theme.color.primary[800] : Color(theme.color.primary[800]).alpha(0.2).string()
      }, 0 3.6px 7.2px 0 ${Color(theme.color.neutral[theme.mode][1500])
    .alpha(0.13)
    .string()}, 0 0.6px 1.8px 0 ${Color(theme.color.neutral[theme.mode][1500]).alpha(0.13).string()};
    }
    &:hover:active {
      background-color: ${Color(theme.color.primary[800]).alpha(0.25).string()};
      box-shadow: 0 0 0 1px ${
        isSelected ? theme.color.primary[800] : Color(theme.color.primary[800]).alpha(0.25).string()
      } 0 1.8px 3.6px 0 ${Color(theme.color.neutral[theme.mode][1500])
    .alpha(0.13)
    .string()}, 0 0.3px 0.9px 0 ${Color(theme.color.neutral[theme.mode][1500]).alpha(0.13).string()};
    }
  `};
  transition: border-color 160ms, border-radius 160ms, background-color 160ms, box-shadow 160ms;
`;

const ImageBG = styled.div<{ src: string; theme: themeType }>`
  width: 100%;
  height: calc(100% - 34px);
  background-image: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: ${({ theme }) => `${theme.radius} ${theme.radius} 0 0`};
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
  border-top: ${({ theme }) => `1px solid ${Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()}`};
`;
const Spinner = styled(CircularProgress)<{ theme: themeType }>`
  width: 20px !important;
  height: 20px !important;
  margin: 10px;
  font-family: ${({ theme }) => theme.color.primary[900]} !important;
`;

export { PhotoLibraryPage };
