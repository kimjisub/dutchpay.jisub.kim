import React, { Component } from "react";
import "./SettlementItem.css";

class App extends Component {
  render() {
    return (
      <div id="root">
  <p id="name">{this.props.from} -> {this.props.to} : {this.props.price}</p>
      </div>
    );
  }
}

export default App;
