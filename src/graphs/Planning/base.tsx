export const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const
export type Month = typeof monthNames[number]
export type Year = number
export const decisions = ["Unconditional", "Conditional", "Refused"] as const
export type Decision = typeof decisions[number]

export type Point = {
  name: string
  date: string
  lat: number
  lon: number
  decision: Decision
  authority: string
}

export type Points = { [year: number]: { [month in Month]: Point[] } }

export type WordCounts = { [decision in Decision]: [string, number][] }

export type Data = {
  points: Points
  words: WordCounts
}

export const decisionColours: { [decision in Decision]: string } = {
  Unconditional: "rgb(0, 255, 0)",
  Conditional: "rgb(255, 255, 0)",
  Refused: "rgb(255, 0, 0)",
}
