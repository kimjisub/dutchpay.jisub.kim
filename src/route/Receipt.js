import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { OverlayTrigger, Popover, Card, ListGroup } from 'react-bootstrap'
import { firestore } from '../firebase'
import {
	Textfield,
	Button,
	Tabs,
	Tab,
	IconButton,
	Menu,
	MenuItem,
	Checkbox
} from 'react-mdl'
import './Receipt.css'

class App extends Component {
	constructor({ match }) {
		super()
		this.info = {
			groupId: match.params.groupId,
			receiptId: match.params.receiptId
		}
		this.state = {
			tab: 0,
			update: 0,
			itemIndex: -1
		}

		this.fs = firestore()

		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.get()
			.then(doc => {
				if (doc.exists) this.members = doc.data().members
			})

		if (this.info.receiptId !== 'new')
			this.fs
				.collection('DutchPay')
				.doc(this.info.groupId)
				.collection('Receipts')
				.doc(this.info.receiptId)
				.get()
				.then(doc => {
					if (doc.exists) {
						let data = (window.$data = doc.data())
						this.setState({ receipt: data })
					}
				})
		else {
			let data = (window.$data = {
				name: '',
				items: [],
				payers: {},
				timestamp: {
					nanoseconds: 0,
					seconds: parseInt(new Date().getTime() / 1000)
				}
			})
			this.state.receipt = data
		}
	}

	updateToFB(receipt) {
		if (this.info.receiptId !== 'new')
			this.fs
				.collection('DutchPay')
				.doc(this.info.groupId)
				.collection('Receipts')
				.doc(this.info.receiptId)
				.set(receipt)
		else
			this.fs
				.collection('DutchPay')
				.doc(this.info.groupId)
				.collection('Receipts')
				.add(receipt)
	}

	delete() {
		if (this.info.receiptId !== 'new')
			this.fs
				.collection('DutchPay')
				.doc(this.info.groupId)
				.collection('Receipts')
				.doc(this.info.receiptId)
				.delete()
	}

	render() {
		if (!this.state.receipt) return <div>로딩중</div>

		const memberPopup = (
			<Popover id="popover-basic">
				<Popover.Content>
					<ListGroup variant="flush">
						{Object.entries(this.members).map(data => {
							let id = data[0]
							let name = data[1]

							let buyers =
								this.state.receipt.items[this.state.itemIndex]?.buyers || []
							let checked = buyers.includes(id)
							return (
								<ListGroup.Item key={id}>
									<Checkbox
										checked={checked}
										label={name}
										onChange={e => {
											if (e.target.checked) buyers.push(id)
											else buyers.splice(buyers.indexOf(id), 1)
											this.setState({ update: this.state.update + 1 })
										}}
									/>
								</ListGroup.Item>
							)
						})}
					</ListGroup>
				</Popover.Content>
			</Popover>
		)

		let totalPrice = 0
		for (let i in this.state.receipt.items) {
			let item = this.state.receipt.items[i]
			totalPrice += parseInt(item.price) || 0
		}

		const tab1 = (
			<table>
				<thead>
					<tr>
						<th>상품명</th>
						<th>가격</th>
						<th>인원</th>
						<th>삭제</th>
					</tr>
				</thead>
				<tbody>
					{this.state.receipt.items.map((item, i) => {
						return (
							<tr key={'item-' + i}>
								<td>
									<Textfield
										className="mdl-textfield-small"
										onChange={e => {
											let s = Object.assign({}, this.state)
											s.receipt.items[i].name = e.target.value
											this.setState(s)
										}}
										label="상품명"
										defaultValue={item.name}
										style={{ width: '200px' }}
										id={`${i}-name`}
									/>
								</td>
								<td>
									<Textfield
										className="mdl-textfield-small"
										onChange={e => {
											let s = Object.assign({}, this.state)
											s.receipt.items[i].price = parseInt(e.target.value)
											this.setState(s)
										}}
										pattern="-?[0-9]*(\.[0-9]+)?"
										error="숫자가 아닙니다."
										label="가격"
										defaultValue={item.price}
										style={{ width: '200px' }}
										id={`item-price-${i}`}
									/>
								</td>
								<td>
									<OverlayTrigger
										rootClose
										trigger="click"
										placement="right"
										overlay={memberPopup}>
										<label style={{ margin: 0 }}>
											<IconButton
												name="person"
												ripple
												onClick={() => {
													this.setState({ itemIndex: i })
												}}
											/>
											{this.state.receipt.items[i].buyers.length}
										</label>
									</OverlayTrigger>
								</td>

								<td>
									<IconButton name="item-delete" id={'item-delete-' + i} />
									<Menu target={'item-delete-' + i}>
										<MenuItem
											onClick={() => {
												let s = Object.assign({}, this.state)
												s.receipt.items.splice(i)
												this.setState(s)
											}}>
											삭제
										</MenuItem>
									</Menu>
								</td>
							</tr>
						)
					})}
				</tbody>
				<tfoot>
					<tr>
						<th>총</th>
						<td>{totalPrice}</td>
					</tr>
					<tr style={{ padding: 0 }}>
						<td>
							<Button
								onClick={() => {
									let s = Object.assign({}, this.state)
									s.receipt.items.push({
										name: '',
										buyers: [],
										price: 0
									})
									this.setState(s)
								}}>
								추가
							</Button>
						</td>
					</tr>
				</tfoot>
			</table>
		)

		let totalPaied = 0
		for (let i in this.state.receipt.payers) {
			let item = this.state.receipt.payers[i]
			totalPaied += parseInt(item) || 0
		}

		const tab2 = (
			<table>
				<thead>
					<tr>
						<th>결제자</th>
						<th>가격</th>
						<th>삭제</th>
					</tr>
				</thead>
				<tbody>
					{Object.entries(this.state.receipt.payers).map((data, i) => {
						let id = data[0]
						let price = data[1]

						return (
							<tr key={'payer-' + i}>
								<td>
									{this.members[id]}
									{/* <OverlayTrigger
										rootClose
										trigger="click"
										placement="right"
										overlay={memberPopup}>
										<label style={{ margin: 0 }}>
											<IconButton
												name="person"
												ripple
												onClick={() => {
													//this.setState({ itemIndex: i })
												}}
											/>
											{this.members[id]}
										</label>
									</OverlayTrigger> */}
								</td>
								<td>
									<Textfield
										className="mdl-textfield-small"
										onChange={e => {
											let s = Object.assign({}, this.state)
											s.receipt.payers[id] = parseInt(e.target.value)
											this.setState(s)
										}}
										pattern="-?[0-9]*(\.[0-9]+)?"
										error="숫자가 아닙니다."
										label="가격"
										defaultValue={price}
										style={{ width: '200px' }}
										id={`pay-price-${i}`}
									/>
								</td>

								<td>
									<IconButton name="delete" id={'delete-' + i} />
									<Menu target={'delete-' + i}>
										<MenuItem
											onClick={() => {
												let s = Object.assign({}, this.state)
												delete s.receipt.payers[id]
												this.setState(s)
											}}>
											삭제
										</MenuItem>
									</Menu>
								</td>
							</tr>
						)
					})}
				</tbody>
				<tfoot>
					<tr>
						<th>총</th>
						<td>{totalPaied}</td>
					</tr>
					<tr style={{ padding: 0 }}>
						<td>
							<Button
								onClick={() => {
									let s = Object.assign({}, this.state)
									s.receipt.items.push({
										name: '',
										buyers: [],
										price: 0
									})
									this.setState(s)
								}}>
								추가
							</Button>
						</td>
					</tr>
				</tfoot>
			</table>
		)

		return (
			<div className="popup-background">
				<Card
					className="popup"
					open={true}
					style={{ minWidth: '60%', width: '400px' }}>
					<div className="title">
						<Textfield
							onChange={e => {
								let s = Object.assign({}, this.state)
								s.receipt.name = e.target.value
								this.setState(s)
							}}
							label="영수증 이름"
							floatingLabel
							defaultValue={this.state.receipt.name}
							style={{ width: '200px' }}
						/>
					</div>
					<div className="content">
						<Tabs
							activeTab={this.state.tab}
							onChange={tab => this.setState({ tab })}
							ripple>
							<Tab>영수증</Tab>
							<Tab>결제</Tab>
						</Tabs>
						<section>{this.state.tab === 0 ? tab1 : tab2}</section>
					</div>
					<div className="action">
						<Link to={`/${this.info.groupId}`}>
							<Button
								type="button"
								onClick={() => {
									this.updateToFB(this.state.receipt)
								}}>
								저장
							</Button>
						</Link>
						<Link to={`/${this.info.groupId}`}>
							<Button type="button">취소</Button>
						</Link>

						{this.info.receiptId !== 'new' ? (
							<div>
								<Button type="button" id="delete">
									삭제
								</Button>
								<Menu target="delete">
									<Link to={`/${this.info.groupId}`}>
										<MenuItem
											onClick={() => {
												this.delete()
											}}>
											삭제
										</MenuItem>
									</Link>
								</Menu>
							</div>
						) : null}
					</div>
				</Card>
			</div>
		)
	}
}

export default App
