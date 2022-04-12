import { Renderer } from '@cristata/prosemirror-to-html-js';
import styled from '@emotion/styled/macro';
import { get as getProperty } from 'object-path';
import { useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { Select } from '../../../components/Select';
import { collections as collectionsConfig } from '../../../config';
import { ClientConsumer } from '../../../graphql/client';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { isJSON } from '../../../utils/isJSON';
import { selectArticle } from '../featuredSettings/selectArticle';
import { SelectionOverlay } from './SelectionOverlay';

interface IFeaturedArticle extends CustomFieldProps {
  height?: string;
}

function FeaturedArticle({ state, dispatch, ...props }: IFeaturedArticle) {
  const { setField } = props.setStateFunctions;
  const key = 'articles.featured';

  const handleSelectChange = (value: string | number, key: string, type: string) => {
    value = type === 'number' ? parseFloat(value as string) : value;
    dispatch(setField(value, key));
  };

  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  const article = useMemo(
    () => ({
      _id: getProperty(state.fields, `${key}._id`) as string,
      name: getProperty(state.fields, `${key}.name`) as string,
      categories: getProperty(state.fields, `${key}.categories`) as string[],
      description: getProperty(state.fields, `${key}.description`) as string,
      photo_path: getProperty(state.fields, `${key}.photo_path`) as string,
      body: getProperty(state.fields, `${key}.body`) as string,
      people: {
        authors: getProperty(state.fields, `${key}.people.authors`) as { name: string }[],
      },
    }),
    [state.fields]
  );

  const categoryLabels = collectionsConfig['articles']?.fields.find(
    (field) => field.key === 'categories'
  )?.options;

  const articleBody = useMemo(
    () =>
      new Renderer().render({
        type: 'doc',
        content:
          article && article.body
            ? isJSON(article.body)
              ? JSON.parse(article.body)
              : [
                  {
                    type: 'text',
                    text: 'Error: Legacy HTML articles cannot be embedded in issues of The Royal Flush.',
                  },
                ]
            : '',
      }),
    [article]
  );

  // fetch the photo using the proxy and create a blob url
  // (this allows the photo to be used in svg with cors errors)
  const [photoUrl, setPhotoUrl] = useState<string>();
  useEffect(() => {
    if (article?.photo_path) {
      fetch(
        `${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}/proxy/${article.photo_path}`
      ).then((res) => {
        res.blob().then((blob) => {
          setPhotoUrl(URL.createObjectURL(blob));
        });
      });
    }
  }, [article]);

  return (
    <Wrapper onMouseEnter={() => setIsMouseOver(true)} onMouseLeave={() => setIsMouseOver(false)}>
      <SelectionOverlay isShown={isMouseOver}>
        <ErrorBoundary fallback={<div>Error loading field '{key}'</div>}>
          <InputGroup type={`text`}>
            <Label htmlFor={key} disabled={state.isLoading}>
              {'Select featured article'}
            </Label>
            <ClientConsumer>
              {(client) => (
                <Select
                  client={client}
                  loadOptions={selectArticle}
                  async
                  val={getProperty(state.fields, key)}
                  onChange={(valueObj) =>
                    handleSelectChange(
                      valueObj?.value || '',
                      key,
                      typeof getProperty(state.fields, key) === 'number' ? 'number' : 'string'
                    )
                  }
                  isDisabled={state.isLoading}
                />
              )}
            </ClientConsumer>
          </InputGroup>
        </ErrorBoundary>
      </SelectionOverlay>
      <Container height={props.height}>
        <Categories>
          {article?.categories ? (
            (article?.categories as string[])?.map((cat, index) => (
              <Category key={index}>
                {categoryLabels?.find((categoryLabel) => categoryLabel.value === cat)?.label}
              </Category>
            ))
          ) : (
            <Category>Section</Category>
          )}
        </Categories>
        <Headline>{article?.name?.replace(/ +(?= )/g, '') || `Headline of a Featured Article`}</Headline>
        <BodyWrapper>
          <Byline>
            <Author>By</Author>
            {article?.people?.authors?.length === 1 ? (
              <Author>{article.people.authors[0].name}</Author>
            ) : article?.people?.authors?.length === 2 ? (
              <>
                <Author>{article?.people?.authors[0].name}</Author>
                <Author> and </Author>
                <Author>{article?.people?.authors[1].name}</Author>
              </>
            ) : article?.people?.authors && article.people.authors.length >= 3 ? (
              <>
                {article.people.authors
                  .slice(0, article.people.authors.length - 1)
                  .map((author, index: number) => {
                    return (
                      <>
                        <Author key={index}>{author.name}</Author>
                        <Author>, </Author>
                      </>
                    );
                  })}
                <Author>and </Author>
                <Author>{article.people.authors.pop()?.name}</Author>
              </>
            ) : (
              <Author>Unknown</Author>
            )}
          </Byline>
          <Body>
            <PhotoContainer>
              <Photo src={photoUrl} alt={''} />
            </PhotoContainer>
            <article dangerouslySetInnerHTML={{ __html: articleBody?.replace(/ +(?= )/g, '') }} />
          </Body>
        </BodyWrapper>
        <Continue>
          Continued on <i>thepaladin.news</i>
        </Continue>
      </Container>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
`;

const Container = styled.div<{ height?: string }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: ${({ height }) => height};
  flex-wrap: nowrap;
  box-sizing: border-box;
  position: relative;
  color: black;
`;

const Categories = styled.div`
  display: flex;
  gap: 0.021in 0.104in;
  margin-bottom: 0.052in;
  margin-top: 0.292in;
  flex-wrap: wrap;
  flex-grow: 0;
  flex-shrink: 0;
`;

const Category = styled.span`
  font-family: Lato, sans-serif;
  color: #333;
  font-size: 7.5pt;
  line-height: 7.5pt;
  text-align: justify;
  letter-spacing: 2.25pt;
  text-transform: uppercase;
  cursor: default;
  &:not(:last-of-type) {
    padding-right: 0.052in;
    border-right: 1pt solid #ccc;
  }
`;

const Headline = styled.h1`
  margin-top: 0;
  margin-bottom: 0;
  align-self: flex-start;
  font-family: 'Adamant BG', Georgia, sans-serif;
  font-size: 16.5pt;
  line-height: 20pt;
  font-style: italic;
  font-weight: 700;
  letter-spacing: -0.5pt;
  cursor: default;
  flex-grow: 0;
  flex-shrink: 0;
`;

const Byline = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: flex-start;
  align-self: center;
  flex: 0 auto;
  cursor: default;
  position: relative;
  /*margin-bottom: 11pt;
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 1pt;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 20%,
      rgba(0, 0, 0, 0.6) 20%,
      rgba(0, 0, 0, 0.6) 80%,
      rgba(255, 255, 255, 1) 80%,
      rgba(255, 255, 255, 1) 100%
    );
    bottom: -6pt;
  }*/
`;

const Author = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  align-self: flex-start;
  font-family: Lato;
  color: #333;
  font-size: 10pt;
  line-height: 14pt;
  font-weight: bold;
  text-transform: none;
  white-space: pre-wrap;
  &:first-of-type {
    margin-right: 3px;
  }
`;

const BodyWrapper = styled.div`
  font-family: Georgia;
  font-size: 10pt;
  line-height: 1.5;
  cursor: default;
  text-align: justify;
  overflow: hidden;
  flex-grow: 1;
`;

const Body = styled.div`
  column-width: calc(7.9in / 2);
  height: 100%;
  > article {
    p:first-of-type {
      margin-top: 0;
    }
  }
`;

const PhotoContainer = styled.div`
  width: 2.26in;
  padding-top: calc(0.666667 * 2.26in);
  height: 0px;
  position: relative;
  float: left;
  margin: 0.04in 0.08in 0 0;
`;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
  object-fit: cover;
`;

const Continue = styled.div`
  font-family: Lato;
  font-size: 9pt;
  text-align: right;
  flex-grow: 0;
  flex-shrink: 0;
`;

export { FeaturedArticle };
