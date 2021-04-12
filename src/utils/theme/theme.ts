import { getColorShades, lighten, darken } from './getColorShades';

export type color = {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  1000: string;
  1100: string;
  1200: string;
  1300: string;
  1400: string;
  1500: string;
};

export type colorShade =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 1000
  | 1100
  | 1200
  | 1300
  | 1400
  | 1500;

const themeColors = {
  red: getColorShades('#900000', 15) as color,
  orange: getColorShades('orange', 15) as color,
  yellow: getColorShades('yellow', 15) as color,
  pink: getColorShades('pink', 15) as color,
  green: getColorShades('green', 15) as color,
  blue: getColorShades('blue', 15) as color,
  turquoise: getColorShades('turquoise', 15) as color,
  indigo: getColorShades('purple', 15) as color,
  violet: getColorShades('indigo', 15) as color,
};

const themeFonts = {
  headline: 'Adamant BG',
  body: 'Georgia',
  detail: 'Lato',
};

const mode = 'light' as 'light' | 'dark';

const theme = {
  color: {
    ...themeColors,
    primary: themeColors.violet,
    danger: themeColors.red,
    success: themeColors.green,
    neutral: {
      light: {
        100: darken('#ffffff', 0.05),
        200: darken('#ffffff', 0.1),
        300: darken('#ffffff', 0.15),
        400: darken('#ffffff', 0.2),
        500: darken('#ffffff', 0.28),
        600: darken('#ffffff', 0.36),
        700: darken('#ffffff', 0.42),
        800: darken('#ffffff', 0.5),
        900: darken('#ffffff', 0.58),
        1000: darken('#ffffff', 0.66),
        1100: darken('#ffffff', 0.72),
        1200: darken('#ffffff', 0.8),
        1300: darken('#ffffff', 0.85),
        1400: darken('#ffffff', 0.9),
        1500: darken('#ffffff', 0.95),
      },
      dark: {
        100: lighten('#000000', 0.05),
        200: lighten('#000000', 0.1),
        300: lighten('#000000', 0.15),
        400: lighten('#000000', 0.2),
        500: lighten('#000000', 0.28),
        600: lighten('#000000', 0.36),
        700: lighten('#000000', 0.42),
        800: lighten('#000000', 0.5),
        900: lighten('#000000', 0.58),
        1000: lighten('#000000', 0.66),
        1100: lighten('#000000', 0.72),
        1200: lighten('#000000', 0.8),
        1300: lighten('#000000', 0.85),
        1400: lighten('#000000', 0.9),
        1500: lighten('#000000', 0.95),
      },
    },
  },
  font: themeFonts,
  mode: mode,
  radius: '2px',
  dimensions: {
    PageHead: {
      height: '64px',
      width: '100%',
    },
    titlebar: {
      height: '0px',
    },
  },
};

export type colorType =
  | 'primary'
  | 'danger'
  | 'success'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'turquoise'
  | 'indigo'
  | 'violet'
  | 'neutral';

export type themeType = typeof theme;

export { theme };
