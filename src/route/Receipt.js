import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useHistory } from 'react-router-dom'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import queryString from 'query-string'
import { OverlayTrigger, Popover, Card, ListGroup, Spinner } from 'react-bootstrap'
import { firestore } from '../firebase'
import { Button, Tabs, Tab, IconButton, Menu, MenuItem, Checkbox, Icon } from 'react-mdl'
import NumberFormat from 'react-number-format'
import './Receipt.scss'
import EditableTextView from '../components/EditableTextView'

const fs = firestore()

export default function (props) {
	const params = useParams()
	const queries = queryString.parse(useLocation().search)
	const history = useHistory()
	const editMode = queries.edit === 'true'

	const [tab, setTab] = useState(0)
	const [update, setUpdate] = useState(0)
	const [itemIndex, setItemIndex] = useState(-1)
	const [members, setMembers] = useState(null)
	const [receipt, setReceipt] = useState(null)
	const [errMsg, setErrMsg] = useState(null)

	useEffect(() => {
		fs.collection('DutchPay')
			.doc(params.groupId)
			.get()
			.then((doc) => {
				if (doc.exists) setMembers(doc.data().members)
			})

		if (params.receiptId !== 'new')
			fs.collection('DutchPay')
				.doc(params.groupId)
				.collection('Receipts')
				.doc(params.receiptId)
				.get()
				.then((doc) => {
					if (doc.exists) {
						setReceipt(doc.data())
					}
				})
		else {
			setReceipt({
				name: '',
				items: [],
				payers: {},
				timestamp: new Date(),
			})
		}
	}, [params.groupId, params.receiptId])

	function updateToFB(receipt) {
		if (params.receiptId !== 'new')
			fs.collection('DutchPay')
				.doc(params.groupId)
				.collection('Receipts')
				.doc(params.receiptId)
				.set(receipt)
				.then(() => {})
				.catch((e) => {
					setErrMsg('권한이 없습니다.')
					history.push({ pathname: history.location.pathname })
				})
		else
			fs.collection('DutchPay')
				.doc(params.groupId)
				.collection('Receipts')
				.add(receipt)
				.then(() => {
					close()
				})
				.catch((e) => {
					setErrMsg('권한이 없습니다.')
					history.push({ pathname: history.location.pathname })
				})
	}

	function deleteFromFB() {
		if (params.receiptId !== 'new')
			fs.collection('DutchPay')
				.doc(params.groupId)
				.collection('Receipts')
				.doc(params.receiptId)
				.delete()
				.then(() => {
					close()
				})
				.catch((e) => {
					setErrMsg('권한이 없습니다.')
					history.push({ pathname: history.location.pathname })
				})
	}

	function close() {
		history.push({ pathname: `/${params.groupId}`, search: editMode ? '?edit=true' : '' })
	}

	if (!receipt || !members)
		return (
			<div className="popup">
				<div>
					<Spinner animation="border" />
				</div>
			</div>
		)

	const memberPopup = (
		<Popover id="popover-basic">
			<Popover.Content>
				<ListGroup variant="flush">
					{Object.entries(members).map((data) => {
						let id = data[0]
						let name = data[1]

						let buyers = receipt.items[itemIndex]?.buyers || []
						let checked = buyers.includes(id)
						return (
							<ListGroup.Item key={id}>
								<Checkbox
									checked={checked}
									label={name}
									onChange={(e) => {
										if (editMode) {
											if (e.target.checked) buyers.push(id)
											else buyers.splice(buyers.indexOf(id), 1)
										}
										setUpdate(update + 1)
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
	for (let i in receipt.items) {
		let item = receipt.items[i]
		totalPrice += parseInt(item.price) || 0
	}

	const tab1 = (
		<table className="receipt-table">
			<thead>
				<tr>
					<th>상품명</th>
					<th>가격</th>
					<th>인원</th>
					{editMode ? <th></th> : null}
				</tr>
			</thead>
			<tbody>
				{receipt.items.map((item, i) => {
					return (
						<tr key={'item-' + i}>
							<td>
								<EditableTextView
									className="item-name"
									onChange={(e) => {
										let _receipt = { ...receipt }
										_receipt.items[i].name = e.target.value
										setReceipt(_receipt)
									}}
									label="상품명"
									text={item.name}
									editMode={editMode}
								/>
							</td>
							<td>
								<EditableTextView
									className="item-price"
									onChange={(e) => {
										let _receipt = { ...receipt }
										_receipt.items[i].price = parseInt(e.target.value.replace(/[^\d]/g, ''))
										setReceipt(_receipt)
									}}
									label="가격"
									text={item.price}
									editMode={editMode}
									type="number"
								/>
							</td>
							<td>
								<OverlayTrigger rootClose trigger="click" placement="right" overlay={memberPopup}>
									<label
										style={{ margin: 0 }}
										onClick={() => {
											setItemIndex(i)
										}}>
										<Icon name="person" />
										{receipt.items[i].buyers.length}
									</label>
								</OverlayTrigger>
							</td>

							{editMode ? (
								<td>
									<IconButton name="delete" id={'item-delete-' + i} />
									<Menu target={'item-delete-' + i}>
										<MenuItem
											onClick={() => {
												let _receipt = { ...receipt }
												_receipt.items.splice(i) //todo
												setReceipt(_receipt)
											}}>
											삭제
										</MenuItem>
									</Menu>
								</td>
							) : null}
						</tr>
					)
				})}
				{editMode ? (
					<tr>
						<td colSpan="4">
							<Button
								onClick={() => {
									let buyers = Object.keys(members)
									let _receipt = { ...receipt }
									receipt.items.push({
										name: '',
										buyers,
										price: 0,
									})
									setReceipt(_receipt)
								}}>
								<Icon name="add_circle_outline" style={{ fontSize: '1.3rem' }} />
								추가
							</Button>
						</td>
					</tr>
				) : null}
			</tbody>
			<tfoot>
				<tr>
					<th>총</th>
					<td></td>
					<td>
						<NumberFormat value={totalPrice} displayType={'text'} thousandSeparator={true} />
					</td>
				</tr>
			</tfoot>
		</table>
	)

	const payerPopup = (
		<Popover id="popover-basic">
			<Popover.Content>
				<ListGroup variant="flush">
					{Object.entries(members).map((data) => {
						let id = data[0]
						let name = data[1]

						return receipt.payers[id] === undefined ? (
							<ListGroup.Item
								key={id}
								action
								onClick={() => {
									let _receipt = { ...receipt }
									_receipt.payers[id] = 0
									setReceipt(_receipt)
								}}>
								{name}
							</ListGroup.Item>
						) : null
					})}
				</ListGroup>
			</Popover.Content>
		</Popover>
	)

	let totalPaied = 0
	for (let i in receipt.payers) {
		let item = receipt.payers[i]
		totalPaied += parseInt(item) || 0
	}

	const tab2 = (
		<table className="payer-table">
			<thead>
				<tr>
					<th>결제자</th>
					<th>가격</th>
					{editMode ? <th></th> : null}
				</tr>
			</thead>
			<tbody>
				{Object.entries(receipt.payers).map((data, i) => {
					let id = data[0]
					let price = data[1]

					return (
						<tr key={'payer-' + i}>
							<td>{members[id]}</td>
							<td>
								<EditableTextView
									onChange={(e) => {
										let _receipt = { ...receipt }
										_receipt.payers[id] = parseInt(e.target.value.replace(/[^\d]/g, ''))
										setReceipt(_receipt)
									}}
									label="가격"
									text={price}
									editMode={editMode}
									type="number"
									id={`pay-price-${i}`}
								/>
							</td>

							{editMode ? (
								<td>
									<IconButton name="delete" id={'delete-' + i} />
									<Menu target={'delete-' + i}>
										<MenuItem
											onClick={() => {
												let _receipt = { ...receipt }
												delete _receipt.payers[id]
												setReceipt(_receipt)
											}}>
											삭제
										</MenuItem>
									</Menu>
								</td>
							) : null}
						</tr>
					)
				})}
				{editMode ? (
					<tr>
						<td colSpan="3">
							<OverlayTrigger rootClose trigger="click" placement="right" overlay={payerPopup}>
								<label style={{ margin: 0 }}>
									<Button ripple>
										<Icon name="add_circle_outline" style={{ fontSize: '1.3rem' }} />
										추가
									</Button>
								</label>
							</OverlayTrigger>
						</td>
					</tr>
				) : null}
			</tbody>
			<tfoot>
				<tr>
					<th>총</th>
					<td>
						<NumberFormat value={totalPaied} displayType={'text'} thousandSeparator={true} />
					</td>
				</tr>
			</tfoot>
		</table>
	)

	return (
		<div className="Receipt popup">
			<Snackbar
				open={errMsg != null && !errMsg.includes('CLOSE')}
				autoHideDuration={5000}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				onClose={() => {
					setErrMsg(errMsg + 'CLOSE')
				}}>
				<Alert elevation={6} variant="filled" severity="error">
					{errMsg?.replace('CLOSE', '')}
				</Alert>
			</Snackbar>
			<div>
				<Card className="card">
					<Card.Body>
						<Card.Title>
							<div className="title">
								<EditableTextView
									onChange={(e) => {
										let _receipt = { ...receipt }
										_receipt.name = e.target.value
										setReceipt(_receipt)
									}}
									label="영수증 이름"
									editMode={editMode}
									text={receipt.name}
									style={{ width: '200px' }}
								/>
							</div>
						</Card.Title>
						<div>
							<Tabs activeTab={tab} onChange={(tab) => setTab(tab)} ripple>
								<Tab>영수증</Tab>
								<Tab>결제</Tab>
							</Tabs>
							<section className="tab-page">{tab === 0 ? tab1 : tab2}</section>
						</div>

						<div className="action">
							<div>
								{editMode && params.receiptId !== 'new'
									? [
											<IconButton id="delete" key="button" name="delete">
												삭제
											</IconButton>,
											<Menu target="delete" key="menu">
												<MenuItem
													onClick={() => {
														deleteFromFB()
													}}>
													삭제
												</MenuItem>
											</Menu>,
									  ]
									: null}
							</div>
							<div></div>
							<div>
								<Button
									onClick={() => {
										close()
									}}>
									{editMode ? '취소' : '확인'}
								</Button>
								{editMode ? (
									<Button
										onClick={() => {
											updateToFB(receipt)
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
