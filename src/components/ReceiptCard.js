import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Card, CardTitle, CardText, CardMenu, IconButton } from "react-mdl";

class App extends Component {
  render() {
    let totalPrice = 0;
    let paiedPrice = 0;

    let itemList = this.props.receipt.items.map((item, i) => {
      totalPrice += item.price;
      return (
        <tr key={i}>
          <th>{item.name}</th>
          <th>{item.price}</th>
          <th>{item.buyers.length}명</th>
        </tr>
      );
    });

    let payerList = [];
    for (let id in this.props.receipt.payers) {
      let price = this.props.receipt.payers[id];
      paiedPrice += price;
      payerList.push(
        <tr key={id}>
          <th>{this.props.members[id]}</th>
          <th>{price}</th>
          <th></th>
        </tr>
      );
    }

    let diff = totalPrice - paiedPrice;
    let statusMsg;

    if (diff === 0) statusMsg = <p>결제 완료</p>;
    else if (diff > 0) statusMsg = <p>{diff}원 미결제</p>;
    else if (diff < 0) statusMsg = <p>{-diff}원 초과결제</p>;

    return (
      <Card shadow={0} className="card">
        <CardTitle>{this.props.receipt.name}</CardTitle>
        <CardText>
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>가격</th>
                <th>구매 인원</th>
              </tr>
            </thead>

            <tbody>{itemList}</tbody>
            <tfoot>
              <tr>
                <th>총</th>
                <th>{totalPrice}</th>
                <th></th>
              </tr>
            </tfoot>
          </table>
          <table>
            <thead>
              <tr>
                <th>결제자</th>
                <th>결제 금액</th>
                <th></th>
              </tr>
            </thead>

            <tbody>{payerList}</tbody>

            <tfoot>
              <tr>
                <th>총</th>
                <th>{paiedPrice}</th>
                <th></th>
              </tr>
            </tfoot>
          </table>

          {statusMsg}
        </CardText>
        <CardMenu>
          <Link to={this.props.to}>
            <IconButton name="edit" onClick={this.props.onClick} />
          </Link>
        </CardMenu>
      </Card>
    );
  }
}

export default App;
