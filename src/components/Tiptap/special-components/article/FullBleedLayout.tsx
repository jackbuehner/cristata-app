import styled from '@emotion/styled/macro';
import { DateTime } from 'luxon';
import { get as getProperty } from 'object-path';
import { useEffect, useState } from 'react';
import { tiptapOptions } from '../../../../config';
import { client } from '../../../../graphql/client';
import {
  GET_PHOTOGRAPHER_BY_PHOTO_URL,
  GET_PHOTOGRAPHER_BY_PHOTO_URL__TYPE,
} from '../../../../graphql/queries';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { setField } from '../../../../redux/slices/cmsItemSlice';
import { genAvatar } from '../../../../utils/genAvatar';
import { IconButton } from '../../../Button';

interface IFullBleedLayout {
  options: tiptapOptions;
  isDisabled?: boolean;
  tiptapSize: {
    width: number;
    height: number;
  };
}

/**
 * The full bleed heading and meta layout for articles.
 *
 * This is added to the top of the tiptap editor when the `type === 'article`
 * in tiptapOptions.
 */
function FullBleedLayout(props: IFullBleedLayout) {
  const state = useAppSelector((state) => state.cmsItem);
  const dispatch = useAppDispatch();

  /**
   * Prevent new lines in fields.
   *
   * Use this in the `onKeyDown` prop.
   */
  const preventNewLines = (event: React.KeyboardEvent) => {
    const keyCode = event.keyCode || event.which;
    if (keyCode === 13) {
      event.preventDefault();
    }
  };

  /**
   * When a `contenteditable` element is blurred, update the value in state.
   *
   * @param key_article the key defined in `keys_article` (see `tiptapOptions` in config)
   */
  const handleCEBlur = (event: React.FocusEvent, key_article: 'headline' | 'description' | 'caption') => {
    const key = props.options.keys_article?.[key_article];
    if (key && event.currentTarget.textContent) {
      dispatch(setField(event.currentTarget.textContent, key));
    }
  };

  /**
   * Attributes for contenteditable elements
   */
  const contentEditableAttrs = {
    contentEditable: props.isDisabled === true ? false : true, // enable
    onKeyPress: preventNewLines, // prevent new lines
    suppressContentEditableWarning: true, // suppress warning from react about managed contenteditable element
    isDisabled: props.isDisabled,
  };

  /**
   * Retrieves the photo source from a photo.
   *
   * @param url the url of the photo
   * @returns promise: the source of the photo OR `undefined`
   */
  const getPhotoSourceFromUrl = async (url: string) => {
    // get the data
    const { data, error } = await client.query<GET_PHOTOGRAPHER_BY_PHOTO_URL__TYPE>({
      query: GET_PHOTOGRAPHER_BY_PHOTO_URL(url),
    });

    // log error if it occurs
    if (error) console.error(error);

    // return the photo source
    return data?.photos.docs?.[0]?.people?.photo_created_by;
  };

  // determine the photographer/artist
  const [photoCredit, setPhotoCredit] = useState<string>();
  useEffect(() => {
    (async () => {
      if (props.options.keys_article) {
        const credit = await getPhotoSourceFromUrl(
          getProperty(state.fields, props.options.keys_article.photo_url)
        );
        if (credit) setPhotoCredit(credit);
      }
    })();
  }, [setPhotoCredit, props.options.keys_article, state.fields]);

  // get the authors
  type authorObjsType = { name: string; photo: string; _id: string }[];
  const authors = (getProperty(state.fields, props.options.keys_article?.authors || '') ||
    []) as authorObjsType;

  if (state.fields && props.options.keys_article) {
    const { keys_article } = props.options;
    const headline = getProperty(state.fields, keys_article.headline);
    const description = getProperty(state.fields, keys_article.description);
    const categories = getProperty(state.fields, keys_article.categories);
    const caption = getProperty(state.fields, keys_article.caption);
    const photoUrl = getProperty(state.fields, keys_article.photo_url);
    const targetPublishAt = getProperty(state.fields, keys_article.target_publish_at);

    const categoryLabels: { value: string; label: string }[] = [];

    return (
      <Container tiptapWidth={props.tiptapSize.width}>
        <PhotoContainer tiptapWidth={props.tiptapSize.width} photoUrl={photoUrl}>
          <div style={{ width: '100%' }}>
            <Categories>
              {(categories as string[])?.map((cat, index) => (
                <Category key={index}>
                  {categoryLabels?.find((categoryLabel) => categoryLabel.value === cat)?.label}
                </Category>
              ))}
            </Categories>
            <Headline {...contentEditableAttrs} onBlur={(e) => handleCEBlur(e, 'headline')}>
              {headline}
            </Headline>
            <Description {...contentEditableAttrs} onBlur={(e) => handleCEBlur(e, 'description')}>
              {description}
            </Description>
          </div>
        </PhotoContainer>
        <Caption {...contentEditableAttrs} onBlur={(e) => handleCEBlur(e, 'caption')}>
          {caption}
        </Caption>
        <Credit>{photoCredit}</Credit>
        <MetaGrid>
          <Authors>
            <AuthorPhotos>
              {authors?.map((author, index: number) => {
                return (
                  <AuthorPhoto key={index} draggable={'false'} src={author.photo || genAvatar(author._id)} />
                );
              })}
            </AuthorPhotos>
            <Author>By</Author>
            {authors && authors.length === 1 ? (
              <AuthorLink>
                <Author>{authors[0].name}</Author>
              </AuthorLink>
            ) : authors && authors.length === 2 ? (
              <>
                <AuthorLink>
                  <Author>{authors[0].name}</Author>
                </AuthorLink>
                <Author> and </Author>
                <AuthorLink>
                  <Author>{authors[1].name}</Author>
                </AuthorLink>
              </>
            ) : authors && authors.length >= 3 ? (
              <>
                {authors.slice(0, authors.length - 1).map((author, index: number) => {
                  return (
                    <>
                      <AuthorLink>
                        <Author key={index}>{author.name}</Author>
                      </AuthorLink>
                      <Author>, </Author>
                    </>
                  );
                })}
                <Author>and </Author>
                <AuthorLink>
                  <Author>{authors.slice(-1)?.[0].name}</Author>
                </AuthorLink>
              </>
            ) : null}
          </Authors>
          <PublishDate>{DateTime.fromISO(targetPublishAt).toFormat(`LLLL dd, yyyy`)}</PublishDate>
          <SocialButtons>
            <SocialButton icon={<FacebookIcon />} />
            <SocialButton icon={<TwitterIcon />} />
            <SocialButton icon={<EmailIcon />} />
            <SocialButton icon={<LinkedinIcon />} />
          </SocialButtons>
        </MetaGrid>
      </Container>
    );
  }
  return null;
}

const Container = styled.div<{ tiptapWidth: number }>`
  max-width: ${({ tiptapWidth }) => (tiptapWidth <= 680 ? `unset` : `768px`)};
  width: ${({ tiptapWidth }) => (tiptapWidth <= 680 ? `100%` : `calc(100% - 40px)`)};
  box-sizing: border-box;
  background-color: white;
  border: ${({ tiptapWidth }) => (tiptapWidth <= 680 ? `none` : `1px solid rgb(171, 171, 171)`)};
  border-bottom: none;
  padding: ${({ tiptapWidth }) => (tiptapWidth <= 680 ? `0 20px 0` : `0 88px 0`)};
  margin: ${({ tiptapWidth }) => (tiptapWidth <= 680 ? `0` : `20px`)};
  margin-bottom: ${({ tiptapWidth }) =>
    tiptapWidth <= 680 ? `0` : `-74px`}; // connect bottom to top of article body and leave 15px spacing
  z-index: 1;
  padding-bottom: 15px; // for 30px between prosemirror and container content
`;

const Headline = styled.h1<{ isDisabled?: boolean }>`
  margin-top: 0;
  margin-bottom: 0;
  align-self: flex-start;
  font-family: 'Adamant BG', Georgia, sans-serif;
  font-size: 32px;
  line-height: 40px;
  font-style: italic;
  font-weight: 700;
  letter-spacing: -0.8px;
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'text')};
  text-align: center;
  color: #e0e0e0;
  text-shadow: rgb(0 0 0 / 60%) 0px 0px 8px;
`;

const Description = styled.div<{ isDisabled?: boolean }>`
  margin-top: 10px;
  margin-bottom: 20px;
  direction: ltr;
  font-family: Georgia, Times, 'Times New Roman', serif;
  font-size: 18px;
  line-height: 26px;
  font-weight: 400;
  text-transform: none;
  white-space: normal;
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'text')};
  text-align: center;
  color: #e0e0e0;
  text-shadow: rgb(0 0 0 / 60%) 0px 0px 8px;
`;

const Categories = styled.div`
  display: flex;
  gap: 2px 10px;
  margin-bottom: 4px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Category = styled.span`
  font-family: Lato, sans-serif;
  color: #ccc;
  text-shadow: rgb(0 0 0 / 60%) 0px 0px 4px;
  font-size: 12px;
  line-height: 20px;
  text-align: justify;
  letter-spacing: 5px;
  text-transform: uppercase;
  cursor: default;
  &:not(:last-of-type) {
    padding-right: 5px;
    border-right: 1px solid #333;
  }
`;

const PhotoContainer = styled.div<{ tiptapWidth: number; photoUrl?: string }>`
  width: ${({ tiptapWidth }) => (tiptapWidth <= 680 ? `calc(100% + 40px)` : `calc(100% + 176px)`)};
  height: ${({ tiptapWidth }) => (tiptapWidth <= 680 ? `80vh` : `500px`)};
  position: relative;
  float: unset;
  margin-left: unset;
  margin-right: unset;
  margin-bottom: 4px;
  left: ${({ tiptapWidth }) => (tiptapWidth <= 680 ? `-20px` : `-88px`)};
  background-color: #1b499b;
  background-image: ${({ photoUrl }) =>
    photoUrl
      ? `url('${photoUrl}')`
      : `linear-gradient(135deg, rgba(84,56,185,1) 0%, rgba(59,64,172,1) 60%, rgba(56,65,170,1) 80%, rgba(28,73,155,1) 100%);`};
  background-size: cover;
  background-position: center;
  padding: ${({ tiptapWidth }) => (tiptapWidth <= 680 ? `0 20px 0` : `0 88px 0`)};
  box-sizing: border-box;
  display: flex;
  align-items: center;
`;

const Caption = styled.div<{ isDisabled?: boolean }>`
  display: inline;
  margin-top: 4px;
  margin-right: 6px;
  font-family: Georgia, Times, 'Times New Roman', serif;
  color: #777;
  font-size: 14px;
  line-height: 20px;
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'text')};
`;

const Credit = styled.div`
  display: inline;
  margin-top: 4px;
  font-family: Georgia, Times, 'Times New Roman', serif;
  color: #a7a7a7;
  font-size: 13px;
  cursor: default;
`;

const MetaGrid = styled.div`
  display: grid;
  margin-top: 30px;
  grid-auto-flow: row;
  grid-auto-columns: 1fr;
  grid-column-gap: 16px;
  grid-row-gap: 8px;
  grid-template-areas:
    'byline byline'
    'date   social-buttons-article';
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(auto-fit, minmax(0px, 1fr)) minmax(0px, min-content);
`;

const PublishDate = styled.div`
  grid-area: date;
  align-self: end;
  font-family: Lato, sans-serif;
  color: #333;
  font-size: 14px;
  line-height: 20px;
  cursor: default;
`;

const Authors = styled.div`
  grid-area: byline;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: stretch;
  align-self: center;
  flex: 0 auto;
  cursor: default;
`;

const Author = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  align-self: flex-start;
  font-family: Lato, sans-serif;
  color: #333;
  font-size: 16px;
  line-height: 36px;
  font-weight: 700;
  text-transform: none;
  white-space: pre-wrap;
  &:first-of-type {
    margin-right: 3px;
  }
`;

const AuthorLink = styled.span`
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const AuthorPhotos = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: stretch;
  align-self: center;
  flex: 0 auto;
`;

const AuthorPhoto = styled.img`
  margin-right: 8px;
  padding-right: 0;
  border-radius: 50%;
  order: 0;
  vertical-align: middle;
  display: inline-block;
  max-width: 100%;
  width: 30px;
  height: 30px;
`;

const SocialButtons = styled.div`
  grid-area: social-buttons-article;
  align-self: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 6px;
`;

const SocialButton = styled(IconButton)`
  height: 26px;
  width: 26px;
  border-radius: 50%;
  > svg {
    width: 15px;
    height: 15px;
  }
`;

function FacebookIcon() {
  return (
    <svg viewBox='0 0 7 15'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M4.775 14.163V7.08h1.923l.255-2.441H4.775l.004-1.222c0-.636.06-.977.958-.977H6.94V0H5.016c-2.31 0-3.123 1.184-3.123 3.175V4.64H.453v2.44h1.44v7.083h2.882z'
        fill='currentColor'
      ></path>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox='0 0 24 24'>
      <path
        fill='currentColor'
        d='M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z'
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox='0 0 24 24'>
      <path
        fill='currentColor'
        d='M13 17H17V14L22 18.5L17 23V20H13V17M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H11.35A5.8 5.8 0 0 1 11 18A6 6 0 0 1 22 14.69V6A2 2 0 0 0 20 4M20 8L12 13L4 8V6L12 11L20 6Z'
      />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox='0 0 24 24'>
      <path
        fill='currentColor'
        d='M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z'
      />
    </svg>
  );
}

export { FullBleedLayout };
