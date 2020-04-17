import Papa from "papaparse"
import { useState, useEffect } from "react"

export const useData = <A = any>(source: string, type: "CSV" | "JSON" = "CSV", defaultVal?: A): A => {
  const [data, setData] = useState(defaultVal || ([] as any))
  useEffect(() => {
    fetch(`data/${source}`).then((response) => {
      if (type === "CSV")
        response.text().then((csvData) => {
          Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
              setData(results.data)
            },
          })
        })
      else response.json().then(setData)
    })
  }, [source, type])
  return data
}

export const round = (num: number, digits = 1): number => {
  const rounder = Math.pow(10, digits)
  return Math.floor(num * rounder) / rounder
}
