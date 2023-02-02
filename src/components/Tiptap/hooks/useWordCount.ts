import type { Editor } from '@tiptap/react';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useState } from 'react';

/**
 * Returns the word count of the the content found in the editor JSON.
 * Accepts an optional debounce parameter to ensure the state does not update
 * too quickly (defaults to 5000 milliseconds).
 */
function useWordCount({ editor, debounce }: WordCountProps): number {
  const [wordCount, setWordCount] = useState<number>(0);

  // keep the editor word count up to date (debounce with 5 second delay)
  editor?.on('update', ({ editor }) => {
    // get the editor JSON
    const jsonContent = editor.getJSON().content;

    // if the editor has JSON, parse the word count from the JSON
    if (jsonContent) updateWordCount(jsonContent);
  });

  /**
   * Update the word count after the required wait time (default 5000 ms).
   */
  const updateWordCount = AwesomeDebouncePromise(async (content: JSONContent[]) => {
    const count = await getWordCount(content);
    setWordCount(count);
  }, debounce || 5000);

  return wordCount;
}

/**
 * Calculate the word count of the the content found in prosemirror JSON.
 * @param content content value from prosemirror JSON
 * @returns number of words
 */
async function getWordCount(content: JSONContent[]) {
  let wordCount = 0;

  // loop through array of content
  for (let i = 0; i < content.length; i++) {
    const chunk = content[i];

    // if the chunk is text add to the word count
    if (chunk.text) {
      // (1) remove extra white space
      // (2) split at space characters
      // (3) get the length of the resultant array
      const chunkWordCount = chunk.text.replace(/\s+/g, ' ').split(' ').length;
      // add the word count for the chunk to the overall word count
      wordCount += chunkWordCount;
    } else if (chunk.content) {
      wordCount += await getWordCount(chunk.content);
    }
  }

  return wordCount;
}

interface WordCountProps {
  editor: Editor | null;
  debounce?: number; // milliseconds
}

type JSONContent = { type?: string; text?: string; content?: JSONContent[] };

export { useWordCount };
