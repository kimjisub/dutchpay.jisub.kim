import React, { Component } from "react";

class App extends Component {
  render() {
    let totalPrice = 0;
    let paiedPrice = 0;

    let itemList = this.props.receipt.items.map(item => {
      totalPrice += item.price;
      return (
        <tr>
          <th>{item.name}</th>
          <th>{item.price}</th>
          <th>{item.buyers.length}명</th>
        </tr>
      );
    });

    let payerList = this.props.receipt.payers.map(item => {
      let payer = item.name;
      let price = item.price;
      paiedPrice += price;
      return (
        <tr>
          <th>{this.props.members[payer]}</th>
          <th>{item.price}</th>
          <th></th>
        </tr>
      );
    });

    let diff = totalPrice - paiedPrice;
    let statusMsg;

    if (diff == 0) statusMsg = <p>결제 완료</p>;
    else if (diff > 0) statusMsg = <p>{diff}원 미결제</p>;
    else if (diff < 0) statusMsg = <p>{-diff}원 초과결제</p>;

    return (
      <div className="card">
        <p className="title">{this.props.receipt.name}</p>
        <table>
          <tr>
            <th>이름</th>
            <th>가격</th>
            <th>구매 인원</th>
          </tr>
          {itemList}
          <tr>
            <th>총</th>
            <th>{totalPrice}</th>
            <th></th>
          </tr>
          <tr>
            <th></th>
          </tr>

          <tr>
            <th>결제자</th>
            <th>결제 금액</th>
            <th></th>
          </tr>

          {payerList}

          <tr>
            <th>총</th>
            <th>{paiedPrice}</th>
            <th></th>
          </tr>
        </table>

        <p>{statusMsg}</p>
      </div>
    );
  }
}

export default App;
