import chroma from "chroma-js"
import Title from "components/title"
import React from "react"
import { useData } from "utils"
import { VictoryChart, VictoryScatter, VictoryLegend, VictoryLine, VictoryArea, VictoryAxis } from "victory"

const Minard = () => {
  const cities: CityRow[] = useData("minard_cities.csv")
  const dates: DateRow[] = useData("minard_dates.csv")
  const soldiers: SoldierRow[] = useData("minard_soldiers.csv")
  return (
    <div className="has-background-white container" style={{ height: "100%", width: "100%" }}>
      <Title name="Minard's Map" subtext="Submission for Assignment 1.2 Part B" background="success" text="light" />
      <div style={{ height: "100%", width: "100%" }}>
        <div className="card">
          <div className="card-content">
            <div className="columns">
              <div className="column">
                <Graph {...{ cities, soldiers, dates }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Minard

type CityRow = { LONC: string; LATC: string; CITY: string }
type DateRow = { LONT: string; TEMP: string; DAYS: string; MON: string; DAY: string }
type SoldierRow = { LONP: string; LATP: string; SURV: string; DIR: string; DIV: string }
type GraphProps = { cities: CityRow[]; dates: DateRow[]; soldiers: SoldierRow[] }

const Graph = ({ dates, cities, soldiers }: GraphProps) => {
  const maxSoldiers = Math.max(...soldiers.map(row => Number(row.SURV)))
  const strokeWidth = (soldiers: string) => (30 * Number(soldiers)) / maxSoldiers
  const temps = dates.map(row => Number(row.TEMP))
  const min = Math.min(...temps)
  const scale = chroma.scale(["hsl(200, 100%, 80%)", "hsl(217, 71%, 43%)"]).mode("lab")
  const days = dates.reduce((sum, row) => Number(row.DAYS) + sum, 0)
  const GradientLegend = (props: any) => {
    return (
      <g>
        <text x={props.x - 3} y={props.y + 30} style={{ fontSize: 8 }}>
          0°C
        </text>
        <text x={props.x + 62} y={props.y + 30} style={{ fontSize: 8 }}>{`${min}°C`}</text>
        <rect x={props.x} y={props.y} width={70} height={20} style={{ fill: "url(#tempScale)" }} />
      </g>
    )
  }
  return (
    <div>
      <svg>
        <defs>
          <linearGradient id="temp" x1="1" x2="0" y1="0" y2="0">
            {dates.map((row, index) => (
              <stop
                key={index}
                offset={`${Math.round(
                  (dates.slice(0, index).reduce((sum, row) => sum + Number(row.DAYS), 0) / days) * 100
                )}%`}
                stopColor={`${scale(Math.abs(Number(row.TEMP) / min))}`}
              />
            ))}
          </linearGradient>
          <linearGradient id="tempScale">
            <stop offset="0%" stopColor="hsl(200, 100%, 80%)" />
            <stop offset="100%" stopColor="hsl(217, 71%, 53%)" />
          </linearGradient>
        </defs>
      </svg>

      <VictoryChart>
        {
          soldiers.reduce(
            (prev: { lines: any[]; row?: SoldierRow }, row) => {
              return prev.row
                ? {
                    row,
                    lines: [
                      ...prev.lines,
                      <VictoryLine
                        domain={{ y: [53, 56], x: [23.5, 38] }}
                        key={row.LONP}
                        style={{
                          data: {
                            strokeWidth: strokeWidth(prev.row.SURV),
                            stroke: prev.row.DIR === "A" ? "hsl(141, 71%, 48%)" : "hsl(348, 100%, 61%)",
                            strokeLinecap: "round"
                          }
                        }}
                        data={[
                          { x: Number(prev.row.LONP), y: Number(prev.row.LATP) },
                          { x: Number(row.LONP), y: Number(row.LATP) }
                        ]}
                      />
                    ]
                  }
                : { lines: [], row }
            },
            { row: undefined, lines: [] }
          ).lines
        }
        <VictoryScatter
          domain={{ y: [53, 56], x: [23.5, 38] }}
          data={cities.map(row => ({ x: Number(row.LONC), y: Number(row.LATC), label: row.CITY }))}
          size={2}
          style={{
            labels: { fontSize: 5 },
            data: { fill: "black" }
          }}
        />
        <VictoryArea
          domain={{ y: [53, 56], x: [23.5, 38] }}
          style={{
            data: { fill: "url(#temp)" }
          }}
          data={[
            { y: 53.5, x: 23.5 },
            { y: 53.5, x: 38 }
          ]}
        />
        <VictoryLegend
          x={55}
          y={0}
          style={{ labels: { fontSize: 10 } }}
          orientation="vertical"
          gutter={20}
          colorScale={["hsl(141, 71%, 48%)", "hsl(348, 100%, 61%)"]}
          data={[{ name: "Arriving" }, { name: "Returning" }]}
        />
        <VictoryLegend
          x={150}
          y={5}
          dataComponent={<GradientLegend />}
          style={{ labels: { fontSize: 0 } }}
          gutter={20}
          data={[{ name: "Arriving" }]}
        />
        <VictoryAxis style={{ axis: { display: "none" }, tickLabels: { display: "none" } }} />
      </VictoryChart>
    </div>
  )
}
