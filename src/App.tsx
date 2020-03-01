import Welcome from "components/welcome"
import Minard from "graphs/Minard"
import Nightingale from "graphs/Nightingale"
import React from "react"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"

function App() {
  return (
    <Router basename="/datavis">
      <div className="has-background-grey-lighter">
        <div style={{}}>
          <div className="navbar has-background-white" role="navigation">
            <div className="navbar-brand">
              <Link to="/" className="navbar-item">
                <p className="title is-4" style={{ marginLeft: 10 }}>
                  DataVis
                </p>
              </Link>
            </div>
            <div className="navbar-menu is-active">
              <div className="navbar-start">
                <Link to="/nightingale" className="navbar-item">
                  <div className="subtitle is-6">Nightingale</div>
                </Link>
                <Link to="/minard" className="navbar-item">
                  <div className="subtitle is-6">Minard</div>
                </Link>
              </div>
            </div>
          </div>
          <Switch>
            <Route path="/nightingale">
              <Nightingale />
            </Route>
            <Route path="/minard">
              <Minard />
            </Route>
            <Route path="/">
              <Welcome />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  )
}

export default App
