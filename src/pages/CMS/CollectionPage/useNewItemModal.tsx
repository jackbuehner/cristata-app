import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { NavigateFunction } from 'svelte-preprocess-react/react-router';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';

/* eslint-disable react-hooks/rules-of-hooks */
import { gql, useApolloClient } from '@apollo/client';
import { isTypeTuple, MongooseSchemaType } from '@jackbuehner/cristata-generator-schema';
import { Checkbox, DateTime, Number, ReferenceOne, SelectMany, Text } from '../../../components/ContentField';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import { useWindowModal } from '../../../hooks/useWindowModal';
import { camelToDashCase } from '../../../utils/camelToDashCase';
import { uncapitalize } from '../../../utils/uncapitalize';
import { deepen } from '../CollectionItemPage/useFindDoc';

function useNewItemModal(
  collectionName: string,
  navigate: NavigateFunction
): [React.ReactNode, () => void, () => void] {
  const [WindowModal, showModal, hideModal] = useWindowModal(() => {
    const client = useApolloClient();
    const [loading, setLoading] = useState(false);
    const tenant = location.pathname.split('/')[1];

    const [{ schemaDef, by }] = useCollectionSchemaConfig(collectionName);
    const requiredFields = schemaDef.filter(
      ([key, def]) => def.required && def.default === undefined && !key.includes('.')
    );

    // create a state object for storing the field values that resets whenever required fields
    // no longer matches state
    const [state, setState] = useState<Record<string, boolean | number | string | undefined | string[]>>({});
    useEffect(() => {
      // check whether we need to reset the state because the requiredFields have changed
      const sameKeys =
        requiredFields.length === Object.keys(state).length &&
        requiredFields.map(([key]) => key).every((key) => Object.keys(state).includes(key));

      if (!sameKeys)
        setState(
          merge(
            {},
            ...requiredFields
              .map(([key, def]): Record<string, string | boolean | never[] | undefined> | null => {
                const type: MongooseSchemaType | 'DocArray' = isTypeTuple(def.type) ? def.type[1] : def.type;

                if (Array.isArray(type)) return { [key]: [] };
                else if (type === 'DocArray') return { [key]: [] };
                else if (type === 'Boolean') return { [key]: false };
                else if (type === 'Date') {
                  if (key === 'timestamps.published_at' || key === 'timestamps.updated_at') {
                    return { [key]: '0001-01-01T01:00:00.000+00:00' };
                  }
                  return { [key]: undefined };
                } else if (type === 'Float') return { [key]: undefined };
                else if (type === 'Number') return { [key]: undefined };
                else if (type === 'String' && key === 'name') {
                  const name = uniqueNamesGenerator({
                    dictionaries: [adjectives, colors, animals],
                    separator: '-',
                  });
                  return { name };
                } else if (type === 'String') return { [key]: undefined };
                else if (type === 'JSON') return { [key]: '{}' };
                else if (type === 'ObjectId') return { [key]: undefined };
                return null;
              })
              .filter((v): v is Record<string, undefined> => !!v)
          )
        );
    }, [requiredFields, state]);

    const allValuesAreSet = Object.entries(state).every(
      ([, value]) => value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
    );

    const create = () => {
      // show the loading indicator
      setLoading(true);

      // create the mutation
      const CREATE_ITEM = gql(
        jsonToGraphQLQuery({
          mutation: {
            response: {
              __aliasFor: `${uncapitalize(collectionName)}Create`,
              __args: merge(
                {},
                ...Object.entries(state).map(([key, value]) => {
                  if (value === undefined) return {};
                  return deepen({ [key]: value });
                })
              ),
              [by?.one || '_id']: true,
            },
          },
        })
      );

      // attempt to create a new shorturl document
      client
        .mutate<{ response?: { [key: string]: string } }>({
          mutation: CREATE_ITEM,
          fetchPolicy: 'network-only',
        })
        .finally(() => {
          // stop loading
          setLoading(false);
        })
        .then(({ data }) => {
          // navigate to the new document upon successful creation
          navigate(
            `${tenant}/cms/collection/${uncapitalize(camelToDashCase(collectionName))}/${
              data?.response?.[by?.one || '_id']
            }`
          );
        })
        .catch((err) => {
          // log and show the errors
          console.error(err);
          toast.error(`Failed to create a new document. \n ${err.message}`);
        });

      // do not close the modal after clicking the 'Create' button
      // because it will close automatically when the page redirects
      // to the new document upon successful document creation
      return false;
    };

    return {
      title: `Create new`,
      isLoading: loading,
      continueButton: { text: 'Create', disabled: !allValuesAreSet, onClick: create },
      windowOptions: { height: 600, name: 'Create new item CMS' },
      children: (
        <>
          {(requiredFields || [])
            .filter(([key, def], index) => key !== 'timestamps.published_at' && key !== 'timestamps.updated_at')
            // sort fields to match their order
            .sort((a, b) => {
              const orderA = parseInt(`${a[1].field?.order || 1000}`);
              const orderB = parseInt(`${b[1].field?.order || 1000}`);
              return orderA > orderB ? 1 : -1;
            })
            .map(([key, def], index) => {
              const type: MongooseSchemaType | 'DocArray' = isTypeTuple(def.type) ? def.type[1] : def.type;
              const fieldName = def.field?.label || key;

              if (type === 'Boolean') {
                return (
                  <Checkbox
                    key={index}
                    label={fieldName}
                    description={def.field?.description}
                    checked={!!state[key]}
                    disabled={loading}
                    isEmbedded
                    onChange={(e) => {
                      const newValue = e.currentTarget.checked;
                      if (newValue !== undefined) setState({ ...state, [key]: newValue });
                    }}
                  />
                );
              }
              if (type === 'Date') {
                return (
                  <DateTime
                    key={index}
                    label={fieldName}
                    description={def.field?.description}
                    value={state[key] as string}
                    onChange={(date) => {
                      if (date) setState({ ...state, [key]: date.toUTC().toISO() });
                    }}
                    placeholder={'Pick a time'}
                    disabled={loading}
                    isEmbedded
                  />
                );
              }
              if (type === 'Float') {
                return (
                  <Number
                    key={index}
                    type={'Float'}
                    label={fieldName}
                    description={def.field?.description}
                    value={state[key] as number}
                    disabled={loading}
                    isEmbedded
                    onChange={(e) => {
                      const newValue = e.currentTarget.valueAsNumber;
                      if (isNaN(newValue)) setState({ ...state, [key]: undefined });
                      else if (newValue !== undefined) setState({ ...state, [key]: newValue });
                    }}
                  />
                );
              }
              if (type === 'Number') {
                return (
                  <Number
                    key={index}
                    type={'Int'}
                    label={fieldName}
                    description={def.field?.description}
                    value={state[key] as number}
                    disabled={loading}
                    isEmbedded
                    onChange={(e) => {
                      const newValue = e.currentTarget.valueAsNumber;
                      if (isNaN(newValue)) setState({ ...state, [key]: undefined });
                      else if (newValue !== undefined) setState({ ...state, [key]: newValue });
                    }}
                  />
                );
              }
              if (type === 'ObjectId' && (def.field?.reference?.collection || isTypeTuple(def.type))) {
                const collection = isTypeTuple(def.type)
                  ? def.type[0].replace('[', '').replace(']', '')
                  : def.field!.reference!.collection!;

                return (
                  <ReferenceOne
                    key={index}
                    label={fieldName}
                    description={def.field?.description}
                    value={{ _id: `${state[key]}` }}
                    disabled={loading}
                    isEmbedded
                    collection={pluralize.singular(collection)}
                    reference={def.field?.reference}
                    onChange={(newValue) => {
                      if (newValue?._id) setState({ ...state, [key]: newValue._id });
                    }}
                  />
                );
              }
              if (type === 'String' || type === 'ObjectId') {
                return (
                  <Text
                    key={index}
                    label={fieldName}
                    description={def.field?.description}
                    value={state[key] as string}
                    disabled={loading}
                    isEmbedded
                    onChange={(e) => {
                      const newValue = e.currentTarget.value;
                      if (newValue !== undefined) setState({ ...state, [key]: newValue });
                    }}
                  />
                );
              }
              if (type[0] === 'String') {
                const values = (() => {
                  const provided = state[key];

                  if (Array.isArray(provided) && provided.every((value) => typeof value === 'string')) {
                    return (provided as string[]).map((value) => ({ value: value, label: value }));
                  }

                  return [];
                })();

                return (
                  <SelectMany
                    key={index}
                    label={fieldName}
                    description={def.field?.description}
                    values={values}
                    type={'String'}
                    options={def.field?.options}
                    disabled={loading}
                    isEmbedded
                    onChange={(newValues) => {
                      if (newValues !== undefined)
                        setState({ ...state, [key]: newValues.map((v) => `${v.value}`) });
                    }}
                  />
                );
              }
              return <>Field for {fieldName} missing</>;
            })}
        </>
      ),
    };
  }, [collectionName]);

  return [WindowModal, showModal, hideModal];
}

export { useNewItemModal };
