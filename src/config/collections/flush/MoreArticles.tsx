import styled from '@emotion/styled/macro';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Label } from '../../../components/Label';
import { MultiSelect } from '../../../components/Select';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { selectArticle } from '../featuredSettings/selectArticle';
import { SelectionOverlay } from './SelectionOverlay';
import { SectionHead } from './SectionHead';
import { css } from '@emotion/react';

interface IMoreArticles extends CustomFieldProps {
  height?: string;
}

function MoreArticles({ state, dispatch, ...props }: IMoreArticles) {
  const { setField } = props.setStateFunctions;
  const key = 'articles.more';
  const articles: { name: string; categories: string[]; _id: string }[] | undefined = state.fields[key];

  const handleMultiselectChange = (value: string[] | number[], key: string) => {
    dispatch(
      setField(
        value.map((val: string | number) => val.toString()),
        key
      )
    );
  };

  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  return (
    <Wrapper onMouseEnter={() => setIsMouseOver(true)} onMouseLeave={() => setIsMouseOver(false)}>
      <SelectionOverlay isShown={isMouseOver}>
        <ErrorBoundary fallback={<div>Error loading field '{key}'</div>}>
          <Label htmlFor={key} disabled={state.isLoading}>
            {'Select more articles'}
          </Label>
          <MultiSelect
            loadOptions={selectArticle}
            async
            val={articles?.map(({ _id }) => _id)}
            onChange={(valueObjs) =>
              handleMultiselectChange(
                valueObjs ? valueObjs.map((obj: { value: string; number: string }) => obj.value) : '',
                key
              )
            }
            isDisabled={state.isLoading}
            cssExtra={css`
              div[class*='-multiValue'] {
                width: 100%;
                justify-content: space-between;
              }
            `}
          />
        </ErrorBoundary>
      </SelectionOverlay>
      <Container height={props.height}>
        <SectionHead>More from The Paladin</SectionHead>
        <Subhead>
          Read them at <i>thepaladin.news/flusher</i>
        </Subhead>
        <ArticleList>
          {articles?.map((article) => {
            return (
              <ArticleItem>
                <ArticleHeadline headline={article.name} categories={article.categories} />
              </ArticleItem>
            );
          })}
        </ArticleList>
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
`;

const Subhead = styled.div`
  font-family: Lato;
  font-size: 9pt;
  font-style: italic;
  font-weight: normal;
  margin-top: -0.06in;
`;

const ArticleList = styled.ol`
  margin: 0.1in 0;
  padding-inline-start: 12pt;
  font-family: 'Adamant BG';
  font-size: 11pt;
  font-weight: normal;
`;

const ArticleItem = styled.li``;

interface IArticleHeadline {
  headline: string;
  categories: string[];
}

function ArticleHeadline(props: IArticleHeadline) {
  const isOpinion = (props.categories?.findIndex((category) => category === 'opinion') || -1) > -1;
  return (
    <Headline>
      {isOpinion ? 'Opinion: ' : ''}
      {props.headline}
    </Headline>
  );
}

const Headline = styled.h3`
  margin: 0 0 6pt 0;
  font-size: 11pt;
  font-weight: normal;
`;

export { MoreArticles };
