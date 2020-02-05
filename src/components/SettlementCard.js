import React, { Component } from "react";
import SettlementItem from "./SettlementItem"
import "./SettlementCard.css"

class App extends Component {
  render() {
    let memberCount = Object.keys(this.props.data.members).length;

    return (
      <div className="SettlementCard">
        <p className="subtitleText">정산 내역</p>
        <SettlementItem
        from="김지섭" to="김지섭2" price="1000"/>
        <SettlementItem
        from="김지섭" to="김지섭2" price="1000"/>
      </div>
    );
  }
}

export default App;
