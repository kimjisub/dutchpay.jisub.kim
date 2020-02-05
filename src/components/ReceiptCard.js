import React, { Component } from "react";
import './Card.css'

class App extends Component {
  render() {
    return (
      <div className="Card">
        {this.props.data.name}
      </div>
    );
  }
}

export default App;
