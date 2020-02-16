import React, { Component } from 'react'
import queryString from 'query-string'
import { Card, Spinner } from 'react-bootstrap'
import { firestore } from '../firebase'
import { Button, IconButton, Menu, MenuItem } from 'react-mdl'
import './Member.scss'
import { calcSingleExpenditure } from '../algorithm'

class App extends Component {
	constructor({ match, location }) {
		super()
		this.info = {
			groupId: match.params.groupId,
			memberId: match.params.memberId
		}
		this.location = location
		this.query = queryString.parse(location.search)
		this.state = {
			group: null,
			receipts: {}
		}

		this.fs = firestore()

		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.onSnapshot(doc => {
				let data = (window.$data = doc.data())
				//console.log("Group Data Changed: ", data);
				this.setState({ group: data })
			})

		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.collection('Receipts')
			.orderBy('timestamp', 'asc')
			.onSnapshot(querySnapshot => {
				querySnapshot.docChanges().forEach(change => {
					let id = change.doc.id
					let data = change.doc.data()
					//console.log("Receipts", change.type, id);

					let s = Object.assign({}, this.state)
					switch (change.type) {
						case 'added':
							s.receipts[id] = data
							break
						case 'modified':
							s.receipts[id] = data
							break
						case 'removed':
							delete s.receipts[id]
							break
						default:
					}
					this.setState(s)
				})
			})
	}

	close() {
		this.props.history.push({ pathname: `/${this.info.groupId}`, search: this.state.editMode ? '?edit=true' : '' })
	}

	render() {
		if (!this.state.group)
			return (
				<div className="Member popup">
					<div>
						<Spinner animation="border" />
					</div>
				</div>
			)

		let singleExpenditure = calcSingleExpenditure(this.info.memberId, this.state.receipts)
		return (
			<div className="Member popup">
				<div>
					<Card className="card">
						<Card.Body>
							<Card.Title>{this.state.group.members[this.info.memberId]}님의 지출 내역</Card.Title>

							<ol>
								{singleExpenditure.map((receipt, i) => {
									return (
										<li key={i}>
											<div>
												<p>{receipt.name}</p>
												<p>{receipt.totalPrice}</p>
											</div>

											<ol>
												{receipt.items.map((item, i) => {
													return (
														<li key={i}>
															<div>
																<p>{item.name}</p>
																<p>{item.price}</p>
															</div>
														</li>
													)
												})}
											</ol>
										</li>
									)
								})}
							</ol>
							<div>
								{/* <Tabs activeTab={this.state.tab} onChange={tab => this.setState({ tab })} ripple>
									<Tab>영수증</Tab>
									<Tab>결제</Tab>
								</Tabs>
								<section className="tab-page">{this.state.tab === 0 ? tab1 : tab2}</section> */}
							</div>

							<div className="action">
								<div>
									{this.state.editMode && this.info.receiptId !== 'new'
										? [
												<IconButton id="delete" key="button" name="delete">
													삭제
												</IconButton>,
												<Menu target="delete" key="menu">
													<MenuItem
														onClick={() => {
															this.delete()
														}}>
														삭제
													</MenuItem>
												</Menu>
										  ]
										: null}
								</div>
								<div></div>
								<div>
									<Button
										onClick={() => {
											this.close()
										}}>
										{this.state.editMode ? '취소' : '확인'}
									</Button>
									{this.state.editMode ? (
										<Button
											onClick={() => {
												this.updateToFB(this.state.receipt)
											}}>
											저장
										</Button>
									) : null}
								</div>
							</div>
						</Card.Body>
					</Card>
				</div>
			</div>
		)
	}
}

export default App
