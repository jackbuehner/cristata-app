/** @jsxImportSource @emotion/react */
import Color from 'color';
import React from 'react';
import { themeType } from '../../utils/theme/theme';
import { Chart, CategoryScale, LinearScale, LineController, PointElement, LineElement, Filler } from 'chart.js';
import { css } from '@emotion/react';
import { Button } from '../../components/Button';
import { HomeSectionHeading } from '../../components/Heading';
import { DataUsage24Regular } from '@fluentui/react-icons';

interface IAnalyticsChart {
  theme: themeType;
}

class AnalyticsChart extends React.Component<IAnalyticsChart> {
  componentDidMount() {
    const ctx = 'analyticsChart';

    //let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    //gradient.addColorStop(0, 'green');
    //gradient.addColorStop(1, 'pink');
    //ctx.fillStyle = gradient;
    //ctx.fillRect(10, 10, 200, 100);

    Chart.register(CategoryScale, LinearScale, LineController, PointElement, LineElement, Filler);

    new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
        labels: ['', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', ''],
        datasets: [
          {
            data: [0, 3841, 6763, 3705, 2976, 531, 1728, 2591, 2467, 1421, 826, 555, 127, 200],
          },
        ],
      },

      // Configuration options go here
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: 0,
        },
        elements: {
          line: {
            borderColor: this.props.theme.color.primary[800],
            tension: 0.4,
            fill: 'origin',
            backgroundColor: Color(this.props.theme.color.primary[800]).alpha(0.09).string(),
          },
          point: {
            backgroundColor: this.props.theme.color.primary[800],
          },
        },
        scales: {
          x: {
            position: 'top',
            grid: {
              color: Color(this.props.theme.color.neutral[this.props.theme.mode][900]).alpha(0.3).string(), // line color
              drawBorder: false, // no border between axis and axis labels
            },
            ticks: {
              font: {
                family: this.props.theme.font.detail,
                size: 12,
                //color: this.props.theme.color.neutral[this.props.theme.mode][800],
                style: 'normal',
              },
              padding: 16,
            },
          },
          y: {
            grid: {
              display: false, // hide lines
              drawBorder: false, // no border between axis and axis labels
            },
            ticks: {
              align: 'end',
              font: {
                family: this.props.theme.font.detail,
                size: 12,
                //color: this.props.theme.color.neutral[this.props.theme.mode][800],
                style: 'normal',
                lineHeight: 0,
              },
              padding: -46,
            },
          },
        },
      },
    });
  }

  render() {
    return (
      <>
        <div
          css={css`
            height: 30px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          `}
        >
          <HomeSectionHeading icon={<DataUsage24Regular />}>Site Analytics</HomeSectionHeading>
          <div
            css={css`
              display: flex;
              flex-direction: row;
              gap: 6px;
            `}
          >
            <Button disabled>Sort</Button>
            <Button disabled>Year</Button>
          </div>
        </div>
        <div
          css={css`
            height: calc(100% - 30px + 6px);
            width: calc(100% + 74px);
            margin-left: -37px;
          `}
        >
          <canvas id='analyticsChart'></canvas>
        </div>
      </>
    );
  }
}

export { AnalyticsChart };
