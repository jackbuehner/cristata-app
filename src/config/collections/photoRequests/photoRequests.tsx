import { gql } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { Chip } from '../../../components/Chip';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType } from '../../../utils/theme/theme';
import { collection } from '../../collections';

const photoRequests: collection = {
  query: {
    name: {
      singular: 'photoRequest',
      plural: 'photoRequests',
    },
    identifier: '_id',
    force: ['hidden'],
  },
  columns: [
    { key: 'name', label: 'Request', width: 350 },
    {
      key: 'stage',
      label: 'Stage',
      render: (data) => {
        enum Stage {
          'New' = 1.1,
          'In-progress' = 2.1,
          'Fulfilled' = 3.1,
        }
        const Color: { [key: number]: colorType } = {
          1.1: 'red',
          2.1: 'orange',
          3.1: 'green',
        };

        return (
          <Chip label={Stage[data.stage]} color={Color[data.stage] || 'neutral'} data-number={data.stage} />
        );
      },
      width: 100,
    },
    {
      key: 'people.requested_by',
      label: 'Requested by',
      subfields: ['name', 'photo', '_id'],
      render: (data) => {
        if (data.people?.requested_by) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={
                  data.people.requested_by.photo
                    ? data.people.requested_by.photo
                    : data.people.requested_by._id
                    ? genAvatar(data.people.requested_by._id)
                    : null
                }
                alt={``}
                style={{ width: 20, height: 20, borderRadius: 2 }}
              />
              <span style={{ fontSize: 14 }}>{data.people.requested_by.name}</span>
            </div>
          );
        }
        return <span></span>;
      },
      isSortable: false,
    },
  ],
  row: { href: '/cms/collection/photo-requests/item', hrefSuffixKey: '_id' },
  createNew: ([loading, setIsLoading], client, toast, navigate) => {
    setIsLoading(true);

    const CREATE_NEW_PHOTO_REQUEST = gql(
      jsonToGraphQLQuery({
        mutation: {
          __name: 'photoRequestCreate',
          __variables: {
            name: 'String!',
          },
          photoRequestCreate: {
            __args: {
              name: new VariableType('name'),
            },
            _id: true,
          },
        },
      })
    );

    client
      .mutate({
        mutation: CREATE_NEW_PHOTO_REQUEST,
        variables: {
          name: uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: '-',
          }),
        },
      })
      .then(({ data }) => {
        setIsLoading(false);
        navigate(`/cms/item/photo-requests/${data.photoRequestCreate._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

export { photoRequests };
