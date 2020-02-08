import React, { Component } from "react";
import { Link } from "react-router-dom";
import { firestore } from "../firebase";
import {
  Textfield,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Checkbox,
  Snackbar
} from "react-mdl";

class App extends Component {
  constructor({ match }) {
    super();
    this.info = {
      groupId: match.params.groupId,
      receiptId: match.params.receiptId
    };
    this.state = { 
        tab: 0
    };

    this.fs = firestore();

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
        .add({
          name: "",
          items: [],
          payers: {},
          timestamp: {
            nanoseconds: 0,
            seconds: parseInt(new Date().getTime() / 1000)
          }
        })
  }

  delete() {
    if (this.info.receiptId !== "new")
      this.fs
        .collection("DutchPay")
        .doc(this.info.groupId)
        .collection("Receipts")
        .doc(this.info.receiptId)
        .delete()
  }

  render() {
    if (!this.state.originalReceipt) return <div>로딩중</div>;

    return (
      <Dialog open={true} style={{ minWidth: "60%", width: "400px" }}>
        <DialogTitle>
          <Textfield
            onChange={e => {
              this.receipt.name = e.target.value;
            }}
            label="영수증 이름"
            floatingLabel
            defaultValue={this.receipt.name}
            style={{ width: "200px" }}
          />
        </DialogTitle>
        <DialogContent>
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
                      <IconButton name="more_vert" id={"menu" + i} />
                      <Menu target={"menu" + i}>
                        <MenuItem>복제</MenuItem>
                        <MenuItem>삭제</MenuItem>
                        <Checkbox defaultChecked />
                      </Menu>
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

                      <Button ripple>
                        <Badge text="1" overlap>
                          <Icon name="mood" />
                        </Badge>
                        김지섭,이은지
                      </Button>
                    </ListItem>
                  );
                })}
              </List>
            ) : null}
          </section>
        </DialogContent>
        <DialogActions>
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
              <Link to={`/${this.info.groupId}`}>
            <Button
              type="button"
              onClick={() => {
                this.delete();
              }}
            >
              삭제
            </Button>
            </Link>
          ) : null}
        </DialogActions>
      </Dialog>
    );
  }
}

export default App;
