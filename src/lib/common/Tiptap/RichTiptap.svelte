<script lang="ts">
  import { editorExtensions } from '$components/CollaborativeFields/editorExtensions';
  import less from 'less';
  import type { ComponentProps } from 'svelte';
  import type { tiptapOptions } from '../../../config';
  import Tiptap from './Tiptap.svelte';

  export let ydoc: ComponentProps<Tiptap>['ydoc'];
  export let ydocKey: ComponentProps<Tiptap>['ydocKey'];
  export let wsProvider: ComponentProps<Tiptap>['wsProvider'];
  export let disabled: ComponentProps<Tiptap>['disabled'];
  export let user: ComponentProps<Tiptap>['user'];
  export let options: tiptapOptions | undefined = undefined;

  const parsedCss = less.render(
    `
      div.richtiptap {

        .text-box-container {
          background-color: white !important;
          border-radius: var(--fds-control-corner-radius);
        }

        .ProseMirror {
          *::selection {
            background-color: #c4dffc;
          }

          // only use bottom margin for paragraphs
          p {
            margin-top: 0;
            margin-bottom: 10px;
          }

          // no paragraph margin for list items
          li > p {
            margin-bottom: 0;
          }

          // show placeholder message when the editor is empty
          p.is-empty:first-of-type::before {
            content: attr(data-placeholder);
            float: left;
            // color: ${({ theme }) => theme.color.neutral[theme.mode][600]};
            pointer-events: none;
            height: 0;
          }
          addition {
            color: #d0021b;
            border-bottom: 1px solid #d0021b;
          }

          // title and subtitle
          h1.title {
            font-size: 48px;
            font-weight: 400;
            margin: 15px 0;
            text-align: center;
            line-height: 1.3;
          }
          p.subtitle {
            font-size: 18px;
            text-align: center;
            margin: 15px 0;
          }
          h1.title + p.subtitle {
            font-size: 18px;
            text-align: center;
            margin-top: -15px;
          }

          // hanging indent paragraph
          p.hanging {
            padding-left: 20px;
            text-indent: -20px;
          }

          // tables
          table {
            border-collapse: collapse;
            margin: 0;
            overflow: hidden;
            table-layout: fixed;
            width: 100%;

            td,
            th {
              border: 2px solid #ced4da;
              box-sizing: border-box;
              min-width: 1em;
              position: relative;
              vertical-align: top;

              > * {
                margin-bottom: 0;
              }
            }

            th {
              background-color: #f1f3f5;
              font-weight: bold;
              text-align: left;
            }

            .selectedCell:after {
              background: rgba(200, 200, 255, 0.4);
              content: '';
              left: 0;
              right: 0;
              top: 0;
              bottom: 0;
              pointer-events: none;
              position: absolute;
              z-index: 2;
            }

            .column-resize-handle {
              background-color: #adf;
              bottom: -2px;
              position: absolute;
              right: -2px;
              pointer-events: none;
              top: 0;
              width: 4px;
            }

            p {
              margin: 0;
            }
          }

          .tableWrapper {
            padding: 10px 0;
            overflow-x: auto;
          }

          &.resize-cursor {
            cursor: ew-resize;
            cursor: col-resize;
          }
        }
    
        ${(() => {
          if (options?.css?.indexOf('.ProseMirror') === 0) return options.css;
          return '';
        })()}
      }
    `
  );

  let tiptapwidth = 0;
</script>

{#await parsedCss then { css }}
  {@html `<` + `style>${css}</style>`}
{/await}

<div class="richtiptap" class:fullscreen={false} bind:clientWidth={tiptapwidth}>
  <div class="richtiptap-content">
    <div
      style="
        max-width: {tiptapwidth <= 680 ? `unset` : `768px`};
        width: {tiptapwidth <= 680 ? `100%` : `calc(100% - 40px)`};
        box-sizing: border-box;
        background-color: white;
        border: {tiptapwidth <= 680 ? `none` : `1px solid rgb(171, 171, 171)`};
        padding: {tiptapwidth <= 680 ? `24px 20px` : `68px 88px`};
        margin: {tiptapwidth <= 680 ? `0 auto` : `20px auto`};
      "
    >
      <Tiptap
        {disabled}
        {ydoc}
        {ydocKey}
        {wsProvider}
        {user}
        extensions={editorExtensions.tiptap}
        noTextFormatting
      />
    </div>
  </div>
</div>

<style>
  .richtiptap {
    background-color: var(--color-neutral-light-100);
    color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 500px;
    overflow: hidden;
    border-radius: var(--fds-control-corner-radius);
  }

  .richtiptap-content {
    overflow: auto;
    width: 100%;
    flex-grow: 1;
  }

  .richtiptap.fullscreen {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    border-radius: 0;
    z-index: 100;
  }

  .richtiptap.fullscreen :global(.text-box-container) {
    border: none;
  }
</style>
