import { ApolloClient } from '@apollo/client';
import {
  isTypeTuple,
  MongooseSchemaType,
} from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import Collaboration from '@tiptap/extension-collaboration';
import { Editor as TipTapEditor, Extensions as TipTapExtensions } from '@tiptap/react';
import { get as getProperty, set as setProperty } from 'object-path';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';
import { z } from 'zod';
import { editorExtensions } from '../../../components/CollaborativeFields/editorExtensions';
import { populateReferenceValues } from '../../../components/ContentField/populateReferenceValues';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';

function addToY(
  y: EntryY,
  schemaDef: DeconstructedSchemaDefType,
  client: ApolloClient<object>,
  inputData: any
) {
  const data = JSON.parse(JSON.stringify(inputData));

  const JSONFields = schemaDef.filter(([key, def]) => def.type === 'JSON').map(([key, def]) => key);

  JSONFields.forEach((key) => {
    data[key] = JSON.parse(getProperty(data, key));
  });

  schemaDef
    .filter(([key, def]) => def.field?.hidden !== true)
    .forEach(([key, def]) => {
      if (!y.ydoc) return;

      const [schemaType, isArray] = (() => {
        const schemaType: MongooseSchemaType | 'DocArray' = isTypeTuple(def.type) ? def.type[1] : def.type;
        const isArrayType = Array.isArray(schemaType);

        if (isArrayType) return [schemaType[0], true];
        return [schemaType, false];
      })();

      const options = def.field?.options as unknown as
        | { value: string | number; label: string; disabled?: boolean }[]
        | undefined;

      const reference = def.field?.reference;

      /**
       * BOOLEAN
       *
       * Booleans are stored in a shared map that contain
       * all booleans. The field's value is stored as a key
       * in the map.
       *
       * ? Arrays of booleans are not handled in the Cristata UI
       */
      if (schemaType === 'Boolean') {
        if (isArray) return;

        const booleanMap = y.ydoc.getMap<Record<string, boolean>>('__checkboxes');
        booleanMap.set(key, getProperty(data, key));
      }

      /**
       * DATE
       *
       * Dates are stored in a shared text type.
       * Each field has it's own shared text type attached
       * to the yjs document.
       *
       * Date fields do not allow modifying individual characters,
       * so the entire text in the shared type can be replaced.
       * (this is what happens in the UI when a date is changed.)
       *
       * ? Arrays of dates are not handled in the Cristata UI
       */
      if (schemaType === 'Date') {
        if (isArray) return;

        const dateText = y.ydoc.getText(key);
        dateText.delete(0, dateText.toJSON()?.length); // delete any existing text

        const validator = z.string().optional().nullable();
        const date = validator.parse(getProperty(data, key));

        if (date && date !== '0001-01-01T01:00:00.000Z') {
          dateText.insert(0, date); // asume value is ISO date
        }
      }

      /**
       * DOCUMENT ARRAYS
       *
       * DocArrays are stored in a yjs shared array. The value
       * of each doc is an object with keys, and we store
       * each object in the shared array. *There is no validation
       * of the object contents.*
       *
       * DocArray children are fields that may create their own
       * shared type. These are always prefixed with
       * `__docArray.KEY.`, where `KEY` is the key of the doc array.
       * These need to be deleted when we are setting the doc array
       * so there are no leftover usused shared types.
       *
       * To ensure the DocArray children can be uniquely
       * identified, we also inject a uuid into each object
       * in the shared array.
       *
       * ? Doc Arrays are always arrays. There cannot be a single doc.
       */
      if (schemaType === 'DocArray') {
        const array = y.ydoc.getArray(key);
        array.delete(0, array.toArray()?.length);

        // remove shared types that were created as a result
        // of this docArray
        y.ydoc.share.forEach((share, shareName) => {
          if (shareName.includes(`__docArray.${key}.`)) {
            y.ydoc?.share.delete(shareName);
          }
        });

        const validator = z.record(z.any()).array();
        const res = validator.parse(getProperty(data, key));

        // track the generated uuids so we can create types
        // for the fields in each doc
        let generatedUuids: string[] = [];

        // push each doc into the array
        array.push(
          res.map((rest) => {
            const __uuid = uuidv4();
            generatedUuids.push(__uuid);
            return { ...rest, __uuid };
          })
        );

        if (def.docs) {
          generatedUuids.forEach((uuid, index) => {
            const namedSubdocSchemas = def.docs
              .filter(([docKey]) => !docKey.includes('#'))
              .map(([docKey, docDef]): typeof def.docs[0] => {
              const valueKey = docKey.replace(key, `${key}.${index}`);
              const docArrayKey = docKey.replace(key, `__docArray.${key}.${uuid}`);

              const value = getProperty(data, valueKey);
              setProperty(data, docArrayKey, value);

              return [docArrayKey, docDef];
            });
            addToY(y, namedSubdocSchemas, client, data);
          });
        }
      }

      /**
       * FLOAT
       *
       * Floats are stored in a shared XML Fragment.
       * Fields in the UI are powered by TipTap.
       * TipTap will add XML tags as needed, so we just
       * set the fragment value to a stringified float.
       *
       * When floats are in an array, they are stored
       * in a shared array of objects containing a
       * value, label, and other optional metadata.
       */
      if (schemaType === 'Float') {
        if (isArray || options) {
          const floatArray = y.ydoc.getArray(key);
          floatArray.delete(0, floatArray.toArray()?.length);

          const validator = z.number().array().optional().nullable();
          const floats = validator.parse(options ? [getProperty(data, key)] : getProperty(data, key));

          if (floats) {
            floatArray.push(
              floats.map((float) => {
                const matchingOption = options?.find((opt) => opt.value.toString() === float.toString());
                return matchingOption || { value: float.toString(), label: float.toString() };
              })
            );
          }

          return;
        }

        const validator = z.number().optional().nullable();
        const float = validator.parse(getProperty(data, key));

        setTipTapXMLFragment(key, float?.toString(), y.ydoc, editorExtensions.float);

        return;
      }

      if (schemaType === 'JSON') {
        // Nothing should reach here
        // because JSON fields are converted
        // to the fields they actualy represent.
        // If a value reaches here, do nothing.
        // The UI will show it as uneditable JSON.
      }

      /**
       * NUMBER (INTEGER)
       *
       * Numbers are stored in a shared XML Fragment.
       * Fields in the UI are powered by TipTap.
       * TipTap will add XML tags as needed, so we just
       * set the fragment value to a stringified integer.
       *
       * When integers are in an array, they are stored
       * in a shared array of objects containing a
       * value, label, and other optional metadata.
       */
      if (schemaType === 'Number') {
        if (isArray || options) {
          const intArray = y.ydoc.getArray(key);
          intArray.delete(0, intArray.toArray()?.length);

          const validator = z.number().array().optional().nullable();
          const ints = validator.parse(options ? [getProperty(data, key)] : getProperty(data, key));

          if (ints) {
            intArray.push(
              ints.map((int) => {
                const matchingOption = options?.find((opt) => opt.value.toString() === int.toString());
                return matchingOption || { value: int.toString(), label: int.toString() };
              })
            );
          }

          return;
        }

        const validator = z.number().optional().nullable();
        const int = validator.parse(getProperty(data, key));

        setTipTapXMLFragment(key, int?.toString(), y.ydoc, editorExtensions.integer);

        return;
      }

      /**
       * OBJECTID (REFERENCE)
       *
       * ObjectId fields are stored in a shared
       * array of objects containing a value,
       * label, and other optional metadata.
       *
       * The shared array if used for both single
       * ObjectIds and arrays of ObjectIds. The
       * UI clears the existing array values
       * when selecting on option in a field that
       * only allows one selection.
       */
      if (schemaType === 'ObjectId') {
        const array = y.ydoc.getArray(key);
        array.delete(0, array.toArray()?.length);

        const validator = z.union([
          z.string().array().optional().nullable(),
          z.object({ _id: z.string(), name: z.string().optional() }).array(),
        ]);
        const res = validator.parse(isArray ? getProperty(data, key) : [getProperty(data, key)]);

        let unpopulated: { _id: string; label?: string }[] = [];
        if (res && res[0]) {
          const isIdArray = typeof res[0] === 'string';

          if (isIdArray) {
            unpopulated = (res as string[]).map((_id) => ({ _id }));
          } else {
            unpopulated = (res as { _id: string; name?: string }[]).map(({ _id, name }) => ({
              _id,
              label: name,
            }));
          }
        }

        if (def.field?.reference?.collection) {
          const populated = populateReferenceValues(
            client,
            unpopulated,
            def.field.reference.collection,
            def.field.reference.fields
          );
          populated.then((values) => {
            array.push(
              values.map(({ _id, label }) => {
                return { value: _id, label };
              })
            );
          });
        } else {
          array.push(
            unpopulated.map(({ _id, label }) => {
              return { value: _id, label: label || _id };
            })
          );
        }
      }

      /**
       * STRING
       *
       * Strings are stored in a shared XML Fragment.
       * Fields in the UI are powered by TipTap.
       * TipTap will add XML tags as needed, so we just
       * need to set the fragment value.
       *
       * When strings are in an array, they are stored
       * in a shared array of objects containing a
       * value, label, and other optional metadata.
       */
      if (schemaType === 'String') {
        if (isArray || options || reference) {
          const strArray = y.ydoc.getArray(key);
          strArray.delete(0, strArray.toArray()?.length);

          const validator = z.string().optional().nullable().array().optional().nullable();
          const strings = validator.parse(
            options || reference ? [getProperty(data, key)] : getProperty(data, key)
          );

          if (strings) {
            strArray.push(
              strings
                .filter((str): str is string => !!str)
                .map((str) => {
                  const matchingOption = options?.find((opt) => opt.value.toString() === str);
                  return matchingOption || { value: str, label: str };
                })
            );
          }

          return;
        }

        const validator = z.string().optional().nullable();
        const str = validator.parse(getProperty(data, key));

        setTipTapXMLFragment(key, str, y.ydoc, editorExtensions[def.field?.tiptap ? 'tiptap' : 'text']);

        return;
      }
    });
}

function setTipTapXMLFragment(
  field: string,
  content: string | undefined | null,
  document: Y.Doc,
  extensions: TipTapExtensions
) {
  // delete current value
  const current = document.getXmlFragment(field);
  current.delete(0, current.length);

  // set value in tiptap
  const tiptap = new TipTapEditor({
    extensions: [
      ...extensions,
      // set the sharsed type value at the provided key
      Collaboration.configure({ document, field }),
    ],
  });

  // set the shared type based on this value
  if (content) {
    // if content is stringified json object, parse it before inserting it
    if (isObjectJSONString(content)) {
      tiptap.commands.setContent(JSON.parse(content));
    } else {
      tiptap.commands.setContent(content);
    }
  }

  // destory tiptap editor
  tiptap.destroy();
}

/**
 * Returns whether an input string is a
 * stringified JSON object.
 */
function isObjectJSONString(str: string) {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

export { addToY };
