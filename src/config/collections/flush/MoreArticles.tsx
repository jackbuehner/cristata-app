import styled from '@emotion/styled/macro';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Label } from '../../../components/Label';
import { MultiSelect } from '../../../components/Select';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { selectArticle } from '../featuredSettings/selectArticle';
import { SelectionOverlay } from './SelectionOverlay';
import { SectionHead } from './SectionHead';
import { css } from '@emotion/react';
import { gql, useQuery } from '@apollo/client';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

interface IMoreArticles extends CustomFieldProps {
  height?: string;
}

function MoreArticles({ state, dispatch, ...props }: IMoreArticles) {
  const { setField } = props.setStateFunctions;
  const key = 'articles.more';
  type moreArticleType = { name: string; categories: string[]; _id: string };
  const articles = useRef<moreArticleType[] | undefined>(state.fields[key]);

  const QUERY = gql(
    jsonToGraphQLQuery({
      query: {
        __variables: {
          _ids: '[ObjectID]',
        },
        articles: {
          __args: {
            limit: 5,
            _ids: new VariableType('_ids'),
          },
          docs: {
            _id: true,
            name: true,
            categories: true,
          },
        },
      },
    })
  );

  const res = useQuery(QUERY, { variables: { _ids: [] } });

  useEffect(() => {
    // if the state des not match the current articles, this means that either:
    // (1) the state is providing an array of _ids (as stirngs) OR
    // (2) the state is a valid array of objects
    if (JSON.stringify(state.fields[key]) !== JSON.stringify(articles.current?.map((a) => a._id))) {
      // ensure that articles.current is always an array of objects
      if (state.fields[key] && state.fields[key][0] && typeof state.fields[key][0] === 'string') {
        res.refetch({ _ids: state.fields[key] }).then((res) => {
          if (res.data && res.data.articles && res.data.articles.docs) {
            // set the articles to match the resulting articles
            articles.current = res.data.articles.docs
              .slice()
              // sort the docs so that is matches the input order of the _ids
              .sort(
                (a: moreArticleType, b: moreArticleType) =>
                  state.fields[key].indexOf(a._id) - state.fields[key].indexOf(b._id)
              );
          }
        });
      } else {
        articles.current = state.fields[key];
      }
    }
  }, [articles, res, state.fields]);

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
            val={articles.current?.map(({ _id }) => _id)}
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
          {articles.current?.map((article) => {
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
      {props.headline?.replace(/ +(?= )/g, '')}
    </Headline>
  );
}

const Headline = styled.h3`
  margin: 0 0 6pt 0;
  font-size: 11pt;
  font-weight: normal;
`;

export { MoreArticles };
