import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Textfield, IconToggle, Button } from 'react-mdl'
import { firestore } from '../firebase'
import MagicGrid from 'react-magic-grid'
import ExpenditureCard from '../components/ExpenditureCard'
import SettlementCard from '../components/SettlementCard'
import ReceiptCard from '../components/ReceiptCard'
import './Group.css'
import { calcExpenditure, calcSettlement } from '../algorithm'

class App extends Component {
	constructor({ match }) {
		super()
		this.info = { groupId: match.params.groupId }
		this.state = {
			group: null,
			receipts: {},
			editMode: false
		}

		// Firebase
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

	saveGroupSetting() {
		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.set(this.state.group)
	}

	render() {
		if (!this.state.group) return <div>로딩중</div>

		let receipts = []

		for (let key in this.state.receipts) {
			let receipt = this.state.receipts[key]
			receipts.push(<ReceiptCard key={key} receipt={receipt} members={this.state.group.members} to={`/${this.info.groupId}/receipt/${key}`} />)
		}

		let expenditure = calcExpenditure(this.state.group.members, this.state.receipts)

		let settlement = calcSettlement(expenditure)

		return (
			<div className="group">
				<header>
					<p>
						<a href="https://dutchpay.kimjisub.me">Dutchpay.kimjisub.me</a>
					</p>
					<h1>
						{this.state.editMode ? (
							<Textfield
								onChange={e => {
									let s = Object.assign({}, this.state)
									s.group.name = e.target.value
									this.setState(s)
								}}
								label="모임 이름"
								defaultValue={this.state.group.name}
								floatingLabel
								style={{ width: '200px', fontSize: '1.4rem' }}
							/>
						) : (
							this.state.group.name
						)}
					</h1>
					<p>
						<IconToggle
							id="italic"
							name={this.state.editMode ? 'check' : 'edit'}
							onChange={e => {
								if (this.state.editMode) this.saveGroupSetting()
								this.setState({ editMode: e.target.checked })
							}}
						/>
					</p>
				</header>
				<div id="content">
					<div className="empty"></div>
					<section>
						<aside id="dashboard">
							<ExpenditureCard
								expenditure={expenditure}
								members={this.state.group.members}
								onMembersChange={members => {
									let s = Object.assign({}, this.state)
									s.group.members = members
									this.setState(s)
									this.saveGroupSetting()
								}}
								editMode={this.state.editMode}
							/>
							<SettlementCard members={this.state.group.members} settlement={settlement} />
						</aside>
						<main id="receipts">
							<MagicGrid items={receipts.length + 1} id="magicGrid">
								<Link to={`/${this.info.groupId}/receipt/new`}>
									<Button raised ripple>
										추가하기
									</Button>
								</Link>
								{receipts}
							</MagicGrid>
						</main>
					</section>
					<div className="empty"></div>
				</div>
				<footer>푸터</footer>
			</div>
		)
	}
}

export default App
