import React, { Component } from "react";
import logo from "../logo.svg";
import "./MainPage.css";
import { firestore } from "../firebase";

let fs;

class MainPage extends Component {
  constructor() {
    super();
    window.$fs = fs = firestore();
  }

  render() {
    fs.collection("DutchPay")
      .doc("fjpxkYGp6cNPUpgjkr7I")
      .onSnapshot(function(doc) {
        console.log("Current data: ", doc.data());
      });
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            MainPage
          </a>
        </header>
      </div>
    );
  }
}

export default MainPage;
