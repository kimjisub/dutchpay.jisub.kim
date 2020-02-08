import React, { Component } from "react";
import "./ExpenditureItem.css";

class App extends Component {
  render() {
    return (
      <div className="expenditure-item">
        <p className="name">{this.props.name}</p>
        <div className="price">
            <p className="spend">{this.props.spend}</p>
            <p className="paied">{this.props.paied}</p>
        </div>
      </div>
    );
  }
}

export default App;
