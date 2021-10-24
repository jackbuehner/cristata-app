import styled from '@emotion/styled/macro';
import { Button } from '../../../components/Button';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { Advertisement } from './Advertisement';
import { FeaturedArticle } from './FeaturedArticle';
import { Footer } from './Footer';
import { Header } from './Header';
import { MoreArticles } from './MoreArticles';
import { Upcoming } from './Upcoming';
import html2pdf from 'html2pdf.js';
import roman from 'romans';
import { DocumentPdf20Regular } from '@fluentui/react-icons';
import { css } from '@emotion/react';

function FlushDocumentEditor(props: CustomFieldProps) {
  const savePdf = () => {
    const element = document.getElementById('printarea');
    const options = {
      // margins are already built in to the element
      margin: 0,
      // set filename to the same as the page title
      filename: `The Royal Flush Vol. ${
        !isNaN(parseInt(props.state.fields['volume']))
          ? roman.romanize(parseInt(props.state.fields['volume']))
          : '??'
      } Iss. ${props.state.fields['issue'] || '??'}.pdf`,
      // default quality image
      image: { type: 'jpeg', quality: 0.98 },
      // do not convert links to links in the pdf
      enabledLinks: false,
      // use higher scale so that it is not pixelated when zoomed
      html2canvas: { scale: 6 },
      jsPDF: { format: [612, 792] }, // set to letter size (specifying 'letter' should worl, but causes an error)
    };
    html2pdf().from(element).set(options).save();
  };

  return (
    <>
      <ActionsRow>
        <Button
          onClick={savePdf}
          icon={<DocumentPdf20Regular />}
          cssExtra={css`
            > .IconStyleWrapper {
              height: 20px !important;
            }
          `}
        >
          Export PDF
        </Button>
      </ActionsRow>
      <div id={'printarea'} style={{ width: '9in', height: 'fit-content' }}>
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
      </div>
    </>
  );
}

const ActionsRow = styled.div`
  display: flex;
  width: 8.5in;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

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
