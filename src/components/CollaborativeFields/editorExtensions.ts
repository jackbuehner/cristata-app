import Document from '@tiptap/extension-document';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Slice } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { ClassName } from '../Tiptap/extension-class-name';
import { Comment } from '../Tiptap/extension-comment';
import { FontSize } from '../Tiptap/extension-font-size';
import { PhotoWidget } from '../Tiptap/extension-photo';
import { PowerComment } from '../Tiptap/extension-power-comment';
import { PullQuote } from '../Tiptap/extension-pull-quote';
import { TrackChanges } from '../Tiptap/extension-track-changes';
import { SweepwidgetWidget } from '../Tiptap/extension-widget-sweepwidget';
import { YoutubeWidget } from '../Tiptap/extension-widget-youtube';

const ParagraphDocument = Document.extend({
  content: 'paragraph',
});

const Integer = Text.extend({
  addProseMirrorPlugins() {
    const schema = this.editor.schema;

    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleTextInput(view, from, to, text) {
            // cancel input if it contains non-numeric character
            if (text.match(/[^0-9]/g)) return true;

            return false;
          },
          handlePaste(view, event, slice) {
            const json = slice.toJSON();
            const tr = view.state.tr;
            if (json?.content[0].content[0].text) {
              const text = json.content[0].content[0].text;

              // replace invalid characters and then insert the string
              json.content[0].content[0].text = text.replace(/[^0-9]/g, '');
              view.dispatch(tr.replaceSelection(Slice.fromJSON(schema, json)));
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

const Float = Text.extend({
  addProseMirrorPlugins() {
    const schema = this.editor.schema;

    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleTextInput(view, from, to, text) {
            const hasDecimal = view.state.doc.textContent.includes('.');

            if (hasDecimal) {
              // cancel input if it contains non-numeric character
              if (text.match(/[^0-9]$/)) return true;
            } else {
              // cancel input if it contains non-numeric or non-decimal character
              if (text.match(/[^0-9,.]$/)) return true;
            }

            return false;
          },
          handlePaste(view, event, slice) {
            const json = slice.toJSON();
            const tr = view.state.tr;
            if (json?.content[0].content[0].text) {
              const text = json.content[0].content[0].text;

              // replace invalid characters and then insert the string
              json.content[0].content[0].text = text.replace(/(?<=(.*\..*))\./g, '');
              view.dispatch(tr.replaceSelection(Slice.fromJSON(schema, json)));
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

const editorExtensions = {
  tiptap: [
    StarterKit.configure({ history: false }),
    TrackChanges,
    Underline,
    TextStyle,
    FontFamily,
    FontSize,
    PowerComment,
    Comment,
    PullQuote,
    ClassName.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({
      HTMLAttributes: {
        target: '_self',
        rel: 'noopener noreferrer nofollow',
      },
      openOnClick: false,
      linkOnPaste: true,
    }),
    SweepwidgetWidget,
    YoutubeWidget,
    PhotoWidget,
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  text: [ParagraphDocument, Paragraph, Text],
  float: [ParagraphDocument, Paragraph, Float],
  integer: [ParagraphDocument, Paragraph, Integer],
};

export { editorExtensions };
