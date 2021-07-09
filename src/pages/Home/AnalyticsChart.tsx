/** @jsxImportSource @emotion/react */
import Color from 'color';
import React from 'react';
import { themeType } from '../../utils/theme/theme';
import { Chart, CategoryScale, LinearScale, LineController, PointElement, LineElement } from 'chart.js';
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

    Chart.register(CategoryScale, LinearScale, LineController, PointElement, LineElement);

    new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
        labels: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', ''],
        datasets: [
          {
            backgroundColor: Color(this.props.theme.color.primary[800]).alpha(0.1).string(),
            borderColor: this.props.theme.color.primary[800],
            data: [0, 10, 5, 2, 20, 26, 35, 30, 38, 20, 28, 23, 27, 26],
          },
        ],
      },

      // Configuration options go here
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: 0,
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
              display: true, // hide lines
              drawBorder: false, // no border between axis and axis labels
            },
            ticks: {
              font: {
                family: this.props.theme.font.detail,
                size: 12,
                //color: this.props.theme.color.neutral[this.props.theme.mode][800],
                style: 'normal',
                lineHeight: 0,
              },
              padding: -32,
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
            height: 4.2rem;
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
            <Button>Sort</Button>
            <Button>Year</Button>
          </div>
        </div>
        <div
          css={css`
            height: calc(100% - 4.2rem);
          `}
        >
          <canvas id='analyticsChart'></canvas>
        </div>
      </>
    );
  }
}

export { AnalyticsChart };
