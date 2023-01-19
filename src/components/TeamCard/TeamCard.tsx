import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type mongoose from 'mongoose';
import { useNavigate } from 'svelte-preprocess-react/react-router';
import { genAvatar } from '../../utils/genAvatar';
import type { themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';

interface ITeamCard {
  href: string;
  name: string;
  slug: string;
  members: mongoose.Types.ObjectId[];
  photo?: string;
}

function TeamCard(props: ITeamCard) {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const tenant = location.pathname.split('/')[1];

  return (
    <Component
      theme={theme}
      href={props.href}
      onClick={(e) => {
        e.preventDefault();
        navigate(`/${tenant}${props.href}`);
      }}
    >
      <div>
        <TeamPhoto theme={theme} src={props.photo || genAvatar(props.slug, 36, 'bauhaus')} />
      </div>
      <div>
        <Title theme={theme}>{props.name}</Title>
        <Subtitle theme={theme}>{props.slug}</Subtitle>
        <Subtitle theme={theme}>
          {props.members.length} member{props.members.length === 1 ? '' : 's'}
        </Subtitle>
      </div>
    </Component>
  );
}

const Component = styled.a<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  text-decoration: none;
  ${({ theme }) =>
    buttonEffect('primary', theme.mode === 'light' ? 800 : 300, theme, false, { base: 'transparent' })}
`;

const TeamPhoto = styled.div<{ theme: themeType; src?: string }>`
  width: 36px;
  height: 36px;
  margin: 5px 0 0 0;
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ src }) => `url(${src})`};
  background-position: center;
  background-size: cover;
  box-shadow: inset 0 0 0 1.5px black;
`;

const Title = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
`;

const Subtitle = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`;

export { TeamCard };
