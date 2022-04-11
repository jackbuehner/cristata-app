import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { NumberOption, StringOption } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import { SelectOne } from '../../../components/ContentField';
import { useAppDispatch } from '../../../redux/hooks';
import { setField } from '../../../redux/slices/cmsItemSlice';
import { formatISODate } from '../../../utils/formatISODate';
import { themeType } from '../../../utils/theme/theme';

interface SidebarProps {
  docInfo: {
    _id: string;
    createdAt: string;
    modifiedAt: string;
  };
  stage: {
    current: string | number;
    options: StringOption[] | NumberOption[];
    key: string;
  };
  loading?: boolean;
}

function Sidebar(props: SidebarProps) {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;

  return (
    <Container theme={theme}>
      <SectionTitle theme={theme}>Document Information</SectionTitle>
      <DocInfoRow theme={theme}>
        <div>Created</div>
        <div>{formatISODate(props.docInfo.createdAt, undefined, undefined, true)}</div>
      </DocInfoRow>
      <DocInfoRow theme={theme}>
        <div>Last updated</div>
        <div>{formatISODate(props.docInfo.modifiedAt, undefined, undefined, true)}</div>
      </DocInfoRow>
      <SectionTitle theme={theme}>Stage</SectionTitle>
      {typeof props.stage.current === 'string' && typeof props.stage.options[0].value === 'string' ? (
        <SelectOne
          type={'String'}
          options={props.stage.options}
          label={'Stage'}
          value={(props.stage.options as StringOption[]).find(({ value }) => value === props.stage.current)}
          onChange={(value) => {
            const newValue = value?.value;
            if (newValue) dispatch(setField(newValue, props.stage.key));
          }}
          disabled={props.loading}
        />
      ) : (
        <SelectOne
          type={'Float'}
          options={props.stage.options}
          label={'__in-select'}
          value={(props.stage.options as NumberOption[]).find(({ value }) => value === props.stage.current)}
          onChange={(value) => {
            const newValue = value?.value;
            if (newValue) dispatch(setField(newValue, props.stage.key));
          }}
          disabled={props.loading}
        />
      )}
      <SectionTitle theme={theme}>People</SectionTitle>
      <SectionTitle theme={theme}>Share</SectionTitle>
    </Container>
  );
}

const Container = styled.div<{ theme: themeType }>`
  width: 300px;
  background-color: ${({ theme }) =>
    theme.mode === 'dark' ? theme.color.neutral[theme.mode][100] : '#ffffff'};
  border-left: ${({ theme }) => `1px solid ${theme.color.neutral[theme.mode][200]}`};
  flex-grow: 0;
  flex-shrink: 0;
  padding: 20px;
  box-sizing: border-box;
  overflow: auto;
`;

const SectionTitle = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  line-height: 48px;
  margin: 0px;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const DocInfoRow = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  line-height: 24px;
  margin: 0 0 4px 0;
  font-weight: 400;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  > div:nth-of-type(1) {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  }
  > div:nth-of-type(2) {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  }
`;

export { Sidebar };
