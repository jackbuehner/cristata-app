import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Color from 'color';
import { useNavigate } from 'svelte-preprocess-react/react-router';
import type { themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';

interface IUserCard {
  href?: string;
  name: string;
  position: string;
  email: string;
  photo?: string;
  status?: 'invited' | 'active' | 'deactivated' | 'invite_ignored';
  children?: React.ReactNode;
}

function UserCard(props: IUserCard) {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const tenant = location.pathname.split('/')[1];

  return (
    <Component
      theme={theme}
      href={props.href}
      onClick={(e) => {
        e.preventDefault();
        if (props.href) navigate(`/${tenant}${props.href}`);
      }}
    >
      <ProfilePhoto theme={theme} src={props.photo || ''} />
      <Name theme={theme}>{props.name}</Name>
      <Info theme={theme}>{props.position}</Info>
      <Info theme={theme}>{props.email}</Info>
      {props.status !== 'active' ? (
        <Info theme={theme} italic moreMargin danger>
          {props.status === 'invited'
            ? 'Pending invitation acceptance'
            : props.status === 'deactivated'
            ? 'Account deactivated'
            : props.status === 'invite_ignored'
            ? 'Invitation expired'
            : ''}
        </Info>
      ) : null}
      {props.children}
    </Component>
  );
}

const Component = styled.a<{ theme: themeType }>`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 30px 20px;
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  text-decoration: none;
  border: ${({ theme }) => `1px solid ${Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()}`};
  ${({ theme, href }) =>
    href
      ? buttonEffect('primary', theme.mode === 'light' ? 800 : 300, theme, false, { base: 'transparent' })
      : null}
`;

const ProfilePhoto = styled.div<{ theme: themeType; src?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ src }) => `url(${src})`};
  background-position: center;
  background-size: cover;
  box-shadow: inset 0 0 0 2px black;
`;

const Name = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  margin: 6px 0;
  text-align: center;
`;

const Info = styled.div<{ theme: themeType; italic?: boolean; moreMargin?: boolean; danger?: boolean }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-style: ${({ italic }) => (italic ? 'italic' : 'regular')};
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  margin: ${({ moreMargin }) => (moreMargin ? '6px' : '2px')} 0 2px 0;
  text-align: center;
  color: ${({ theme, danger }) =>
    danger ? theme.color.danger[theme.mode === 'light' ? 800 : 300] : theme.color.neutral[theme.mode][1400]};
`;

export { UserCard };
