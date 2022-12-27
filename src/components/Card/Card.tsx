import { CardBox } from './CardBox';
import { CardLabel } from './CardLabel';
import { CardLabelCaption } from './CardLabelCaption';

interface CardProps {
  label?: React.ReactNode;
  caption?: React.ReactNode;
  children: React.ReactNode;
  noVerticalMargin?: boolean;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

function Card(props: CardProps) {
  return (
    <CardBox noVerticalMargin={props.noVerticalMargin} noPadding={props.noPadding} style={props.style}>
      {props.label ? <CardLabel>{props.label}</CardLabel> : null}
      {props.caption ? <CardLabelCaption>{props.caption}</CardLabelCaption> : null}
      {props.children}
    </CardBox>
  );
}

export { Card };
