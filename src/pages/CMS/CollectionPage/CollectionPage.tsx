import { useApolloClient } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ArrowClockwise16Regular, Filter16Regular, FilterDismiss16Regular } from '@fluentui/react-icons';
import pluralize from 'pluralize';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { useLocation, useNavigate, useParams } from 'svelte-preprocess-react/react-router';
import { v4 as uuidv4 } from 'uuid';
import { Menu } from '../../../components/Menu';
import type { mongoFilterType } from '../../../graphql/client';
import type { SIGN_S3__DOC_TYPE, SIGN_S3__TYPE } from '../../../graphql/queries';
import { SIGN_S3 } from '../../../graphql/queries';
import type { CREATE_FILE__TYPE } from '../../../graphql/queries/CREATE_FILE';
import { CREATE_FILE } from '../../../graphql/queries/CREATE_FILE';
import { useDropdown } from '../../../hooks/useDropdown';
import { useAppDispatch } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName, setAppSearchShown } from '../../../redux/slices/appbarSlice';
import { capitalize } from '../../../utils/capitalize';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { isJSON } from '../../../utils/isJSON';
import type { themeType } from '../../../utils/theme/theme';
import type { ICollectionTableImperative } from './CollectionTable';
import { CollectionTable } from './CollectionTable';
import { useNewItemModal } from './useNewItemModal';

type CreateNewStateType = {
  /**
   * The fields that should appear in the modal.
   *
   * A field marked as required will display an indicator that it is required.
   * The `create` function is responsible for ensuring that the field has an
   * acceptable value.
   *
   * **Options**
   *
   * text: text field
   */
  fields: { type: 'text'; label: string; key: string; required?: true }[];
  /**
   * The state of the fields (the field values).
   *
   * When modifying other parts of this state object, be sure to
   * always copy this state object into the main state object. Failure to
   * do this will result in data loss.
   */
  state: Record<string, unknown>;
  /**
   * The function that executes after the user clicks the 'create' button.
   *
   * `args` is the resulting values from the modal fields defined in `fields`
   *
   * Return true to tell the app that the modal should close.
   * Return false to tell the app that the modal should stay open.
   */
  create: (args: CreateNewStateType['state']) => boolean;
};

const TableWrapper = styled.div<{ theme?: themeType }>`
  position: relative;
  padding: 20px;
  overflow: hidden;
  height: 100%;
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
`;

function CollectionPage() {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const location = useLocation();
  const client = useApolloClient();
  const tenant = location.pathname.split('/')[1];

  const [isLoading, setIsLoading] = useState(true);

  // get the url parameters from the route
  let { collection = 'photos' } = useParams();

  // get the search params so we can get filters and other page data
  const searchParams = new URLSearchParams(location.search);

  // build a filter for the table based on url search params
  const defaultFilter: mongoFilterType = { hidden: { $ne: true }, archived: { $ne: true } };
  searchParams.forEach((value, param) => {
    // ignore values that start with two underscores because these are
    // parameters used in the page instead of filters
    if (param.indexOf('__') === 0) return;

    // if the param name is _search, search the text index
    if (param === '_search') {
      defaultFilter.$text = { $search: value };
      return;
    }

    // handle special filters, which are in the format key:filterName:filterValue
    if (value.includes(':') && value.split(':').length === 2) {
      const [filterName, filterValue] = value.split(':');

      if (filterName === 'size') {
        defaultFilter[param] = { $size: parseInt(filterValue) || 0 };
        return;
      }

      return;
    }

    const isNegated = param[0] === '!';
    const isArray = isJSON(value) && Array.isArray(JSON.parse(value));

    const parseBooleanString = (str: string) => {
      if (str.toLowerCase() === 'true') return true;
      else if (str.toLowerCase() === 'false') return false;
      return undefined;
    };

    if (isNegated && isArray) defaultFilter[param.slice(1)] = { $nin: JSON.parse(value) };
    if (isNegated && !isArray)
      defaultFilter[param.slice(1)] = {
        $ne: parseBooleanString(value) !== undefined ? parseBooleanString(value) : parseFloat(value) || value,
      };
    if (!isNegated && isArray) defaultFilter[param] = { $in: JSON.parse(value) };
    if (!isNegated && !isArray)
      defaultFilter[param] = !isNaN(parseFloat(value))
        ? { $eq: parseFloat(value) }
        : parseBooleanString(value) !== undefined
        ? { $eq: parseBooleanString(value) }
        : { $regex: value, $options: 'i' };
  });

  // set the collection name
  const collectionName = capitalize(pluralize.singular(dashToCamelCase(collection)));
  // set the page title
  const pageTitle =
    // if defined, attempt to use the page title in the query string
    searchParams.get('__pageTitle') ||
    // otherwise, build a title using the collection string
    collection.slice(0, 1).toLocaleUpperCase() + collection.slice(1).replace('-', ' ') + ' collection';
  // set the data filter for mongoDB
  const mongoDataFilter = defaultFilter;

  // set document title
  useEffect(() => {
    document.title = `${pageTitle} - Cristata`;
  }, [pageTitle]);

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // createNew modal
  const [NewItemWindow, createNew] = useNewItemModal(collectionName, navigate);

  // tools dropdown
  const [showToolsDropdown] = useDropdown(
    (triggerRect, dropdownRef, _, { navigate, close }) => {
      return (
        <Menu
          ref={dropdownRef}
          onEscape={close}
          afterClick={close}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left + triggerRect.width - 240,
            width: 240,
          }}
          items={[
            {
              label: 'Refresh data',
              icon: <ArrowClockwise16Regular />,
              onClick: () => tableRef.current?.refetchData(),
            },
            {
              label: 'Filter',
              icon: <Filter16Regular />,
              onClick: () => null,
              disabled: true,
              'data-tip': 'Filtering is currently unavailable.',
            },
            {
              label: 'Clear filter',
              icon: <FilterDismiss16Regular />,
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

  // create a ref for the actual input element and provide a function to click it
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const upload = () => {
    uploadInputRef?.current?.click();
  };

  // track table items that have been selected
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string>();

  const tableRef = useRef<ICollectionTableImperative>(null);

  // keep loading state synced
  useEffect(() => {
    dispatch(setAppLoading(isLoading));
  }, [dispatch, isLoading]);

  // keep track of the upload progress
  const [uploadProgress, setUploadProgress] = useState<number>(0); // should be between 0 and 1

  // keep track of the upload status
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  useEffect(() => {
    if (uploadProgress > 0 && uploadProgress < 1)
      setUploadStatus(`Uploading (${(uploadProgress * 100).toFixed(0)}%)...`);
  }, [uploadProgress]);

  const [canCreate, setCanCreate] = useState(tableRef.current?.getPermissions()?.create);
  useEffect(() => {
    setCanCreate(tableRef.current?.getPermissions()?.create);
  }, [isLoading]);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName(pageTitle));
    dispatch(setAppName(`${pageTitle}${uploadStatus ? ` - ${uploadStatus}` : ``}`));
    dispatch(
      setAppActions([
        {
          label: 'Search',
          type: 'icon',
          icon: 'Search20Regular',
          action: () => dispatch(setAppSearchShown(true)),
        },
        {
          label: collectionName === 'File' ? 'Upload' : 'Create new',
          type: 'button',
          action: collectionName === 'File' ? upload : createNew,
          icon: collectionName === 'File' ? 'ArrowUpload20Regular' : undefined,
          disabled: !!isLoading || !!uploadStatus || !navigator.onLine || !canCreate,
        },
        {
          label: 'Tools',
          type: 'button',
          action: (e) => {
            // refetch data on shift click
            if (e.ctrlKey || e.metaKey) tableRef.current?.refetchData();
            // otherwise, open dropdown
            else showToolsDropdown(e);
          },
          onAuxClick: ({ button }) => {
            // refetch data on middle click
            if (button === 1) tableRef.current?.refetchData();
          },
          'data-tip': `${
            // @ts-expect-error userAgentData exists
            navigator.userAgentData?.platform === 'macOS' ? 'cmd' : 'ctrl'
          } + click to refresh data`,
          showChevron: true,
        },
      ])
    );
  }, [canCreate, collectionName, createNew, dispatch, isLoading, pageTitle, showToolsDropdown, uploadStatus]);

  /**
   * Gets a signed request and file url for a file that needs to be uploaded to the s3 bucket
   */
  const getSignedRequest = async (file: File, uuid: string) => {
    return client
      .mutate<SIGN_S3__TYPE>({
        mutation: SIGN_S3,
        variables: {
          fileName: uuid || file.name,
          fileType: file.type,
          s3Bucket: `app.cristata.${tenant}.files`,
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
   * adds a new file to s3 and the database
   */
  const addNewFile = async (file: File) => {
    setIsLoading(true);
    const uuid = uuidv4();

    // get the signed request url and the target url for the file
    setUploadStatus('Preparing to upload...');
    const { signedRequest, location: fileUrl } = await getSignedRequest(file, uuid);

    if (signedRequest && fileUrl) {
      // upload the file to s3
      const isUploaded = await uploadFile(file, signedRequest);

      if (isUploaded) {
        setUploadStatus('Finishing upload...');
        await client
          .mutate<CREATE_FILE__TYPE>({
            mutation: CREATE_FILE,
            variables: {
              name: file.name,
              file_type: file.type,
              size_bytes: file.size,
              uuid: uuid,
            },
          })
          .then((res) => {
            const _id = res.data?.fileCreate._id;

            setIsLoading(false);
            setUploadStatus(null);
            tableRef.current?.refetchData();

            // open the document
            if (_id) {
              navigate(`/${tenant}/cms/collection/files/${_id}`);
            }
          })
          .catch((error) => {
            setIsLoading(false);
            setUploadStatus(null);
            tableRef.current?.refetchData();

            // log and toast errors
            console.error(error.graphQLErrors?.[0]?.message || error.message);
            toast.error(error.graphQLErrors?.[0]?.message || error.message);
          });
      }
    }
  };

  return (
    <>
      {NewItemWindow}
      <input
        ref={uploadInputRef}
        type={`file`}
        onChange={async (e) => {
          if (e.target.files) {
            addNewFile(e.target.files[0]);
          }
        }}
        style={{ display: 'none' }}
      />
      <TableWrapper theme={theme}>
        <CollectionTable
          collection={collectionName}
          filter={mongoDataFilter}
          ref={tableRef}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          selectedIdsState={[selectedIds, setSelectedIds]}
          lastSelectedIdState={[lastSelectedId, setLastSelectedId]}
        />
      </TableWrapper>
    </>
  );
}

export { CollectionPage };
export type { CreateNewStateType };
