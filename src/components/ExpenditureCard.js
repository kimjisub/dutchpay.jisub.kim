import React, { Component } from "react";
import ExpenditureItem from "./ExpenditureItem"

class App extends Component {
  render() {
    let memberCount = Object.keys(this.props.members).length;

    // let list = this.props.data.members.map(e => {
    //   return e.name
    // })

    let list = []

    for(let id in this.props.members){
      let name = this.props.members[id]
      let spend = this.props.expenditure[id].spend
      let paied = this.props.expenditure[id].paied

      list.push(<ExpenditureItem name={name} spend={spend} paied={paied}/>)
    }

    return (
      <div className="card">
        <p className="title">지출 내역 {memberCount}명</p>
        {list}
      </div>
    );
  }
}

export default App;
