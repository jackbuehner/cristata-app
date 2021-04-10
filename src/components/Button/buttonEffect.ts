import Color from 'color';
import { colorType, themeType, colorShade } from '../../utils/theme/theme';

function buttonEffect(
  color: colorType,
  colorShade: colorShade,
  theme: themeType,
  disabled?: boolean,
  backgroundColor?: {
    base?: string;
  },
  border?: {
    base?: string;
  }
) {
  return `
    cursor: default;
    background-color: ${
      disabled
        ? Color(theme.color.neutral[theme.mode][800]).alpha(0.1).string()
        : backgroundColor?.base
        ? backgroundColor.base
        : Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()
    };
    border: ${
      border?.base
        ? border.base
        : `1px solid ${Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()}`
    };
    transition: border-color 160ms, border-radius 160ms, background-color 160ms, box-shadow 160ms;
    ${
      disabled
        ? ''
        : `
            &:hover,
            &:focus-visible,
            &:active {
              background-color: ${
                color === 'neutral'
                  ? Color(theme.color[color][theme.mode][colorShade]).alpha(0.15).string()
                  : Color(theme.color[color][colorShade]).alpha(0.15).string()
              };
              border: 1px solid ${
                color === 'neutral'
                  ? Color(theme.color[color][theme.mode][colorShade]).alpha(0.15).string()
                  : Color(theme.color[color][colorShade]).alpha(0.15).string()
              };
              box-shadow: 0 1.6px 3.6px 0 rgb(0 0 0 / 13%),
                0 0.3px 0.9px 0 rgb(0 0 0 / 11%);
            }
            &:focus {
              outline: none;
            }
            &:hover:active {
              background-color: ${
                color === 'neutral'
                  ? Color(theme.color[color][theme.mode][colorShade]).alpha(0.2).string()
                  : Color(theme.color[color][colorShade]).alpha(0.2).string()
              };
              border: 1px solid ${
                color === 'neutral'
                  ? Color(theme.color[color][theme.mode][colorShade]).alpha(0.2).string()
                  : Color(theme.color[color][colorShade]).alpha(0.2).string()
              };
            }
            &:active {
              box-shadow: 0 0.8px 3.6px 0 rgb(0 0 0 / 13%),
                0 0.15px 0.9px 0 rgb(0 0 0 / 11%);
            }
          `
    }
  `;
}

export { buttonEffect };
