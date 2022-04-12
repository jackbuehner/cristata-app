import styled from '@emotion/styled/macro';
import { get as getProperty } from 'object-path';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '../../../components/Button';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { Select } from '../../../components/Select';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { selectPhotoPath } from '../articles/selectPhotoPath';
import { SelectionOverlay } from './SelectionOverlay';

function Advertisement({ state, dispatch, ...props }: CustomFieldProps) {
  const { setField } = props.setStateFunctions;
  const key = 'left_advert_photo_url';
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  // fetch the photo using the proxy and create a blob url
  // (this allows the photo to be used in svg with cors errors)
  const [photoUrl, setPhotoUrl] = useState<string>();
  useEffect(() => {
    if (getProperty(state.fields, key)) {
      fetch(
        `${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}/proxy/${getProperty(
          state.fields,
          key
        )}`
      ).then((res) => {
        res.blob().then((blob) => {
          setPhotoUrl(URL.createObjectURL(blob));
        });
      });
    }
  }, [state.fields]);

  const handleSelectChange = (value: string | number, key: string, type: string) => {
    value = type === 'number' ? parseFloat(value as string) : value;
    dispatch(setField(value, key));
  };

  return (
    <Wrapper onMouseEnter={() => setIsMouseOver(true)} onMouseLeave={() => setIsMouseOver(false)}>
      <Available photo={photoUrl}>
        {!getProperty(state.fields, key) ? (
          <>
            <AvailableMessage>YOUR ADVERTISEMENT HERE</AvailableMessage>
            <AvailableSize>
              3.95” x 2.65”
              <br />
              <br />
            </AvailableSize>
            <AvailableContact>Contact us: ads.manager@thepaladin.news</AvailableContact>
          </>
        ) : null}
      </Available>

      <SelectionOverlay isShown={isMouseOver}>
        <ErrorBoundary fallback={<div>Error loading field '{key}'</div>}>
          <InputGroup type={`text`}>
            <Label htmlFor={key} disabled={state.isLoading}>
              {'Select advertiser photo'}
            </Label>
            <Select
              client={props.client}
              loadOptions={selectPhotoPath}
              async
              val={`${getProperty(state.fields, key)}`}
              onChange={(valueObj) =>
                handleSelectChange(
                  valueObj?.value || '',
                  key,
                  typeof getProperty(state.fields, key) === 'number' ? 'number' : 'string'
                )
              }
              isDisabled={state.isLoading}
            />
          </InputGroup>
          <Button onClick={() => dispatch(setField('', key))}>Remove photo</Button>
        </ErrorBoundary>
      </SelectionOverlay>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
`;

const Available = styled.div<{ photo?: string }>`
  border: 2px solid black;
  width: 3.95in;
  height: 2.65in;
  background: ${({ photo }) => (photo ? `url('${photo}') black` : 'rgba(70, 35, 105, 0.3)')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  color: black;
`;

const AvailableMessage = styled.div`
  font-family: Lato;
  font-style: normal;
  font-weight: normal;
  font-size: 14pt;
  color: rgba(0, 0, 0, 0, 0.65);
  letter-spacing: 0.3pt;
  line-height: 1.58;
`;

const AvailableSize = styled.div`
  font-family: Lato;
  font-style: normal;
  font-weight: normal;
  font-size: 10pt;
  color: rgba(0, 0, 0, 0, 0.65);
  line-height: 1.58;
`;

const AvailableContact = styled.div`
  font-family: Lato;
  font-style: italic;
  font-weight: normal;
  font-size: 11pt;
  color: rgba(0, 0, 0, 0, 0.65);
  line-height: 1.58;
`;

export { Advertisement };
