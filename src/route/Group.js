import React, { Component } from "react";
import { firestore } from "../firebase";
import MagicGrid from "react-magic-grid";
import ExpenditureCard from "../components/ExpenditureCard";
import SettlementCard from "../components/SettlementCard";
import ReceiptCard from "../components/ReceiptCard";
import "./Group.css";

let fs;

class App extends Component {
  constructor({ match }) {
    super();
    this.state = {};
    window.$fs = fs = firestore();
    fs.collection("DutchPay")
      .doc(match.params.id)
      .onSnapshot(doc => {
        let data = (window.$data = doc.data());
        console.log("Current data: ", data);
        this.setState({ data: data });
      });
  }

  render() {
    let receiptList = [];
    return this.state.data ? (
      <div className="Group">
        <header>
          <p className="titleText">{this.state.data.name}</p>
        </header>
        <div className="Content">
          <div className="leftFix">
            <ExpenditureCard data={this.state.data} />
            <SettlementCard data={this.state.data} />
          </div>

          <div className="ReceiptList">
            <MagicGrid items={this.state.data.receipts.length}>
              {this.state.data.receipts.map(item => (
                <ReceiptCard data={item} />
              ))}
            </MagicGrid>
          </div>
        </div>
      </div>
    ) : (
      <div>로딩중</div>
    );
  }
}

export default App;
