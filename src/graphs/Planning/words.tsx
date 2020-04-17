import { Data, decisionColours, Decision, WordCounts } from "graphs/Planning/base"
import HighchartsReact from "highcharts-react-official"
import _ from "lodash"
import React, { useState, useRef } from "react"
const Highcharts = require("highcharts")
const HighchartsMore = require("highcharts/highcharts-more")
HighchartsMore(Highcharts)

const Words = (props: { data: Data }) => {
  return (
    <div className="container">
      <HighchartsReact options={useOptions(props.data)} highcharts={Highcharts} />
    </div>
  )
}

export default Words

const useOptions = (data: Data): Highcharts.Options => {
  const isBubble = useRef(true)
  const [empty, setEmpty] = useState(false)
  const wordTotals = _.mapValues(data.words, (counts) => counts.slice(0, 25).reduce((sum, val) => sum + val[1], 0))
  const formatted = formatWordCounts(data.words)
  return {
    chart: {
      type: isBubble.current ? "packedbubble" : "column",
      height: "70%",
      events: {
        click: () => {
          setEmpty(!isBubble.current)
          isBubble.current = !isBubble.current
        },
      },
    },
    xAxis: { categories: formatted.xAxis },
    title: {
      text: "Common word in planning applications.",
    },
    subtitle: {
      text: "Click the graph to change view.",
    },
    tooltip: {
      useHTML: true,
      pointFormat:
        "<b>{point.name}</b>: Occurrs in <b>{point.y}%</b> ({point.custom.count}) of {point.custom.decision} decisions.",
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
      data: formatted.data[decision]
        .map((val, index) => ({
          name: formatted.xAxis[index],
          y: round((val * 100) / wordTotals[decision]),
          value: round((val * 100) / wordTotals[decision]),
          custom: { count: val, decision: decision.toLowerCase() },
        }))
        .filter((p) => p.name),
    })) as any,
  }
}

const formatWordCounts = (wordCounts: WordCounts) => {
  const wordMaps = _.mapValues(wordCounts, (counts) =>
    counts.reduce((wordMap, val) => ({ ...wordMap, [val[0]]: val[1] }), {} as { [word: string]: number })
  )
  const axisOrder = _.union(..._.map(wordCounts, (counts) => counts.slice(0, 25).map((val) => val[0])))
  return {
    xAxis: axisOrder,
    data: (_.mapValues(wordCounts, (__, decision: Decision) =>
      axisOrder.map((word) => wordMaps[decision][word] || 0)
    ) as any) as { [decision in Decision]: number[] },
  }
}

const round = (num: number) => Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)
