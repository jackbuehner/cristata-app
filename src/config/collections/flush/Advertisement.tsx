import styled from '@emotion/styled/macro';
import { CustomFieldProps } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { SelectionOverlay } from './SelectionOverlay';
import { ErrorBoundary } from 'react-error-boundary';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { Select } from '../../../components/Select';
import { useState } from 'react';
import { selectPhotoPath } from '../articles/selectPhotoPath';
import { Button } from '../../../components/Button';

function Advertisement({ state, dispatch, ...props }: CustomFieldProps) {
  const { setField } = props.setStateFunctions;
  const key = 'left_advert_photo_url';
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  const handleSelectChange = (value: string | number, key: string, type: string) => {
    value = type === 'number' ? parseFloat(value as string) : value;
    dispatch(setField(value, key));
  };

  return (
    <Wrapper onMouseEnter={() => setIsMouseOver(true)} onMouseLeave={() => setIsMouseOver(false)}>
      <Available photo={state.fields[key]}>
        {!state.fields[key] ? (
          <>
            <AvailableMessage>YOUR ADVERTISEMENT HERE</AvailableMessage>
            <AvailableSize>
              1.5” x 4.25”
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
              loadOptions={selectPhotoPath}
              async
              val={`${state.fields[key]}`}
              onChange={(valueObj) =>
                handleSelectChange(
                  valueObj?.value || '',
                  key,
                  typeof state.fields[key] === 'number' ? 'number' : 'string'
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
