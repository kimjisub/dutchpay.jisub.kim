import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import queryString from 'query-string'
import { OverlayTrigger, Popover, Card, ListGroup } from 'react-bootstrap'
import { firestore } from '../firebase'
import { Textfield, Button, Tabs, Tab, IconButton, Menu, MenuItem, Checkbox } from 'react-mdl'
import './Receipt.css'
import EditableTextView from '../components/EditableTextView'

class App extends Component {
	constructor({ match, location }) {
		super()
		this.info = {
			groupId: match.params.groupId,
			receiptId: match.params.receiptId
		}
		this.location = location
		this.query = queryString.parse(location.search)
		this.state = {
			tab: 0,
			update: 0,
			itemIndex: -1,
			editMode: this.query.edit
		}

		this.fs = firestore()

		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.get()
			.then(doc => {
				if (doc.exists) this.setState({ members: doc.data().members })
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
				timestamp: new Date()
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
				.then(() => {
					this.props.history.push({ pathname: `/${this.info.groupId}`, search: this.state.editMode ? '?edit=true' : '' })
				})
		else
			this.fs
				.collection('DutchPay')
				.doc(this.info.groupId)
				.collection('Receipts')
				.add(receipt)
				.then(() => {
					this.close()
				})
	}

	delete() {
		if (this.info.receiptId !== 'new')
			this.fs
				.collection('DutchPay')
				.doc(this.info.groupId)
				.collection('Receipts')
				.doc(this.info.receiptId)
				.delete()
				.then(() => {
					this.close()
				})
	}

	close() {
		this.props.history.push({ pathname: `/${this.info.groupId}`, search: this.state.editMode ? '?edit=true' : '' })
	}

	render() {
		if (!this.state.receipt || !this.state.members) return <div>로딩중</div>

		const memberPopup = (
			<Popover id="popover-basic">
				<Popover.Content>
					<ListGroup variant="flush">
						{Object.entries(this.state.members).map(data => {
							let id = data[0]
							let name = data[1]

							let buyers = this.state.receipt.items[this.state.itemIndex]?.buyers || []
							let checked = buyers.includes(id)
							return (
								<ListGroup.Item key={id}>
									<Checkbox
										checked={checked}
										label={name}
										onChange={e => {
											if (this.state.editMode) {
												if (e.target.checked) buyers.push(id)
												else buyers.splice(buyers.indexOf(id), 1)
											}
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
						{this.state.editMode ? <th>삭제</th> : null}
					</tr>
				</thead>
				<tbody>
					{this.state.receipt.items.map((item, i) => {
						return (
							<tr key={'item-' + i}>
								<td>
									<EditableTextView
										onChange={e => {
											let s = Object.assign({}, this.state)
											s.receipt.items[i].name = e.target.value
											this.setState(s)
										}}
										label="상품명"
										text={item.name}
										editMode={this.state.editMode}
										style={{ width: '200px' }}
									/>
								</td>
								<td>
									<EditableTextView
										onChange={e => {
											let s = Object.assign({}, this.state)
											s.receipt.items[i].price = parseInt(e.target.value)
											this.setState(s)
										}}
										label="가격"
										text={item.price}
										editMode={this.state.editMode}
										style={{ width: '200px' }}
									/>
								</td>
								<td>
									<OverlayTrigger rootClose trigger="click" placement="right" overlay={memberPopup}>
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
								{this.state.editMode ? (
									<td>
										<IconButton name="delete" id={'item-delete-' + i} />
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
								) : null}
							</tr>
						)
					})}
				</tbody>
				<tfoot>
					<tr>
						<th>총</th>
						<td>{totalPrice}</td>
					</tr>
					{this.state.editMode ? (
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
					) : null}
				</tfoot>
			</table>
		)

		const payerPopup = (
			<Popover id="popover-basic">
				<Popover.Content>
					<ListGroup variant="flush">
						{Object.entries(this.state.members).map(data => {
							let id = data[0]
							let name = data[1]

							return (
								<ListGroup.Item
									key={id}
									action
									onClick={() => {
										let s = Object.assign({}, this.state)
										s.receipt.payers[id] = 0
										this.setState(s)
									}}>
									{name}
								</ListGroup.Item>
							)
						})}
					</ListGroup>
				</Popover.Content>
			</Popover>
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
						{this.state.editMode ? <th>삭제</th> : null}
					</tr>
				</thead>
				<tbody>
					{Object.entries(this.state.receipt.payers).map((data, i) => {
						let id = data[0]
						let price = data[1]

						return (
							<tr key={'payer-' + i}>
								<td>{this.state.members[id]}</td>
								<td>
									<EditableTextView
										className="mdl-textfield-small"
										onChange={e => {
											let s = Object.assign({}, this.state)
											s.receipt.payers[id] = parseInt(e.target.value)
											this.setState(s)
										}}
										pattern="-?[0-9]*(\.[0-9]+)?"
										error="숫자가 아닙니다."
										label="가격"
										text={price}
										editMode={this.state.editMode}
										style={{ width: '200px' }}
										id={`pay-price-${i}`}
									/>
								</td>

								{this.state.editMode ? (
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
								) : null}
							</tr>
						)
					})}
				</tbody>
				<tfoot>
					<tr>
						<th>총</th>
						<td>{totalPaied}</td>
					</tr>
					{this.state.editMode ? (
						<tr style={{ padding: 0 }}>
							<td>
								<OverlayTrigger rootClose trigger="click" placement="right" overlay={payerPopup}>
									<label style={{ margin: 0 }}>
										<Button ripple>추가</Button>
									</label>
								</OverlayTrigger>
							</td>
						</tr>
					) : null}
				</tfoot>
			</table>
		)

		return (
			<div className="popup-background">
				<Card className="popup" open={true} style={{ minWidth: '60%', width: '400px' }}>
					<div className="title">
						<EditableTextView
							onChange={e => {
								let s = Object.assign({}, this.state)
								s.receipt.name = e.target.value
								this.setState(s)
							}}
							label="영수증 이름"
							editMode={this.state.editMode}
							text={this.state.receipt.name}
							style={{ width: '200px' }}
						/>
					</div>
					<div className="content">
						<Tabs activeTab={this.state.tab} onChange={tab => this.setState({ tab })} ripple>
							<Tab>영수증</Tab>
							<Tab>결제</Tab>
						</Tabs>
						<section>{this.state.tab === 0 ? tab1 : tab2}</section>
					</div>

					{this.state.editMode ? (
						<div className="action">
							{this.info.receiptId !== 'new'
								? [
										<Button type="button" id="delete" key="button">
											삭제
										</Button>,
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
							<Button
								type="button"
								onClick={() => {
									this.updateToFB(this.state.receipt)
								}}>
								저장
							</Button>
							<Button
								type="button"
								onClick={() => {
									this.close()
								}}>
								취소
							</Button>
						</div>
					) : (
						<div className="action">
							<Button
								type="button"
								onClick={() => {
									this.close()
								}}>
								확인
							</Button>
						</div>
					)}
				</Card>
			</div>
		)
	}
}

export default App
