import styled from '@emotion/styled/macro';
import { isSchemaDef } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import Color from 'color';
import { Button } from '../../../../components/Button';
import { Checkbox, Text } from '../../../../components/ContentField';
import { useAppSelector } from '../../../../redux/hooks';

interface OptionsTabProps {}

function OptionsTab(props: OptionsTabProps) {
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);

  const publicRules = state.collection?.publicRules;
  const name = state.collection?.name;
  const navLabel = state.collection?.navLabel;
  const canPublish = state.collection?.canPublish;
  const withPermissions = state.collection?.withPermissions;
  const withSubscription = state.collection?.withSubscription;

  return (
    <div style={{ margin: 20 }}>
      <Card>
        <CardLabel>Name</CardLabel>
        {name ? <Text isEmbedded label={'Schema name'} value={name[1]} /> : null}
        {navLabel ? <Text isEmbedded label={'Plural label'} value={navLabel[1]} /> : null}
      </Card>
      {publicRules !== undefined ? (
        publicRules === false ? (
          <Card>
            <CardLabel>Public access</CardLabel>
            <Button>Enable public queries</Button>
          </Card>
        ) : (
          <Card>
            <CardLabel>Public access</CardLabel>
            <Text isEmbedded label={'Filter query'} value={JSON.stringify(publicRules.filter || {}, null, 2)} />
            {state.collection &&
            isSchemaDef(state.collection.schemaDef.slug) &&
            state.collection.schemaDef.slug.type === 'String' ? (
              <Text isEmbedded label={'Slug date field'} value={publicRules.slugDateField} />
            ) : null}
            <Button>Disable public queries</Button>
          </Card>
        )
      ) : null}
      <Card>
        <CardLabel>More options</CardLabel>
        {canPublish ? <Checkbox isEmbedded label={'Allow items to be published'} checked={canPublish} /> : null}
        {withPermissions ? (
          <Checkbox isEmbedded label={'Use granular permissions for each item'} checked={withPermissions} />
        ) : null}
        {withSubscription ? (
          <Checkbox
            isEmbedded
            label={'Allow subscriptions to changes (via websockets)'}
            checked={withSubscription}
          />
        ) : null}
      </Card>
    </div>
  );
}

const Card = styled.div`
  margin: 16px 0;
  padding: 16px;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.03).string()};
  border-radius: ${({ theme }) => theme.radius};
`;

const CardLabel = styled.div`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin: 0 0 16px 0;
`;

export { OptionsTab };
