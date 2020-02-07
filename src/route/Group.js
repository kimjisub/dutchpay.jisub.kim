import React, { Component } from "react";
import { firestore } from "../firebase";
import MagicGrid from "react-magic-grid";
import ExpenditureCard from "../components/ExpenditureCard";
import SettlementCard from "../components/SettlementCard";
import ReceiptCard from "../components/ReceiptCard";
import "./Group.css";
import { calcExpenditure } from "../algorithm"

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
    if(!this.state.data)
      return (<div>로딩중</div>)
    
    


    return (
      <div className="group">
        <header>
          <p><a href="https://dutchpay.kimjisub.me">Dutchpay.kimjisub.me</a></p>
          <h1>{this.state.data.name}</h1>
          <p>Setting</p>
        </header>
        <div id="content">
          <div class="empty"></div>
          <section>
            <aside id="dashboard">
              <ExpenditureCard expenditure={calcExpenditure(this.state.data)} members={this.state.data.members}/>
              <SettlementCard data={this.state.data} />
            </aside>
            <main id="receipts">
              <MagicGrid items={this.state.data.receipts.length}>
                {this.state.data.receipts.map(receipt => (
                  <ReceiptCard receipt={receipt} members={this.state.data.members}/>
                ))}
              </MagicGrid>
            </main>
          </section>
          <div class="empty"></div>
        </div>
        <footer>푸터</footer>
      </div>
    )
  }
//calcExpenditure(this.state.data)
  
}

export default App;
