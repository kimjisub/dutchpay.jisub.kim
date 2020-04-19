import React, { Component } from 'react'
import queryString from 'query-string'
import { Spinner } from 'react-bootstrap'
import { firestore } from '../firebase'
import { Button } from 'react-mdl'
import NumberFormat from 'react-number-format'
import './Member.scss'
import { calcSingleExpenditure } from '../algorithm'

class App extends Component {
	constructor({ match, location }) {
		super()
		this.info = {
			groupId: match.params.groupId,
			memberId: match.params.memberId,
		}
		this.location = location
		this.query = queryString.parse(location.search)
		this.state = {
			group: null,
			receipts: {},
		}

		this.fs = firestore()

		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.onSnapshot((doc) => {
				let data = (window.$data = doc.data())
				//console.log("Group Data Changed: ", data);
				this.setState({ group: data })
			})

		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.collection('Receipts')
			.orderBy('timestamp', 'asc')
			.onSnapshot((querySnapshot) => {
				querySnapshot.docChanges().forEach((change) => {
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
				<main>
					<p id="title">
						<span id="name">{this.state.group.members[this.info.memberId]}</span>님의 지출 내역
					</p>

					<div id="list">
						<ol>
							{singleExpenditure.map((receipt, i) => {
								return (
									<li key={i}>
										<div>
											<p>{receipt.name}</p>
											<p>
												<NumberFormat value={receipt.totalPrice} displayType={'text'} thousandSeparator={true} />
											</p>
										</div>

										<ol>
											{receipt.items.map((item, i) => {
												return (
													<li key={i}>
														<div>
															<p>{item.name}</p>
															<p>
																<NumberFormat value={item.price} displayType={'text'} thousandSeparator={true} />
															</p>
														</div>
													</li>
												)
											})}
										</ol>
									</li>
								)
							})}
						</ol>
					</div>
					<div className="action">
						<div>
							<Button
								onClick={() => {
									this.close()
								}}>
								확인
							</Button>
						</div>
					</div>
				</main>
			</div>
		)
	}
}

export default App
