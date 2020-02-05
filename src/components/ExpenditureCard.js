import React, { Component } from "react";
import ExpenditureItem from "./ExpenditureItem"
import "./ExpenditureCard.css"

class App extends Component {
  render() {
    let memberCount = Object.keys(this.props.data.members).length;

    return (
      <div className="ExpenditureCard">
        <p className="subtitleText">지출 내역 {memberCount}명</p>
        <ExpenditureItem
        name="김지섭" price="17000" payed="1000"/>
        <ExpenditureItem
        name="김지섭" price="17000" payed="1000"/>
      </div>
    );
  }
}

export default App;
