import ireland from "@highcharts/map-collection/countries/ie/ie-all.geo.json"

import IconButton from "@material-ui/core/IconButton"

import Slider from "@material-ui/core/Slider"
import PauseIcon from "@material-ui/icons/PauseSharp"
import PlayIcon from "@material-ui/icons/PlayArrow"

import { Point, decisions, Month, Year, monthNames, Decision, Data, decisionColours } from "graphs/Planning/base"
import HighchartsReact from "highcharts-react-official"
import boost from "highcharts/modules/boost"
import clusters from "highcharts/modules/marker-clusters"
import _ from "lodash"
import proj4 from "proj4"
import React, { useState, useEffect, useRef } from "react"
const Highcharts = require("highcharts/highmaps")
declare global {
  interface Window {
    proj4: any
  }
}
window.proj4 = proj4

clusters(Highcharts)
boost(Highcharts)

const nextMonth = (month: Month, year: number, years: number[]): [Month, Year] => {
  if (year === 2020 && month === "Feb") return ["Jan", years[0]]
  if (month === "Dec") return ["Jan", years[(years.indexOf(year) + 1) % years.length]]
  return [monthNames[monthNames.indexOf(month) + 1], year]
}

const DecisionMap = ({ data }: { data: Data }) => {
  const ref = useRef(null)
  const [year, setYear] = useState(2011)
  const [month, setMonth] = useState("Jan" as Month)
  return (
    <div className="columns" ref={ref}>
      <div className="column is-three-quarters">
        <Map data={data} year={year} month={month} />
      </div>
      <div className="column">
        <Controls
          {...{
            month,
            setYear,
            years: _.keys(data.points).map(Number),
            year,
            setMonth,
            months: _.keys(data.points[year] || {}).map(Number),
          }}
        />
      </div>
    </div>
  )
}

export default DecisionMap

type ControlProps = {
  years: number[]
  year: number
  month: Month
  setYear: (year: number) => void
  setMonth: (month: Month) => void
}

const Controls = (props: ControlProps) => {
  const { year, month, years, setYear, setMonth } = props
  const [play, setPlay] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      if (play) {
        const [nMonth, nYear] = nextMonth(month, year, years)
        setMonth(nMonth)
        if (nYear !== year) setYear(nYear)
      }
    }, 1000)
  }, [play, year, month, setMonth, setYear, years])
  return (
    <div className="container" style={{ maxWidth: 300, marginTop: "40px" }}>
      <strong>Year</strong>
      <div>{year}</div>
      <div>
        <Slider
          max={years.length - 1}
          value={years.indexOf(year)}
          onChange={(_, newVal) => typeof newVal === "number" && setYear(years[newVal])}
        />
      </div>
      <strong>Month</strong>
      <div>{month}</div>
      <div>
        <Slider
          max={11}
          value={monthNames.indexOf(month)}
          onChange={(_, newVal) => typeof newVal === "number" && setMonth(monthNames[newVal])}
        />
      </div>

      {play ? (
        <IconButton onClick={() => setPlay(false)}>
          <PauseIcon />
        </IconButton>
      ) : (
        <IconButton onClick={() => setPlay(true)}>
          <PlayIcon />
        </IconButton>
      )}
    </div>
  )
}

const Map = (props: { data: Data; year: number; month: Month }) => {
  const monthData = props.data.points[props.year]?.[props.month]
  const createSeriesWithDecision = (decision: Decision) =>
    createSeries(
      decision,
      monthData.filter((point) => point.decision === decision)
    )
  const series = monthData ? decisions.map(createSeriesWithDecision) : []
  return <HighchartsReact options={createOptions(series)} highcharts={Highcharts} constructorType="mapChart" />
}

const createOptions = (series: Highcharts.SeriesMappointOptions[]): Highcharts.Options => ({
  chart: {
    ...({ map: ireland } as any),
    height: "100%",
    animation: {},
  },
  credits: { enabled: false },
  title: {
    text: "Decisions of Planning Applications",
  },
  tooltip: {
    enabled: false,
  },
  series: [
    {
      type: "map",
      name: "Basemap",
      borderColor: "#A0A0A0",
      nullColor: "rgba(200, 200, 200, 0.3)",
      showInLegend: false,
    },
    ...series,
  ],
})

const createSeries = (name: Decision, data: Point[]): Highcharts.SeriesMappointOptions => {
  const colour = decisionColours[name]
  return {
    name,
    color: `rgb(${colour})`,
    type: "mappoint",
    turboThreshold: 0,
    data,
    dataLabels: { enabled: false },
    marker: {
      enabled: true,
      symbol: "circle",
      states: {
        hover: {
          lineWidth: 0,
          radiusPlus: 0,
        },
      },
      fillColor: {
        stops: [
          [0, 1],
          [0.7, 0.2],
          [1, 0],
        ].map((rad) => [rad[0], colour.replace(")", `, ${rad[1]})`).replace("rgb", "rgba")]),
        radialGradient: { r: 10, cx: 0.5, cy: 0.5 },
      },
    },
    cluster: {
      enabled: true,
      allowOverlap: false,
      zones: _.zip(_.range(0, 1000, 30), _.range(30, 1000, 30)).map((range) =>
        range[1] ? { from: range[0], to: range[1] - 1, marker: { radius: Math.pow(Math.log(range[1]), 2) } } : {}
      ),
    },
  }
}
