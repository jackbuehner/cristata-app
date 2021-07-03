import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { PaneClose24Regular, Dismiss24Regular, Edit24Regular } from '@fluentui/react-icons';
import { useHistory } from 'react-router-dom';
import { Button, IconButton } from '../../../components/Button';
import { Chip } from '../../../components/Chip';
import { IPhoto } from '../../../interfaces/cristata/photos';
import { themeType } from '../../../utils/theme/theme';

interface IPhotoLibraryFlyout {
  photo?: IPhoto;
}

function PhotoLibraryFlyout({ photo }: IPhotoLibraryFlyout) {
  const theme = useTheme() as themeType;
  const history = useHistory();

  if (photo) {
    return (
      <Wrapper theme={theme}>
        <Header theme={theme}>
          <IconButton
            icon={window.innerWidth <= 600 ? <Dismiss24Regular /> : <PaneClose24Regular />}
            cssExtra={css`
              float: right;
              margin-top: 15px;
            `}
            onClick={() => history.push(`/cms/photos/library`)}
          />
          <Name theme={theme}>{photo.name}</Name>
        </Header>
        <Photo src={photo.photo_url} alt={''}></Photo>
        <Url href={photo.photo_url} target={`_blank`} theme={theme}>
          {photo.photo_url}
        </Url>
        <SectionTitle theme={theme}>Details</SectionTitle>
        <Details theme={theme}>
          <Label>Location</Label>
          <Item>
            {photo.photo_url.replace('https://', '').split('.')[0] /* get the location from the URL */}
          </Item>
          <Label>Source</Label>
          <Item>{photo.people.photo_created_by}</Item>
          <Label>Type</Label>
          <Item>{photo.file_type}</Item>
          <Label>Dimensions</Label>
          <Item>{`${photo.dimensions.x} x ${photo.dimensions.y}`}</Item>
          <Label>ID</Label>
          <Item>{photo._id}</Item>
        </Details>
        <SectionTitle theme={theme}>Tags</SectionTitle>
        {photo.tags?.map((tag, index) => {
          return <Chip key={index} label={tag} color={`neutral`} />;
        })}
        {photo.tags === undefined || photo.tags.length < 1 ? 'No tags could be found for this photo' : null}
        <Footer theme={theme}>
          <Button icon={<Edit24Regular />} onClick={() => history.push(`/cms/item/photos/${photo._id}`)}>
            Edit details
          </Button>
        </Footer>
      </Wrapper>
    );
  }
  return <Wrapper theme={theme}>Failed to load photo details.</Wrapper>;
}

const Wrapper = styled.div<{ theme: themeType }>`
  width: 340px;
  height: 100%;
  border-left: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
  padding: 20px 20px 0 20px;
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  @media (max-width: 600px) {
    position: fixed;
    height: 100vh;
    width: 100vw;
    inset: 0;
  }
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  font-family: ${({ theme }) => theme.font.detail};
`;

const Header = styled.div<{ theme: themeType }>`
  position: sticky;
  top: -20px;
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  border-bottom: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
  margin-bottom: 10px;
  width: calc(100% + 40px);
  margin-left: -20px;
  padding: 0 20px;
  box-sizing: border-box;
`;

const Name = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 16px;
  font-weight: 500;
  margin: -20px 0 0 0;
  padding: 20px 0;
`;

const Photo = styled.img`
  width: 100%;
`;

const Url = styled.a<{ theme: themeType }>`
  font-size: 13px;
  font-family: ${({ theme }) => theme.font.detail};
  word-break: break-all;
  margin: 6px 0 10px 0;
  display: block;
`;

const Details = styled.div<{ theme: themeType }>`
  display: grid;
  grid-template-columns: 110px 1fr;
  @media (max-width: 400px) {
    grid-template-columns: 80px 1fr;
  }
  width: 100%;
  font-size: 14px;
  font-weight: 400;
  text-decoration: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  font-family: ${({ theme }) => theme.font.detail};
`;

const Label = styled.div`
  line-height: 24px;
  opacity: 0.8;
`;

const Item = styled.div`
  line-height: 20px;
`;

const SectionTitle = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][800]};
  line-height: 48px;
  margin: 0px;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const Footer = styled.div<{ theme: themeType }>`
  position: sticky;
  bottom: 0;
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  border-top: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
  width: calc(100% + 40px);
  margin: 20px 0 0 -20px;
  padding: 16px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 6px;
  justify-content: flex-end;
`;

export { PhotoLibraryFlyout };
