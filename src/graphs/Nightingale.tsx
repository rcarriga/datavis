import Slider from "@material-ui/core/Slider"
import Title from "components/title"
import React, { useState } from "react"
import { useData, round } from "utils"
import { VictoryBar, VictoryStack, VictoryTheme, VictoryTooltip } from "victory"
const VictoryChart = require("victory").VictoryChart
const VictoryPolarAxis = require("victory-polar-axis").VictoryPolarAxis

type Row = { Month: string; Size: string; [deathType: string]: string }

const Nightingale = () => {
  const data: Row[] = useData("nightingale.csv")
  const [range, setRange] = useState([0, 11])
  const [rotation, setRotation] = useState(0)
  return (
    <div className="has-background-light" style={{ height: "100%", width: "100%" }}>
      <Title
        name="Nightingale's Rose Chart"
        subtext="Submission for Assignment 1.2 Part A"
        background="info"
        text="light"
      />
      <div className="container">
        <div className="card">
          <div className="card-content">
            <div className="columns">
              <div className="column">
                <Graph
                  rotation={rotation}
                  data={data.slice(range[0], range[1])}
                  deathTypes={Object.keys(data[0] || {}).filter(key => !["Month", "Size"].includes(key))}
                />
              </div>
              <div className="column">
                <Controls
                  {...{
                    rotation,
                    setRotation,
                    range,
                    setRange,
                    dates: Object.values(data)
                      .map(row => row.Month)
                      .filter(date => date)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Nightingale

type GraphProps = {
  deathTypes: string[]
  data: Row[]
  rotation: number
}
const Graph = ({ data, deathTypes, rotation }: GraphProps) => {
  const tickValues = data.map(row => row.Month)
  return (
    <VictoryChart
      startAngle={rotation}
      endAngle={360 + rotation}
      theme={VictoryTheme.material}
      polar
      height={400}
      width={400}
    >
      <VictoryPolarAxis labelPlacement="vertical" tickValues={tickValues}></VictoryPolarAxis>
      <VictoryStack>
        {deathTypes.map((deathType, index) => {
          const barData = data.map(row => {
            const rate = round((12000 * Number(row[deathType])) / Number(row.Size)) || 0
            return { y: rate, x: row.Month, label: `${deathType} Death Rate in ${row.Month}: ${rate}` }
          })
          return <VictoryBar labelComponent={<VictoryTooltip />} animate key={index} data={barData}></VictoryBar>
        })}
      </VictoryStack>
    </VictoryChart>
  )
}

type ControlProps = {
  dates: string[]
  range: number[]
  setRange: (range: number[]) => void
  rotation: number
  setRotation: (rotation: number) => void
}

const Controls = (props: ControlProps) => {
  return (
    <div className="container" style={{ maxWidth: 300 }}>
      <strong>Date Range</strong>
      <div>{props.dates[props.range[0]] + " - " + props.dates[props.range[1]]}</div>
      <div>
        <Slider
          value={props.range}
          max={props.dates.length - 1}
          onChange={(_, newVal) => typeof newVal !== "number" && newVal[0] - newVal[1] < -2 && props.setRange(newVal)}
        />
      </div>
      <strong>Rotation</strong>
      <div>
        <Slider
          value={props.rotation}
          max={360}
          onChange={(_, newVal) => typeof newVal === "number" && props.setRotation(newVal)}
        />
      </div>
    </div>
  )
}
