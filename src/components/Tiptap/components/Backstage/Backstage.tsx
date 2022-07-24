import styled from '@emotion/styled/macro';
import { Editor } from '@tiptap/react';
import Color from 'color';
import { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { Action } from '../../../../pages/CMS/CollectionItemPage/useActions';
import { colorType } from '../../../../utils/theme/theme';
import { Button, buttonEffect } from '../../../Button';
import FluentIcon from '../../../FluentIcon';
import juice from 'juice';

interface BackstageProps {
  editor: Editor | null;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  actions: Array<Action | null>;
}

function Backstage(props: BackstageProps) {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(3);

  const saveAction = props.actions.find((action) => action && action.label === 'Save');
  const publishAction = props.actions.find((action) => action && action.label === 'Publish');
  const shareAction = props.actions.find((action) => action && action.label === 'Share');
  const moreActions = props.actions
    .filter((action): action is Action => !!action)
    .filter((action) => action.label !== 'Save' && action.label !== 'Publish' && action.label !== 'Share');

  // update tooltip when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  const downloadJson = () => {
    if (props.editor) {
      const json = props.editor.getJSON();

      // create blob
      const blobJson = [JSON.stringify(json)];
      const blob = new Blob(blobJson, { type: 'application/json;charset=utf-8' });

      // download
      const url = window.URL || window.webkitURL;
      const link = url.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `document.json`;
      a.href = link;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const downloadHTML = () => {
    if (props.editor) {
      const html = props.editor.getHTML();

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
  };

  const downloadEmailHTML = () => {
    if (props.editor) {
      const html = props.editor.getHTML();

      const editorHtml = `
        <style>
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
                  <td width="590">${html}</td>
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

      // inline
      const inlined = juice(htmlDoc.documentElement.innerHTML, { inlinePseudoElements: true });

      // create blob
      const blob = new Blob([inlined], { type: 'text/plain;charset=utf-8' });

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
  };

  return (
    <Container isOpen={props.isOpen}>
      <NavPane>
        <NavButton
          color={'blue'}
          icon={<FluentIcon name='ArrowCircleLeft24Regular' />}
          onClick={() => props.setIsOpen(false)}
        ></NavButton>
        {saveAction ? (
          <NavButton
            color={'blue'}
            icon={<FluentIcon name='Save24Regular' />}
            onClick={saveAction.action}
            disabled={saveAction.disabled}
          >
            Save
          </NavButton>
        ) : null}
        {publishAction ? (
          <NavButton
            color={'blue'}
            icon={<FluentIcon name='CloudArrowUp24Regular' />}
            onClick={publishAction.action}
            disabled={publishAction.disabled}
          >
            Publish
          </NavButton>
        ) : null}
        {/* <NavButton
          color={'blue'}
          icon={<FluentIcon name='Print24Regular' />}
          onClick={() => setActiveTabIndex(0)}
        >
          Print
        </NavButton> */}
        <NavButton
          color={'blue'}
          icon={<FluentIcon name='ArrowExportUp24Regular' />}
          onClick={() => setActiveTabIndex(1)}
        >
          Export
        </NavButton>
        <NavButton
          color={'blue'}
          icon={<FluentIcon name='Share24Regular' />}
          onClick={() => setActiveTabIndex(2)}
        >
          Share
        </NavButton>
        <NavButton
          color={'blue'}
          icon={<FluentIcon name='MoreHorizontal24Regular' />}
          onClick={() => setActiveTabIndex(3)}
        >
          More
        </NavButton>
      </NavPane>
      <View>
        {activeTabIndex === 0 ? (
          <div>
            <ViewTitle>Print</ViewTitle>
            <TabButton>
              <FluentIcon name='Print24Regular' />
              <div>
                <TabButtonName>Print</TabButtonName>
                <TabButtonCaption>Print the document.</TabButtonCaption>
              </div>
            </TabButton>
          </div>
        ) : activeTabIndex === 1 ? (
          <div>
            <ViewTitle>Export</ViewTitle>
            <TabButton onClick={downloadJson}>
              <FluentIcon name='BracesVariable24Regular' />
              <div>
                <TabButtonName>JSON</TabButtonName>
                <TabButtonCaption>Get the document content in JSON format.</TabButtonCaption>
              </div>
            </TabButton>
            <TabButton onClick={downloadHTML}>
              <FluentIcon name='Code24Regular' />
              <div>
                <TabButtonName>HTML</TabButtonName>
                <TabButtonCaption>Get the document content as a webpage.</TabButtonCaption>
              </div>
            </TabButton>
            <TabButton onClick={downloadEmailHTML}>
              <FluentIcon name='MailTemplate24Regular' />
              <div>
                <TabButtonName>Email-ready HTML</TabButtonName>
                <TabButtonCaption>Get the document content as email-formatted HTML.</TabButtonCaption>
              </div>
            </TabButton>
          </div>
        ) : activeTabIndex === 2 ? (
          <div>
            <ViewTitle>Share</ViewTitle>
            <TabButton onClick={shareAction?.action}>
              <FluentIcon name='Share24Regular' />
              <div>
                <TabButtonName>Share with other people</TabButtonName>
                <TabButtonCaption>Give other users and teams editing capabilities.</TabButtonCaption>
              </div>
            </TabButton>
          </div>
        ) : activeTabIndex === 3 ? (
          <div>
            <ViewTitle>More actions</ViewTitle>
            {moreActions.map((action, index) => {
              return (
                <TabButton
                  color={action.color}
                  key={index}
                  disabled={action.disabled}
                  onClick={action.action}
                  data-tip={action['data-tip']}
                >
                  <FluentIcon name={action.icon || 'CircleSmall20Filled'} />
                  <div>
                    <TabButtonName>{action.label}</TabButtonName>
                  </div>
                </TabButton>
              );
            })}
          </div>
        ) : null}
      </View>
    </Container>
  );
}

const Container = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 33px;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
  background-color: ${({ theme }) =>
    theme.mode === 'light'
      ? theme.color.blue[800]
      : Color(theme.color.neutral.dark[100]).lighten(0.5).string()};
  display: ${({ isOpen }) => (isOpen ? 'grid' : 'none')};
  grid-template-columns: 160px 1fr;
`;

const NavPane = styled.nav``;

const View = styled.div``;

const NavButton = styled(Button)`
  height: 36px;
  width: 100%;
  background-color: transparent;
  border: 1px solid transparent;
  justify-content: flex-start;
  padding-left: 16px;
  span:first-of-type {
    width: 20px;
    height: 20px;
    > svg {
      width: 20px;
      height: 20px;
    }
  }
  &:first-of-type {
    margin: 10px 0;
    span:first-of-type {
      margin-left: -6px;
      width: 24px;
      height: 24px;
      > svg {
        width: 24px;
        height: 24px;
      }
    }
  }
`;

const TabButton = styled.div<{ color?: colorType; disabled?: boolean; 'data-tip'?: string }>`
  ${({ color, theme, disabled }) =>
    buttonEffect(
      color || 'blue',
      theme.mode === 'dark' ? 300 : 800,
      theme,
      disabled || false,
      { base: 'transparent' },
      { base: '1px solid transparent' }
    )}
  padding: 10px;
  margin: 0 30px 12px 30px;
  display: flex;
  gap: 14px;
  flex-direction: row;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ 'data-tip': dataTip }) => (dataTip ? 'help' : 'default')};
  svg {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
    padding: 0 10px 0 5px;
    width: 30px;
    height: 30px;
  }
`;

const TabButtonName = styled.div`
  font-size: 16px;
  font-weight: 400;
  font-family: ${({ theme }) => theme.font.detail};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin-bottom: 4px;
`;

const TabButtonCaption = styled.div`
  font-size: 12px;
  font-weight: 400;
  font-family: ${({ theme }) => theme.font.detail};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
`;

const ViewTitle = styled.div`
  font-size: 28px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.font.detail};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 40px 30px 15px 30px;
`;

export { Backstage };
