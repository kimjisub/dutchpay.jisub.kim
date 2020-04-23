import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useHistory } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import { Snackbar, Popover, FormControlLabel, Checkbox, List, ListItem, CircularProgress, Tabs, Tab, Menu, MenuItem, Button, IconButton, Card, CardContent } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { Person, Delete, Add } from '@material-ui/icons';

import queryString from 'query-string'
import NumberFormat from 'react-number-format'

import { firestore } from '../firebase'
import './Receipt.scss'
import EditableTextView from '../components/EditableTextView'

const fs = firestore()

const AntTabs = withStyles({
	root: {
		borderBottom: '1px solid #e8e8e8',
	},
	indicator: {
		backgroundColor: '#1890ff',
	},
})(Tabs);

const AntTab = withStyles((theme) => ({
	root: {
		textTransform: 'none',
		minWidth: 72,
		fontWeight: theme.typography.fontWeightRegular,
		marginRight: theme.spacing(4),
		fontFamily: [
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(','),
		'&:hover': {
			color: '#40a9ff',
			opacity: 1,
		},
		'&$selected': {
			color: '#1890ff',
			fontWeight: theme.typography.fontWeightMedium,
		},
		'&:focus': {
			color: '#40a9ff',
		},
	},
	selected: {},
}))((props) => <Tab disableRipple {...props} />);

export default function (props) {
	const params = useParams()
	const queries = queryString.parse(useLocation().search)
	const history = useHistory()
	const editMode = queries.edit === 'true'

	const [tab, setTab] = useState(0)
	const [update, setUpdate] = useState(0)
	const [members, setMembers] = useState(null)
	const [receipt, setReceipt] = useState(null)
	const [errMsg, setErrMsg] = useState(null)

	const [memberPopoverAction, setMemberPopoverAction] = useState(null)
	const [payerPopoverAction, setPayerPopoverAction] = useState(null)
	const [deleteConfirmAction, setDeleteConfirmAction] = useState(null)

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
				.then(() => {
					close()
				})
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
					<CircularProgress color="inherit" />
				</div>
			</div>
		)

	let totalPrice = 0
	for (let i in receipt.items) {
		let item = receipt.items[i]
		totalPrice += item.price
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
										_receipt.items[i].price = parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0
										setReceipt(_receipt)
									}}
									label="가격"
									text={item.price}
									editMode={editMode}
									type="number"
								/>
							</td>
							<td>
								<IconButton
									onClick={event => {
										setMemberPopoverAction(
											{
												anchorEl: event.currentTarget,
												index: i
											}
										)
									}}>
									<Person />
									{receipt.items[i].buyers.length}
								</IconButton>
							</td>

							{editMode ? (
								<td>
									<IconButton name="delete" id={'item-delete-' + i} onClick={event => {
										setDeleteConfirmAction({
											anchorEl: event.currentTarget,
											deleteAction: () => {
												let _receipt = { ...receipt }
												_receipt.items.splice(i) //todo
												setReceipt(_receipt)
											},
										})
									}} ></IconButton>
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
								<Add />
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
										setReceipt(receipt => {
											let _receipt = { ...receipt }
											_receipt.payers[id] = parseInt(e.target.value.replace(/[^\d.]/g, ''))
											return _receipt
										})
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
									<IconButton name="delete" id={'delete-' + i} onClick={
										event => {
											setDeleteConfirmAction({
												anchorEl: event.currentTarget,
												deleteAction: () => {
													let _receipt = { ...receipt }
													delete _receipt.payers[id]
													setReceipt(_receipt)
												},
											})
										}

									} />
								</td>
							) : null}
						</tr>
					)
				})}
				{editMode ? (
					<tr>
						<td colSpan="3">
							<label style={{ margin: 0 }}
								onClick={event => {
									setPayerPopoverAction(
										{
											anchorEl: event.currentTarget
										}
									)
								}}>
								<IconButton>
									<Add />
								</IconButton>
							</label>
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
			<Popover id="popover-member"
				anchorEl={memberPopoverAction?.anchorEl}
				open={memberPopoverAction != null}
				onClose={() => {
					setMemberPopoverAction(null)
				}}>
				<List>
					{Object.entries(members).map((data) => {
						let id = data[0]
						let name = data[1]

						let buyers = receipt.items[memberPopoverAction?.index]?.buyers || []
						let checked = buyers.includes(id)
						return (
							<ListItem key={id} role={undefined} dense button>
								<FormControlLabel
									control={
										<Checkbox
											checked={checked}
											onChange={(e) => {
												if (editMode) {
													if (e.target.checked) buyers.push(id)
													else buyers.splice(buyers.indexOf(id), 1)
												}
												setUpdate(update + 1)
											}}
											color="primary"
										/>
									}
									label={name}
								/>
							</ListItem>
						)
					})}
				</List>
			</Popover>
			<Popover id="popover-payer"
				anchorEl={payerPopoverAction?.anchorEl}
				open={payerPopoverAction != null}
				onClose={() => {
					setPayerPopoverAction(null)
				}}>
				<List>
					{Object.entries(members).map((data) => {
						let id = data[0]
						let name = data[1]

						return receipt.payers[id] === undefined ? (
							<ListItem
								key={id}
								action
								onClick={() => {
									let _receipt = { ...receipt }
									_receipt.payers[id] = 0
									setReceipt(_receipt)
								}}>
								{name}
							</ListItem>
						) : null
					})}
				</List>
			</Popover>
			<Menu
				keepMounted
				anchorEl={deleteConfirmAction?.anchorEl}
				open={deleteConfirmAction != null}
				onClose={() => {
					setDeleteConfirmAction(null)
				}}>
				<MenuItem
					onClick={() => {
						deleteConfirmAction.deleteAction()
						setDeleteConfirmAction(null)
					}}>
					삭제
				</MenuItem>
			</Menu>
			<div>
				<Card className="card">
					<CardContent>
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
						<div>
							<AntTabs
								centered
								value={tab}
								indicatorColor="primary"
								textColor="primary"
								onChange={(event, newValue) => setTab(newValue)}>
								<AntTab label="영수증" />
								<AntTab label="결제" />
							</AntTabs>
							<section className="tab-page">{tab === 0 ? tab1 : tab2}</section>
						</div>

						<div className="action">
							<div>
								{editMode && params.receiptId !== 'new'
									?
									(<IconButton id="delete" key="button" name="delete" onClick={event => {
										setDeleteConfirmAction({
											anchorEl: event.currentTarget,
											deleteAction: () => {
												deleteFromFB()
											},
										})
									}}>
										<Delete />
									</IconButton>)
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
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
