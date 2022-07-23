import styled from '@emotion/styled/macro';
import { Editor } from '@tiptap/react';
import Color from 'color';
import { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { Action } from '../../../../pages/CMS/CollectionItemPage/useActions';
import { colorType } from '../../../../utils/theme/theme';
import { Button, buttonEffect } from '../../../Button';
import FluentIcon from '../../../FluentIcon';

interface BackstageProps {
  editor: Editor | null;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  actions: Array<Action | null>;
}

function Backstage(props: BackstageProps) {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

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
        <NavButton
          color={'blue'}
          icon={<FluentIcon name='Print24Regular' />}
          onClick={() => setActiveTabIndex(0)}
        >
          Print
        </NavButton>
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
