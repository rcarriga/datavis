import Papa from "papaparse"
import { useState, useEffect } from "react"

export const useData = <A = any>(source: string): A => {
  const [data, setData] = useState([] as any)
  useEffect(() => {
    fetch(`data/${source}`).then(response => {
      response.text().then(csvData => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            setData(results.data)
          }
        })
      })
    })
  }, [source])
  return data
}

export const round = (num: number, digits = 1): number => {
  const rounder = Math.pow(10, digits)
  return Math.floor(num * rounder) / rounder
}
