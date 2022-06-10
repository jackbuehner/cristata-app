import Color from 'color';
import { colorType, themeType, colorShade } from '../../utils/theme/theme';

function buttonEffect(
  color: colorType,
  colorShade: colorShade,
  theme: themeType,
  disabled?: boolean,
  backgroundColor?: {
    base?: string;
    hover?: string;
    active?: string;
  },
  border?: {
    base?: string;
    hover?: string;
    active?: string;
  }
) {
  return `
    cursor: default;
    user-select: none;
    background-color: ${
      disabled && !backgroundColor?.base
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
                backgroundColor?.hover
                  ? backgroundColor.hover
                  : color === 'neutral'
                  ? Color(theme.color[color][theme.mode][colorShade]).alpha(0.2).string()
                  : Color(theme.color[color][colorShade]).alpha(0.2).string()
              };
              border: ${
                border?.hover
                  ? border.hover
                  : `1px solid ${
                      color === 'neutral'
                        ? Color(theme.color[color][theme.mode][colorShade]).alpha(0.2).string()
                        : Color(theme.color[color][colorShade]).alpha(0.2).string()
                    }`
              };
              box-shadow: ${
                theme.mode === 'dark'
                  ? `0 2.4px 3.6px 0 rgb(0 0 0 / 26%), 0 0.45px 0.9px 0 rgb(0 0 0 / 22%), 0 0.45px 5px 0 ${
                      color === 'neutral'
                        ? Color(theme.color[color][theme.mode][colorShade]).alpha(0.26).string()
                        : Color(theme.color[color][colorShade]).alpha(0.26).string()
                    }`
                  : `0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)`
              };
            }
            &:focus {
              outline: none;
            }
            &:hover:active {
              background-color: ${
                backgroundColor?.active
                  ? backgroundColor.active
                  : color === 'neutral'
                  ? Color(theme.color[color][theme.mode][colorShade]).alpha(0.25).string()
                  : Color(theme.color[color][colorShade]).alpha(0.25).string()
              };
              border: ${
                border?.active
                  ? border.active
                  : `1px solid ${
                      color === 'neutral'
                        ? Color(theme.color[color][theme.mode][colorShade]).alpha(0.25).string()
                        : Color(theme.color[color][colorShade]).alpha(0.25).string()
                    }`
              };
            }
            &:active {
              box-shadow: ${
                theme.mode === 'dark'
                  ? `none`
                  : `0 0.8px 3.6px 0 rgb(0 0 0 / 13%), 0 0.15px 0.9px 0 rgb(0 0 0 / 11%)`
              };
            }
          `
    }
  `;
}

export { buttonEffect };
