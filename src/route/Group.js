import React, { Component } from "react";
import { firestore } from "../firebase";
import MagicGrid from "react-magic-grid";
import ExpenditureCard from "../components/ExpenditureCard";
import SettlementCard from "../components/SettlementCard";
import ReceiptCard from "../components/ReceiptCard";
import "./Group.css";
import { calcExpenditure } from "../algorithm";

class App extends Component {
  constructor({ match }) {
    super();
    this.info = { groupId: match.params.groupId };
    this.state = {
      group: null,
      receipts: {}
    };

    // Firebase
    this.fs = firestore();

    this.fs
      .collection("DutchPay")
      .doc(this.info.groupId)
      .onSnapshot(doc => {
        let data = (window.$data = doc.data());
        //console.log("Group Data Changed: ", data);
        this.setState({ group: data });
      });

    this.fs
      .collection("DutchPay")
      .doc(this.info.groupId)
      .collection("Receipts")
      .onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
          let id = change.doc.id;
          let data = change.doc.data();
          //console.log("Receipts", change.type, id);

          let s = Object.assign({}, this.state);
          switch (change.type) {
            case "added":
              s.receipts[id] = data;
              this.setState(s);
              break;
            case "modified":
              s.receipts[id] = data;
              this.setState(s);
              break;
            case "removed":
              delete s.receipts[id];
              this.setState(s);
              break;
            default:
          }
        });
      });
  }

  editReceipt(key) {
    let isNew = key ? false : true;
    const s = Object.assign({}, this.state);
    if (isNew)
      s.dialog.editReceipt = {
        isOpen: true,
        key: null,
        isNew: true,
        data: {
          items: [
            //{buyers:[],name:"", price:0}
          ],
          name: "",
          payers: [
            //{"1asdf":0}
          ],
          timestamp: {
            nanoseconds: 0,
            seconds: parseInt(new Date().getTime() / 1000)
          }
        }
      };
    else
      s.dialog.editReceipt = {
        isOpen: true,
        key: key,
        isNew: false,
        data: Object.assign({}, s.receipts[key])
      };
    this.setState(s);
  }

  render() {
    if (!this.state.group) return <div>로딩중</div>;

    let receipts = [];

    for (let key in this.state.receipts) {
      let receipt = this.state.receipts[key];
      receipts.push(
        <ReceiptCard
          key={key}
          receipt={receipt}
          members={this.state.group.members}
          to={`/${this.info.groupId}/${key}`}
        />
      );
    }

    return (
      <div className="group">
        <header>
          <p>
            <a href="https://dutchpay.kimjisub.me">Dutchpay.kimjisub.me</a>
          </p>
          <h1>{this.state.group.name}</h1>
          <p>Setting</p>
        </header>
        <div id="content">
          <div className="empty"></div>
          <section>
            <aside id="dashboard">
              <ExpenditureCard
                expenditure={calcExpenditure(
                  this.state.group.members,
                  this.state.receipts
                )}
                members={this.state.group.members}
              />
              <SettlementCard data={this.state.group} />
            </aside>
            <main id="receipts">
              {receipts.length > 0 ? (
                <MagicGrid items={receipts.length}>{receipts}</MagicGrid>
              ) : null}
            </main>
          </section>
          <div className="empty"></div>
        </div>
        <footer>푸터</footer>
      </div>
    );
  }
}

export default App;
