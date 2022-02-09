import styled from '@emotion/styled/macro';
import { Button } from '../../../components/Button';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { Advertisement } from './Advertisement';
import { FeaturedArticle } from './FeaturedArticle';
import { Footer } from './Footer';
import { Header } from './Header';
import { MoreArticles } from './MoreArticles';
import { Upcoming } from './Upcoming';
import roman from 'romans';
import { Image20Regular } from '@fluentui/react-icons';
import { css } from '@emotion/react';
import { elementToSVG, inlineResources } from 'dom-to-svg';
import { saveAs } from 'file-saver';

function FlushDocumentEditor(props: CustomFieldProps) {
  const fileName = `The Royal Flush Vol. ${
    !isNaN(parseInt(props.state.fields['volume']))
      ? roman.romanize(parseInt(props.state.fields['volume']))
      : '??'
  } Iss. ${props.state.fields['issue'] || '??'}`;

  /**
   * Create an SVG from the print area.
   *
   * @returns SVG
   */
  const createSvg = async () => {
    const element = document.getElementById('printarea');
    if (element) {
      try {
        // capture the print area as an svg
        const svgDocument = elementToSVG(element);

        // inline external resources (fonts, images, etc) as data URIs
        await inlineResources(svgDocument.documentElement);

        // get svg string
        const svgString = new XMLSerializer().serializeToString(svgDocument);

        // create a blob
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });

        return svgBlob;
      } catch {
        throw new Error('failed to screenshot print area');
      }
    }
    throw new Error('could not find print area');
  };

  /**
   * Save the print area as an SVG file.
   */
  const saveSvg = () => {
    createSvg()
      .then((blob) => {
        const file = new File([blob], fileName + '.svg', {
          lastModified: props.state.fields['timestamps.modified_at'],
        });
        saveAs(file, fileName + '.svg');
      })
      .catch((error) => {
        console.error(error);
        throw new Error(error);
      });
  };

  return (
    <>
      <ActionsRow>
        <Button
          onClick={saveSvg}
          icon={<Image20Regular />}
          cssExtra={css`
            > .IconStyleWrapper {
              height: 20px !important;
            }
          `}
        >
          Export SVG
        </Button>
      </ActionsRow>
      <div id={'printarea'} style={{ width: '9in', height: 'fit-content' }}>
        <Page>
          <Header {...props} />
          <Columns>
            <Column>
              <Upcoming height={'6.74in'} {...props} />
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
  gap: 6px;
`;

const Page = styled.div`
  width: 8.5in;
  height: 11in;
  padding: 0.25in 0.2in 0.2in 0.2in;
  box-sizing: border-box;
  box-shadow: 0px 0 0 1px black;
  background: white;
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
