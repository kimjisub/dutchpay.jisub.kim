import React, { Component } from "react";
import "./ExpenditureItem.css";

class App extends Component {
  render() {
    return (
      <div class="expenditure-item">
        <p class="name">{this.props.name}</p>
        <div class="price">
            <p class="spend">{this.props.spend}</p>
            <p class="paied">{this.props.paied}</p>
        </div>
      </div>
    );
  }
}

export default App;
