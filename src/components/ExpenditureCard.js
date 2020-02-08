import React, { Component } from "react";
import ExpenditureItem from "./ExpenditureItem";

import {
  Badge,
  Icon,
  Card,
  CardTitle,
  CardText,
  CardMenu,
  IconButton
} from "react-mdl";

class App extends Component {
  render() {
    let memberCount = Object.keys(this.props.members).length;

    // let list = this.props.data.members.map(e => {
    //   return e.name
    // })

    let list = [];

    for (let id in this.props.members) {
      let name = this.props.members[id];
      let spend = this.props.expenditure[id].spend;
      let paied = this.props.expenditure[id].paied;

      list.push(<ExpenditureItem name={name} spend={spend} paied={paied} key={id}/>);
    }

    return (
      <Card shadow={0} className="card">
        <CardTitle>지출 내역</CardTitle>

        <CardText>{list}</CardText>
        <CardMenu>
          <Badge text={memberCount} overlap>
            <Icon name="account_box" />
          </Badge>
          <IconButton name="share" />
        </CardMenu>
      </Card>
    );
  }
}

export default App;
