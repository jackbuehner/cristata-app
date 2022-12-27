import loadable from '@loadable/component';
import FluentIconsFontCodes from '@fluentui/react-icons/lib/utils/fonts/FluentSystemIcons-Regular.json';

type FluentIconNames = keyof typeof FluentIconsFontCodes | 'CircleSmall20Filled';

const FluentIcon = loadable(
  (props: { name: FluentIconNames }) => import(/* webpackChunkName: "FluentIcon" */ `@fluentui/react-icons`),
  { resolveComponent: (c, props) => c[props.name] || c.CircleSmall20Filled, cacheKey: (props) => props.name }
);

export default FluentIcon;
export { FluentIcon };
export type { FluentIconNames };
