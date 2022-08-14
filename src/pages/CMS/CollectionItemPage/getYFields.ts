import {
  isTypeTuple,
  MongooseSchemaType,
} from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import { set as setProperty } from 'object-path';
import fieldUtils from '../../../components/CollaborativeFields/utils';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';

interface GetYFieldsOptions {
  retainReferenceObjects: boolean;
}

function getYFields(y: EntryY, schemaDef: DeconstructedSchemaDefType, opts?: GetYFieldsOptions) {
  const data: any = {};

  // const JSONFields = schemaDef.filter(([key, def]) => def.type === 'JSON').map(([key, def]) => key);

  // JSONFields.forEach((key) => {
  //   data[key] = JSON.parse(getProperty(data, key));
  // });

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

      if (schemaType === 'Boolean') {
        // arrays of booleans are not supported in the app
        if (isArray) return;

        const boolean = new fieldUtils.shared.Boolean(y.ydoc);
        setProperty(data, key, boolean.get(key));
      }

      if (schemaType === 'Date') {
        // arrays of dates are not supported in the app
        if (isArray) return;

        const date = new fieldUtils.shared.Date(y.ydoc);
        setProperty(data, key, date.get(key));
      }

      if (schemaType === 'DocArray') {
        const array = new fieldUtils.shared.DocArray(y.ydoc);
        setProperty(
          data,
          key,
          array.get(key).map(({ __uuid, ...rest }) => rest)
        );
      }

      if (schemaType === 'Float') {
        const float = new fieldUtils.shared.Float(y.ydoc);
        if (isArray || options || reference) {
          const ids = float.get(key, true).map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
        } else {
          setProperty(data, key, float.get(key, false));
        }
      }

      if (schemaType === 'JSON') {
        // Nothing should reach here
        // because JSON fields are converted
        // to the fields they actualy represent.
        // If a value reaches here, do nothing.
        // The UI will show it as uneditable JSON.
      }

      if (schemaType === 'Number') {
        const integer = new fieldUtils.shared.Integer(y.ydoc);
        if (isArray || options || reference) {
          const ids = integer.get(key, true).map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
        } else {
          setProperty(data, key, integer.get(key, false));
        }
      }

      if (schemaType === 'ObjectId') {
        const reference = new fieldUtils.shared.Reference(y.ydoc);
        const values = reference.get(key);
        if (opts?.retainReferenceObjects) {
          setProperty(data, key, isArray ? values : values[0]);
        } else {
          const ids = values.map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
        }
      }

      if (schemaType === 'String') {
        const string = new fieldUtils.shared.String(y.ydoc);
        if (isArray || options || reference) {
          const ids = string.get(key, true, false).map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
        } else {
          setProperty(data, key, string.get(key, false, !!def.field?.tiptap));
        }
      }
    });

  return data;
}

export { getYFields };
export type { GetYFieldsOptions };
