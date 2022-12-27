import { NetworkStatus, useApolloClient, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { CircularProgress } from '@material-ui/core';
import Color from 'color';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { v4 as uuidv4 } from 'uuid';
import { Chip } from '../../../components/Chip';
import FluentIcon from '../../../components/FluentIcon';
import { Menu } from '../../../components/Menu';
import { Offline } from '../../../components/Offline';
import { mongoFilterType } from '../../../graphql/client';
import {
  CREATE_PHOTO,
  CREATE_PHOTO__TYPE,
  CREATE_PHOTO__VARIABLES,
  PHOTOS_BASIC,
  PHOTOS_BASIC__TYPE,
} from '../../../graphql/queries';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import { useDropdown } from '../../../hooks/useDropdown';
import { useAppDispatch } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName, setAppSearchShown } from '../../../redux/slices/appbarSlice';
import { getSignedRequest } from '../../../utils/getSignedRequest';
import { isJSON } from '../../../utils/isJSON';
import { themeType } from '../../../utils/theme/theme';
import { CollectionTableFilterRow } from '../CollectionPage/CollectionTableFilterRow';
import { PhotoLibraryFlyout } from './PhotoLibraryFlyout';

function PhotoLibraryPage() {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const client = useApolloClient();
  const tenant = localStorage.getItem('tenant');
  const [{ schemaDef }] = useCollectionSchemaConfig('Photo');

  // construct a filter
  const filter: mongoFilterType = { hidden: { $ne: true }, archived: { $ne: true } };
  searchParams.forEach((value, param) => {
    // ignore values that start with two underscores because these are
    // parameters used in the page instead of filters
    if (param.indexOf('__') === 0) return;

    // if the param name is _search, search the text index
    if (param === '_search') {
      filter.$text = { $search: value };
      return;
    }

    const isNegated = param[0] === '!';
    const isArray = isJSON(value) && Array.isArray(JSON.parse(value));

    const parseBooleanString = (str: string) => {
      if (str.toLowerCase() === 'true') return true;
      else if (str.toLowerCase() === 'false') return false;
      return undefined;
    };

    if (isNegated && isArray) filter[param.slice(1)] = { $nin: JSON.parse(value) };
    if (isNegated && !isArray)
      filter[param.slice(1)] = {
        $ne: parseBooleanString(value) !== undefined ? parseBooleanString(value) : parseFloat(value) || value,
      };
    if (!isNegated && isArray) filter[param] = { $in: JSON.parse(value) };
    if (!isNegated && !isArray)
      filter[param] = !isNaN(parseFloat(value))
        ? { $eq: parseFloat(value) }
        : parseBooleanString(value) !== undefined
        ? { $eq: parseBooleanString(value) }
        : { $regex: value, $options: 'i' };
  });

  // get the photos
  const { data, loading, error, refetch, networkStatus, fetchMore } = useQuery<PHOTOS_BASIC__TYPE>(
    PHOTOS_BASIC,
    {
      notifyOnNetworkStatusChange: true,
      variables: {
        limit: 25,
        filter: JSON.stringify(filter),
        sort: JSON.stringify({ 'timestamps.created_at': -1 }), // sort newest first
      },
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
   * Uploads the file to the s3 bucket using the signed request url
   */
  const uploadFile = async (file: File, signedRequest: string) => {
    return fetch2(signedRequest, {
      method: 'PUT',
      body: file,
      credentials: 'omit',
      headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
      onUploadProgress(evt, progress) {
        setUploadProgress(progress || 0);
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
        toast.error(`Failed to upload file with signed s3 url: ${error?.message || JSON.stringify(error)}`);
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
    const s3Bucket = tenant === 'paladin-news' ? 'paladin-photo-library' : `app.cristata.${tenant}.photos`;
    const uuid = uuidv4();

    // get the signed request url and the target url for the file
    setUploadStatus('Preparing to upload...');
    const [{ signedRequest }, srError] = await getSignedRequest({ uuid, client, file, s3Bucket });

    if (!signedRequest) {
      toast.error(`Failed to get signed s3 url: ${srError.message}`);
      return;
    }

    // get the image dimensions
    setUploadStatus('Calculating photo information...');
    const imageDimensions = getImageDimensions(file);

    // upload the file to s3
    const isUploaded = await uploadFile(file, signedRequest);

    if (isUploaded) {
      setUploadStatus('Finishing upload...');
      await client
        .mutate<CREATE_PHOTO__TYPE, CREATE_PHOTO__VARIABLES>({
          mutation: CREATE_PHOTO,
          variables: {
            name: file.name,
            file_type: file.type,
            size_bytes: file.size,
            uuid: uuid,
            width: imageDimensions?.x || 0,
            height: imageDimensions?.y || 0,
          },
        })
        .then((res) => {
          // the _id of the new photo
          const _id = res.data?.photoCreate._id;

          setIsLoading(false);
          setUploadStatus(null);

          // refresh the page of photos with the new photo
          refetch();

          // open the photo metadata
          if (_id) navigate(`/cms/photos/library/${_id}`);
        })
        .catch((error) => {
          setIsLoading(false);
          setUploadStatus(null);

          // refresh the page of photos with the new photo
          refetch();

          // log and toast errors
          if (error.graphQLErrors && error.graphQLErrors.length > 0) {
            console.error(error.graphQLErrors?.[0]?.message || error.message);
            toast.error(error.graphQLErrors?.[0]?.message || error.message);
          } else if (error.networkError?.result?.errors?.[0]) {
            console.error(error.networkError?.result?.errors?.[0]?.message || error.message);
            toast.error(error.networkError?.result?.errors?.[0]?.message || error.message);
          } else {
            console.error(error);
            toast.error(`Failed to store photo details in database: ${error}`);
          }
        });
    }
  };

  // create a ref for the actual input element and provide a function to click it
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const upload = () => {
    uploadInputRef?.current?.click();
  };

  // tools dropdown
  const [showToolsDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left + triggerRect.width - 240,
            width: 240,
          }}
          items={[
            {
              label: 'Refresh data',
              icon: <FluentIcon name={'ArrowClockwise16Regular'} />,
              onClick: () => refetch(),
            },
            {
              label: 'Filter',
              icon: <FluentIcon name={'Filter16Regular'} />,
              onClick: () => null,
              disabled: true,
              'data-tip': 'Filtering is currently unavailable.',
            },
            {
              label: 'Clear filter',
              icon: <FluentIcon name={'FilterDismiss16Regular'} />,
              onClick: () => navigate(location.pathname),
            },
          ]}
        />
      );
    },
    [],
    true,
    true
  );

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // keep loading state synced
  useEffect(() => {
    dispatch(setAppLoading(uploadProgress && uploadProgress !== 1 ? uploadProgress : isLoading));
  }, [dispatch, isLoading, uploadProgress]);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName(`Photo library${uploadStatus ? ` - ${uploadStatus}` : ``}`));
    dispatch(
      setAppActions([
        {
          label: 'Search',
          type: 'icon',
          icon: 'Search20Regular',
          action: () => dispatch(setAppSearchShown(true)),
        },
        {
          label: 'Upload',
          type: 'button',
          icon: 'ArrowUpload20Regular',
          action: upload,
          disabled: !!isLoading || !!uploadStatus || !!error || !navigator.onLine,
        },
        {
          label: 'Tools',
          type: 'button',
          action: (e) => {
            // refetch data on shift click
            if (e.ctrlKey || e.metaKey) refetch();
            // otherwise, open dropdown
            else showToolsDropdown(e);
          },
          onAuxClick: ({ button }) => {
            // refetch data on middle click
            if (button === 1) refetch();
          },
          'data-tip': `${
            // @ts-expect-error userAgentData exists
            navigator.userAgentData?.platform === 'macOS' ? 'cmd' : 'ctrl'
          } + click to refresh data`,
          showChevron: true,
        },
      ])
    );
  }, [dispatch, error, isLoading, refetch, showToolsDropdown, uploadStatus]);

  if (!data && !navigator.onLine) {
    return <Offline variant={'centered'} />;
  }

  return (
    <>
      {error ? (
        <pre>{JSON.stringify(error, null, 2)}</pre>
      ) : (
        <WrapperWrapper theme={theme}>
          <Wrapper theme={theme} ref={WrapperRef}>
            <CollectionTableFilterRow schemaDef={schemaDef} collectionName={'Photo'} />
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
                photos?.map((photo, index: number) => {
                  return (
                    <Card
                      key={index}
                      theme={theme}
                      isSelected={photo_id === photo._id}
                      onClick={() => {
                        if (photo_id !== photo._id) navigate(`/cms/photos/library/${photo._id}`);
                      }}
                    >
                      <ImageBG src={photo.photo_url} theme={theme} />
                      <ImageLabel theme={theme}>{photo.name}</ImageLabel>
                      <ImageTags theme={theme}>
                        {photo.tags.map((tag, index) => {
                          return <Chip key={index} label={tag} />;
                        })}
                      </ImageTags>
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
  height: 100%;
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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: min-content;
  gap: 10px;
  width: 100%;
`;

const Card = styled.div<{ theme: themeType; isSelected: boolean }>`
  width: 100%;
  height: 144px;
  height: 180px;
  box-shadow: ${({ theme, isSelected }) =>
    `0 0 0 1px ${
      isSelected
        ? theme.color.primary[theme.mode === 'light' ? 800 : 300]
        : Color(theme.color.neutral[theme.mode][theme.mode === 'light' ? 800 : 300])
            .alpha(0.56)
            .string()
    }`};
  border-radius: ${({ theme }) => theme.radius};
  ${({ theme, isSelected }) => `
    &:hover, &:focus, &:active {
      background-color: ${Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
        .alpha(0.2)
        .string()};
      box-shadow: 0 0 0 1px ${
        isSelected
          ? theme.color.primary[theme.mode === 'light' ? 800 : 300]
          : Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
              .alpha(0.2)
              .string()
      }, 0 3.6px 7.2px 0 ${Color(theme.color.neutral[theme.mode][1500])
    .alpha(0.13)
    .string()}, 0 0.6px 1.8px 0 ${Color(theme.color.neutral[theme.mode][1500]).alpha(0.13).string()};
    }
    &:hover:active {
      background-color: ${Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
        .alpha(0.25)
        .string()};
      box-shadow: 0 0 0 1px ${
        isSelected
          ? theme.color.primary[theme.mode === 'light' ? 800 : 300]
          : Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
              .alpha(0.25)
              .string()
      } 0 1.8px 3.6px 0 ${Color(theme.color.neutral[theme.mode][1500])
    .alpha(0.13)
    .string()}, 0 0.3px 0.9px 0 ${Color(theme.color.neutral[theme.mode][1500]).alpha(0.13).string()};
    }
  `};
  transition: border-color 160ms, border-radius 160ms, background-color 160ms, box-shadow 160ms;
`;

const ImageBG = styled.div<{ src: string; theme: themeType }>`
  width: 100%;
  height: calc(100% - 34px - 28px);
  background-image: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: ${({ theme }) => `${theme.radius} ${theme.radius} 0 0`};
`;

const ImageLabel = styled.div<{ theme: themeType }>`
  font-size: 14px;
  font-family: ${({ theme }) => theme.font.detail};
  padding: 8px 10px 2px 10px;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  border-top: ${({ theme }) => `1px solid ${Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()}`};
`;

const ImageTags = styled.div<{ theme: themeType }>`
  padding: 2px 4px 8px 4px;
  align-items: center;
  overflow-y: hidden;
  overflow-x: auto;
  white-space: nowrap;
`;

const Spinner = styled(CircularProgress)<{ theme: themeType }>`
  width: 20px !important;
  height: 20px !important;
  margin: 10px;
  color: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 900 : 300]} !important;
`;

export { PhotoLibraryPage };
