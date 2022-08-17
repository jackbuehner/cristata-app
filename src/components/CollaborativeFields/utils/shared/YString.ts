import * as Y from 'yjs';
import { editorExtensions } from '../../editorExtensions';
import { getTipTapEditorJson } from './getTipTapEditorJson';
import { setTipTapXMLFragment } from './setTipTapXMLFragment';

type Option = { value: string | number; label: string; disabled?: boolean };

/**
 * Strings are stored in a shared XML Fragment.
 * Fields in the UI are powered by TipTap.
 * TpTap will add XML tags as needed, so we just
 * need to set the fragment value.
 *
 * When strings are in an array, they are stored
 * in a shared array of objects containing a
 * value, label, and other optional metadata.
 */
class YString<K extends string, V extends string | undefined | null> {
  #ydoc: Y.Doc;

  constructor(ydoc: Y.Doc) {
    this.#ydoc = ydoc;
  }

  set(key: K, value: V, opt1?: 'code'): string;
  set(key: K, value: V, opt1?: 'tiptap'): Node;
  set(key: K, value: V[], opt1?: Option[]): Option[];
  set(key: K, value: V | V[], opt1?: Option[] | 'code' | 'tiptap'): string | Node | Option[] {
    const options = Array.isArray(opt1) ? opt1 : undefined;
    const isRichText = opt1 === 'tiptap';
    const isCode = opt1 === 'code';

    if (Array.isArray(value)) {
      // get/create the shared type
      const type = this.#ydoc.getArray<Option>(key);

      // clear existing values
      type.delete(0, type.toArray()?.length);

      // push new values
      type.push(
        value
          .filter((str): str is NonNullable<V> => !!str)
          .map((str) => {
            // use value of option that matches `value`
            // if there is a match
            const matchingOption = options?.find((opt) => opt.value.toString() === str);
            return matchingOption || { value: str, label: str };
          })
      );

      return type.toArray();
    }

    if (isCode) {
      // get/create the shared type
      const type = this.#ydoc.getText(key);

      // clear existing values
      type.delete(0, type.length);

      // set new values
      type.insert(0, value || '');

      return type.toJSON();
    }

    return setTipTapXMLFragment(key, value, this.#ydoc, editorExtensions[isRichText ? 'tiptap' : 'text']);
  }

  has(key: K): boolean {
    return this.#ydoc.share.has(key);
  }

  get(key: K, isArray: false, isRichText: boolean, isCode: boolean): string;
  get(key: K, isArray: true, isRichText: false, isCode: false): Option[];
  get(key: K, isArray: boolean, isRichText: boolean, isCode: boolean): string | Option[] {
    if (isArray) return this.#ydoc.getArray<Option>(key).toArray();
    if (isRichText)
      return getTipTapEditorJson(key, this.#ydoc, editorExtensions[isRichText ? 'tiptap' : 'text']);
    if (isCode) return this.#ydoc.getText(key).toJSON();
    return this.#ydoc.getXmlFragment(key).toDOM().textContent || '';
  }

  delete(key: K): void {
    this.#ydoc.share.delete(key);
  }
}

export { YString };
