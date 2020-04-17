import Title from "components/title"
import { Data } from "graphs/Planning/base"
import React from "react"
import { useData } from "utils"
import DecisionMap from "./map"
import Words from "./words"

const Planning = () => {
  const data: Data = useData("points.json", "JSON", { points: {}, words: {} } as Data)
  return (
    <div className="has-background-white" style={{ height: "100%", width: "100%" }}>
      <Title
        name="Planning Applications Ireland"
        subtext="Submission for Assignment 3"
        background="danger"
        text="light"
      />
      <DecisionMap data={data} />
      <Words data={data} />
    </div>
  )
}

export default Planning
