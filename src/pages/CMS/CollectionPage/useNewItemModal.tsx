/* eslint-disable react-hooks/rules-of-hooks */
import { gql, useApolloClient } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { Checkbox, DateTime, Number, Text } from '../../../components/ContentField';
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

    const [{ schemaDef, by }] = useCollectionSchemaConfig(collectionName);
    const requiredFields = schemaDef.filter(([, def]) => def.required && def.default === undefined);

    const [state, setState] = useState<Record<string, boolean | number | string | undefined>>(
      merge(
        {},
        ...requiredFields
          .map(([key, def]): Record<string, string | undefined> | null => {
            if (def.type === 'Boolean') return { [key]: undefined };
            if (def.type === 'Date') return { [key]: undefined };
            if (def.type === 'Float') return { [key]: undefined };
            if (def.type === 'Number') return { [key]: undefined };
            if (def.type === 'String' && key === 'name') {
              const name = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals],
                separator: '-',
              });
              return { name };
            }
            if (def.type === 'String') return { [key]: undefined };
            return null;
          })
          .filter((v): v is Record<string, undefined> => !!v)
      )
    );

    const allValuesAreSet = Object.entries(state).every(([, value]) => value !== undefined);

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
            `/cms/collection/${uncapitalize(camelToDashCase(collectionName))}/${
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
          {(requiredFields || []).map(([key, def], index) => {
            const fieldName = def.field?.label || key;

            if (def.type === 'Boolean') {
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
            if (def.type === 'Date') {
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
            if (def.type === 'Float') {
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
            if (def.type === 'Number') {
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
            if (def.type === 'String') {
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
            return <></>;
          })}
        </>
      ),
    };
  }, []);

  return [WindowModal, showModal, hideModal];
}

export { useNewItemModal };
