import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { IconButton } from 'react-mdl'
import { Card, Spinner } from 'react-bootstrap'

import queryString from 'query-string'
import { firestore } from '../firebase'
import ExpenditureCard from '../components/ExpenditureCard'
import SettlementCard from '../components/SettlementCard'
import ReceiptCard from '../components/ReceiptCard'
import EditableTextView from '../components/EditableTextView'
import './Group.scss'
import { calcExpenditure, calcSettlement } from '../algorithm'

class App extends Component {
	constructor({ match, location }) {
		super()
		this.info = { groupId: match.params.groupId }
		this.location = location
		this.query = queryString.parse(location.search)
		this.state = {
			group: null,
			receipts: {},
			editMode: this.query.edit,
		}

		// Firebase
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

	setEditMode(mode) {
		this.props.history.push({ pathname: '/' + this.info.groupId, search: mode ? '?edit=true' : '' })
		this.setState({ editMode: mode })
	}

	saveGroupSetting(finishEdit = false) {
		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.set(this.state.group)
			.then(() => {
				if (finishEdit) this.setEditMode(false)
			})
	}

	render() {
		if (!this.state.group)
			return (
				<div className="popup">
					<div>
						<Spinner animation="border" />
					</div>
				</div>
			)

		let receipts = []

		for (let key in this.state.receipts) {
			let receipt = this.state.receipts[key]
			receipts.push(
				<ReceiptCard
					key={key}
					receipt={receipt}
					members={this.state.group.members}
					to={`/${this.info.groupId}/receipt/${key}${this.state.editMode ? '?edit=true' : ''}`}
					editMode={this.state.editMode}
				/>
			)
		}
		receipts.reverse()

		let expenditure = calcExpenditure(this.state.group.members, this.state.receipts)

		let settlement = calcSettlement(expenditure)

		return (
			<div className="Group">
				<header>
					<a href="https://dutchpay.kimjisub.me" id="brand">
						dutchpay
					</a>
					<IconButton
						ripple
						name={this.state.editMode ? 'check' : 'edit'}
						onClick={() => {
							if (this.state.editMode) this.saveGroupSetting(true)
							else this.setEditMode(true)
						}}
					/>
				</header>
				<section>
					<article>
						<span>
							<EditableTextView
								label="모임 이름"
								text={this.state.group.name}
								editMode={this.state.editMode}
								onChange={(e) => {
									let s = Object.assign({}, this.state)
									s.group.name = e.target.value
									this.setState(s)
								}}
							/>
							정산 내역서
						</span>
						<div>
							<aside id="dashboard">
								<ExpenditureCard
									expenditure={expenditure}
									members={this.state.group.members}
									onMembersChange={(members) => {
										let s = Object.assign({}, this.state)
										s.group.members = members
										this.setState(s)
										this.saveGroupSetting()
									}}
									onMemberClick={(id) => {
										this.props.history.push({ pathname: '/' + this.info.groupId + '/member/' + id, search: this.state.editMode ? '?edit=true' : '' })
									}}
									editMode={this.state.editMode}
								/>
								<SettlementCard members={this.state.group.members} settlement={settlement} />
							</aside>
							<main id="receipts">
								{this.state.editMode ? (
									<Link to={`/${this.info.groupId}/receipt/new?edit=true`}>
										<Card className="add-card">
											<Card.Body>추가하기</Card.Body>
										</Card>
									</Link>
								) : null}
								{receipts}
							</main>
						</div>
					</article>
				</section>
				<footer>기획,개발: 김지섭 디자인: 손채린</footer>
			</div>
		)
	}
}

export default App
