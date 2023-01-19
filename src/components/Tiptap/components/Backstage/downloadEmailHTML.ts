import type { Editor } from '@tiptap/react';

function downloadEmailHTML(editor: Editor, iframehtmlstring: string) {
  const html = generateEmailHTML(editor, iframehtmlstring);

  // create blob
  const blob = new Blob([html], { type: 'text/plain;charset=utf-8' });

  // download
  const url = window.URL || window.webkitURL;
  const link = url.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = 'document.html';
  a.href = link;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function generateEmailHTML(editor: Editor, iframehtmlstring: string, utm_campaign?: string) {
  const html = editor.getHTML();
  const constructed = `<div>${iframehtmlstring}${html}</div>`;

  const editorHtml = `
      <style>
        #emailPreview {
          display: block !important;
        }
        #preview {
          display: none !important;
        }

        table.root {
          font-family: Georgia, Times, 'Times New Roman', serif;
          color: #3a3a3a;
          font-size: 17px;
          line-height: 1.7;
          font-weight: 400;
          font-variant-numeric: lining-nums;
        }

        /* only use bottom margin for paragraphs */
        p {
          margin-top: 0;
          margin-bottom: 10px;
        }
        li > p {
          margin-bottom: 0;
        }

        /* title and subtitle */
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

        /* heading sizes */
        h1 {
          font-size: 24px;
          font-weight: 400;
          margin: 10px 0;
        }
        h2 {
          font-size: 20px;
          font-weight: 400;
          margin: 10px 0;
        }
        h3 {
          font-size: 17px;
          font-weight: 400;
          margin: 10px 0;
        }
    
        /* hanging indent paragraph */
        p.hanging {
          padding-left: 20px;
          text-indent: -20px;
        }

        /* divider */
        hr::before {
          content: '•  •  •';
          display: flex;
          justify-content: center;
          white-space: pre;
          margin: 10px;
        }
        hr {
          border: none;
        }

      </style>
      <table cellspacing="0" cellpadding="0" border="0" width="100%" class="root">
        <tr>
          <td align="center">
            <table cellspacing="0" cellpadding="0" border="0" class="root">
              <tr>
                <td width="590">${constructed}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(editorHtml, 'text/html');

  htmlDoc.querySelectorAll('photowidget').forEach((elem: Element) => {
    const photoUrl = elem.attributes.getNamedItem('data-photo-url')?.value;
    const photoCredit = elem.attributes.getNamedItem('data-photo-credit')?.value;
    const showCaption = elem.attributes.getNamedItem('data-show-caption')?.value === 'true';
    const wrapPosition = elem.attributes.getNamedItem('data-wrap-position')?.value;
    const caption = elem.textContent;

    const newString = `
        <table
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            margin-top: ${wrapPosition === 'center' ? 20 : 0}px;
            float: ${wrapPosition === 'left' ? 'left' : wrapPosition === 'right' ? 'right' : 'unset'};
            margin-right: ${wrapPosition === 'left' ? 20 : 0}px;
            margin-bottom: ${wrapPosition === 'center' ? 20 : 0}px;
            margin-left: ${wrapPosition === 'right' ? 20 : 0}px;
          "
        >
          <tr>
            <td>
              <img src="${photoUrl}" width="${wrapPosition === 'center' ? '590' : '295'}" />
            </td>
          </tr>
          ${
            caption && showCaption
              ? `
                  <tr height="10"></tr>
                  <tr>
                    <td align="center">
                      <span class="figure-caption">${caption} </span>
                      <span class="figure-credit">${photoCredit}</span>
                    </td>
                  </tr>
                  <tr height="10"></tr>
                `
              : `
                  <tr>
                    <td align="right">
                      <span class="figure-credit">${photoCredit}</span>
                    </td>
                  </tr>
                `
          }
          <style>
            .figure-caption {
              color: rgb(102, 102, 102);
              font-size: 90%;
            }
            .figure-credit {
              color: #a7a7a7;
              font-size: 13px;
            }
          </style>
        </table>
      `;

    const parsed = parser.parseFromString(newString, 'text/html');
    const parsedElem = parsed.querySelector('table');
    if (parsedElem) elem.replaceWith(parsedElem);
  });

  htmlDoc.querySelectorAll('pullquote').forEach((elem: Element) => {
    const wrapPosition = elem.attributes.getNamedItem('data-wrap-position')?.value;
    const content = elem.innerHTML;

    const newString = `
        <table
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            font-size: 120%;
            font-weight: 400;
            text-align: center;
            border-top: 2px solid black;
            border-bottom: 2px solid black;
            line-height: 1.3;
            ${wrapPosition === 'left' ? `float: left;` : `float: right;`}
            margin-top: 10px;
            margin-right: ${wrapPosition === 'left' ? 20 : 0}px;
            margin-bottom: 10px;
            margin-left: ${wrapPosition === 'right' ? 20 : 0}px;
          "
        >
          <tr height="18"></tr>
          <tr>
            <td width="295">
              ${content}
            </td>
          </tr>
          <tr height="18"></tr>
        </table>
      `;

    const parsed = parser.parseFromString(newString, 'text/html');
    const parsedElem = parsed.querySelector('table');
    if (parsedElem) elem.replaceWith(parsedElem);
  });

  htmlDoc.querySelectorAll('youtubewidget').forEach((elem: Element) => {
    const showCaption = elem.attributes.getNamedItem('data-show-caption')?.value === 'true';
    const videoId = elem.attributes.getNamedItem('data-video-id')?.value;
    const caption = elem.textContent;

    const newString = `
        <table
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            font-size: 120%;
            font-weight: 400;
            text-align: center;
            border-top: 1px solid black;
            border-bottom: 1px solid black;
            margin-top: 20px;
            margin-bottom: 20px;
          "
        >
          <tr height="20"></tr>
          <tr>
            <td width="590">
              <a href="https://www.youtube.com/v/${videoId}">
                <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="youtube video ${videoId}" width="590" />
              </a>
            </td>
          </tr>
          ${
            caption && showCaption
              ? `
                  <tr>
                    <td align="right">
                      <a href="https://www.youtube.com/v/${videoId}" style="text-decoration: none;"><span class="figure-credit">Watch on YouTube</span></a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <span class="figure-caption">${caption}</span>
                    </td>
                  </tr>
                `
              : `
                  <tr>
                    <td align="right">
                      <span class="figure-credit">Click to watch on YouTube</span>
                    </td>
                  </tr>
                `
          }
          <tr height="${caption && showCaption ? 15 : 20}"></tr>
          <style>
            .figure-caption {
              color: rgb(102, 102, 102);
              font-size: 90%;
            }
            .figure-credit {
              color: #a7a7a7;
              font-size: 13px;
            }
          </style>
        </table>
      `;

    const parsed = parser.parseFromString(newString, 'text/html');
    const parsedElem = parsed.querySelector('table');
    if (parsedElem) elem.replaceWith(parsedElem);
  });

  htmlDoc.querySelectorAll('power-comment').forEach((elem: Element) => {
    const content = elem.innerHTML;

    const newString = `
        <span>${content}</span>
      `;

    const parsed = parser.parseFromString(newString, 'text/html');
    const parsedElem = parsed.querySelector('span');
    if (parsedElem) elem.replaceWith(parsedElem);
  });

  if (utm_campaign) {
    htmlDoc.querySelectorAll('a').forEach((elem: HTMLAnchorElement) => {
      try {
        const url = new URL(elem.href);
        url.searchParams.set('utm_source', 'cristatahtml');
        url.searchParams.set('utm_medium', 'email');
        url.searchParams.set('utm_campaign', utm_campaign || '');

        elem.href = url.toString();
      } catch (error) {}
    });
  }

  // inline
  //const inlined = juiceClient(htmlDoc.documentElement.innerHTML, { inlinePseudoElements: true });

  return htmlDoc.documentElement.innerHTML;
}

export { downloadEmailHTML, generateEmailHTML };
