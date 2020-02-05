import React, { Component } from "react";
import "./ExpenditureItem.css";

class App extends Component {
  render() {
    return (
      <div id="root">
        <p id="name">{this.props.name}</p>
        <div id="price">
            <p id="price1">{this.props.price}</p>
            <p id="price2">{this.props.payed}</p>
        </div>
      </div>
    );
  }
}

export default App;
