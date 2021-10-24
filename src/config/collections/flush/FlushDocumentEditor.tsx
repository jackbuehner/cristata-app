import styled from '@emotion/styled/macro';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { Advertisement } from './Advertisement';
import { FeaturedArticle } from './FeaturedArticle';
import { Footer } from './Footer';
import { Header } from './Header';
import { MoreArticles } from './MoreArticles';
import { Upcoming } from './Upcoming';

function FlushDocumentEditor(props: CustomFieldProps) {
  return (
    <Page>
      <Header {...props} />
      <Columns>
        <Column>
          <Upcoming height={'6.80in'} {...props} />
          <Advertisement {...props} />
        </Column>
        <Column>
          <FeaturedArticle height={'6.51in'} {...props} />
          <MoreArticles height={'2.38in'} {...props} />
          <Footer />
        </Column>
      </Columns>
    </Page>
  );
}

const Page = styled.div`
  width: 8.5in;
  height: 11in;
  padding: 0.25in 0.2in 0.2in 0.2in;
  box-sizing: border-box;
  border: 1px solid black;
`;

const Columns = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.2in;
  height: calc(100% - 1.3in + 0.25in);
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1;
`;

export { FlushDocumentEditor };
