import React, { Component } from "react";
import { Link } from "react-router-dom";
import { OverlayTrigger, Popover, Card, ListGroup } from "react-bootstrap";
import { firestore } from "../firebase";
import {
  Textfield,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Checkbox
} from "react-mdl";
import "./Receipt.css";

class App extends Component {
  constructor({ match }) {
    super();
    this.info = {
      groupId: match.params.groupId,
      receiptId: match.params.receiptId
    };
    this.state = {
      tab: 0,
      update: 0,
      itemIndex: -1
    };

    this.fs = firestore();

    this.fs
      .collection("DutchPay")
      .doc(this.info.groupId)
      .get()
      .then(doc => {
        if (doc.exists) this.members = doc.data().members;
      });

    if (this.info.receiptId !== "new")
      this.fs
        .collection("DutchPay")
        .doc(this.info.groupId)
        .collection("Receipts")
        .doc(this.info.receiptId)
        .get()
        .then(doc => {
          if (doc.exists) {
            let data = (window.$data = doc.data());
            //console.log("Receipt Data: ", data);
            this.receipt = Object.assign({}, data);
            this.setState({ originalReceipt: data });
          }
        });
    else {
      let data = (window.$data = {
        name: "",
        items: [],
        payers: {},
        timestamp: {
          nanoseconds: 0,
          seconds: parseInt(new Date().getTime() / 1000)
        }
      });
      this.receipt = Object.assign({}, data);
      this.state.originalReceipt = data;
    }
  }

  updateToFB(receipt) {
    if (this.info.receiptId !== "new")
      this.fs
        .collection("DutchPay")
        .doc(this.info.groupId)
        .collection("Receipts")
        .doc(this.info.receiptId)
        .set(receipt);
    else
      this.fs
        .collection("DutchPay")
        .doc(this.info.groupId)
        .collection("Receipts")
        .add(receipt);
  }

  delete() {
    if (this.info.receiptId !== "new")
      this.fs
        .collection("DutchPay")
        .doc(this.info.groupId)
        .collection("Receipts")
        .doc(this.info.receiptId)
        .delete();
  }

  render() {
    if (!this.state.originalReceipt) return <div>로딩중</div>;

    let memberList = [];
    for (let id in this.members) {
      let buyers = this.receipt.items[this.state.itemIndex]?.buyers || []
      let checked = buyers.includes(id);
      memberList.push(
        <ListGroup.Item key={id}>
          <Checkbox
            checked={checked}
            onChange={e => {
              if (e.target.checked) buyers.push(id);
              else buyers.splice(buyers.indexOf(id), 1);
              this.setState({ update: this.state.update + 1 });
            }}
          />
          {this.members[id]}
        </ListGroup.Item>
      );
    }

    const memberPopup = (
      <Popover id="popover-basic">
        <Popover.Content>
          <ListGroup variant="flush">
            {memberList}
          </ListGroup>
        </Popover.Content>
      </Popover>
    );

    return (
      <div className="popup-background">
        <Card
          className="popup"
          open={true}
          style={{ minWidth: "60%", width: "400px" }}
        >
          <div className="title">
            <Textfield
              onChange={e => {
                this.receipt.name = e.target.value;
              }}
              label="영수증 이름"
              floatingLabel
              defaultValue={this.receipt.name}
              style={{ width: "200px" }}
            />
          </div>
          <div className="content">
            <Tabs
              activeTab={this.state.tab}
              onChange={tab => this.setState({ tab })}
              ripple
            >
              <Tab>영수증</Tab>
              <Tab>결제</Tab>
            </Tabs>
            <section>
              {this.state.tab === 0 ? (
                <List style={{ width: "300px" }}>
                  {this.receipt.items.map((item, i) => {
                    return (
                      <ListItem style={{ padding: 0 }} key={i}>
                        <Textfield
                          onChange={e => {
                            this.receipt.items[i].name = e.target.value;
                          }}
                          label="상품명"
                          defaultValue={item.name}
                          style={{ width: "200px" }}
                          id={`${i}-name`}
                        />
                        <Textfield
                          onChange={e => {
                            this.receipt.items[i].price = parseInt(
                              e.target.value
                            );
                          }}
                          pattern="-?[0-9]*(\.[0-9]+)?"
                          error="숫자가 아닙니다."
                          label="가격"
                          defaultValue={item.price}
                          style={{ width: "200px" }}
                          id={`${i}-price`}
                        />

                        <OverlayTrigger
                        rootClose
                          trigger="click"
                          placement="right"
                          overlay={memberPopup}
                        >
                          <Button ripple 
                          onClick={()=>{
                            this.setState({itemIndex:i})
                          }}>
                            <Badge text={this.receipt.items[i].buyers.length} overlap>
                              <Icon name="mood" />
                            </Badge>
                            김지섭,이은지
                          </Button>
                        </OverlayTrigger>

                        <IconButton name="delete" id={"delete-" + i} />
                        <Menu target={"delete-" + i}>
                          <MenuItem
                            onClick={() => {
                              this.receipt.items.splice(i);
                              this.setState({ update: this.state.update + 1 });
                            }}
                          >
                            삭제
                          </MenuItem>
                        </Menu>
                      </ListItem>
                    );
                  })}
                  <Button
                    onClick={() => {
                      this.receipt.items.push({
                        name: "",
                        buyers: [],
                        price: 0
                      });
                      this.setState({ update: this.state.update + 1 });
                    }}
                  >
                    추가
                  </Button>
                </List>
              ) : null}
            </section>
          </div>
          <div className="action">
            <Link to={`/${this.info.groupId}`}>
              <Button
                type="button"
                onClick={() => {
                  this.updateToFB(this.receipt);
                }}
              >
                저장
              </Button>
            </Link>
            <Link to={`/${this.info.groupId}`}>
              <Button type="button">취소</Button>
            </Link>

            {this.info.receiptId !== "new" ? (
              
              <div>
                <Button
                  type="button"
                  id="delete"
                >
                  삭제
                </Button>
                <Menu target="delete">
                  <Link to={`/${this.info.groupId}`}>
                          <MenuItem
                            onClick={() => {
                              this.delete();
                            }}
                          >
                            삭제
                          </MenuItem>
                          </Link>
                        </Menu>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    );
  }
}

export default App;
