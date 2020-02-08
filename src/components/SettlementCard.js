import React, { Component } from "react";
import SettlementItem from "./SettlementItem";
import {
  Card,
  CardTitle,
  CardText,
  CardMenu,
  IconButton
} from "react-mdl";

class App extends Component {
  render() {
    return (
      <Card shadow={0} className="card">
        <CardTitle>정산</CardTitle>
        <CardText>
          <SettlementItem from="김지섭" to="김지섭2" price="1000" />
          <SettlementItem from="김지섭" to="김지섭2" price="1000" />
        </CardText>
        <CardMenu>
          <IconButton name="share" />
        </CardMenu>
      </Card>
    );
  }
}

export default App;
