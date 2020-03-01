import React from "react"

const Title = (props: { name: string; subtext: string; background: string; text: string }) => (
  <div className={`hero has-background-${props.background}`}>
    <div className="hero-body">
      <div className="container">
        <h1 className={`title has-text-${props.text}`}>{props.name}</h1>
        <h2 className={`subtitle has-text-${props.text}`}>{props.subtext}</h2>
      </div>
    </div>
  </div>
)

export default Title
