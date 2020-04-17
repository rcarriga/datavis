import { Data, decisionColours, Decision } from "graphs/Planning/base"
import HighchartsReact from "highcharts-react-official"
import _ from "lodash"
import React from "react"
const Highcharts = require("highcharts")
const HighchartsMore = require("highcharts/highcharts-more")
HighchartsMore(Highcharts)

const Words = (props: { data: Data }) => {
  return (
    <div className="container">
      <HighchartsReact options={createOptions(props.data)} highcharts={Highcharts} />
    </div>
  )
}

export default Words

const createOptions = (data: Data): Highcharts.Options => {
  const wordTotals = _.mapValues(data.words, (counts) => counts.slice(0, 25).reduce((sum, val) => sum + val[1], 0))
  return {
    chart: {
      type: "column",
      height: "500",
    },
    tooltip: {
      useHTML: true,
      pointFormat: " <b>{point.name}</b>: {point.y}%",
    },
    plotOptions: {
      series: {
        stacking: "normal",
      },
      packedbubble: {
        minSize: "20%",
        maxSize: "100%",
        layoutAlgorithm: {
          splitSeries: true,
          seriesInteraction: false,
          parentNodeLimit: true,
        },
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          style: {
            color: "black",
            textOutline: "none",
            fontWeight: "normal",
          },
        },
      },
    } as any,
    series: _.map(data.words, (counts, decision: Decision) => ({
      name: decision,
      color: decisionColours[decision],
      stack: "normal",
      marker: {
        lineColor: "black",
      },
      data: counts
        .slice(0, 25)
        .map((val) => ({ name: val[0], y: round((val[1] * 100) / wordTotals[decision]), custom: { count: val[1] } }))
        .filter((p) => p.name),
    })) as any,
  }
}

const round = (num: number, figures: number = 2) => Math.round(num * Math.pow(10, figures)) / Math.pow(10, figures)
