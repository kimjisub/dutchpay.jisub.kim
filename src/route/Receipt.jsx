import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useNavigateSearch } from '../hooks/useNavigationSearch'
import { format } from 'date-fns'
import './Receipt.scss'

// Backend
import { firestore } from '../firebase'
import { sortObject } from '../algorithm'
import { fbLog } from '../logger'

// Components
import NumberFormat from 'react-number-format'
import { withStyles } from '@material-ui/core/styles'

import { TextField } from '@material-ui/core'
import { Person, Delete, Add } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import {
	Snackbar,
	Popover,
	ListItemIcon,
	ListItemText,
	Checkbox,
	List,
	ListItem,
	CircularProgress,
	Tabs,
	Tab,
	Menu,
	MenuItem,
	Button,
	IconButton,
} from '@material-ui/core'

// Custom Components
import EditableTextView from '../elements/EditableTextView'
import EditableNumberView from '../elements/EditableNumberView'

const fs = firestore()

const AntTabs = withStyles({
	root: {
		borderBottom: '1px solid #e8e8e8',
	},
	indicator: {
		backgroundColor: '#1890ff',
	},
})(Tabs)

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
}))((props) => <Tab disableRipple {...props} />)

export default function Receipt(props) {
	const params = useParams()
	const navigateSearch = useNavigateSearch()
	const [searchParams, setSearchParams] = useSearchParams()
	const editMode = searchParams.get('edit') === 'true'

	const [tab, setTab] = useState(0)
	const [members, setMembers] = useState(null)
	const [receipt, setReceipt] = useState(null)
	const [errMsg, setErrMsg] = useState(null)

	const [memberPopoverAction, setMemberPopoverAction] = useState(null)
	const [payerPopoverAction, setPayerPopoverAction] = useState(null)
	const [deleteConfirmAction, setDeleteConfirmAction] = useState(null)

	useEffect(() => {
		fbLog(`Get /DutchPay/{${params.groupId}}`)
		fs.collection('DutchPay')
			.doc(params.groupId)
			.get()
			.then((doc) => {
				if (doc.exists) setMembers(doc.data().members)
			})

		if (params.receiptId !== 'new') {
			fbLog(`Get /DutchPay/{${params.groupId}}/Receipt/{${params.receiptId}}`)
			fs.collection('DutchPay')
				.doc(params.groupId)
				.collection('Receipts')
				.doc(params.receiptId)
				.get()
				.then((doc) => {
					if (doc.exists) {
						const data = doc.data()
						setReceipt({ ...data, timestamp: data.timestamp.toDate() })
					}
				})
		} else {
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
					setSearchParams({ edit: false })
					// history.push({ pathname: history.location.pathname })
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
					setSearchParams({ edit: false })
					// history.push({ pathname: history.location.pathname })
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
					setSearchParams({ edit: false })
					// history.push({ pathname: history.location.pathname })
				})
	}

	function close() {
		navigateSearch('../', { edit: editMode ? true : undefined }) // history.push({ pathname: `/groups/${params.groupId}`, search: editMode ? '?edit=true' : '' })
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
		<table className="receipt-table" size="small">
			<thead>
				<tr>
					<td>상품명</td>
					<td align="right">가격</td>
					<td align="right">인원</td>
					{editMode ? <td>삭제</td> : null}
				</tr>
			</thead>
			<tbody>
				{receipt.items.map((item, i) => {
					return (
						<tr key={'item-' + i}>
							<td>
								<EditableTextView
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
							<td align="right">
								<EditableNumberView
									className="item-price"
									onValueChange={(value) => {
										setReceipt((receipt) => {
											let _receipt = { ...receipt }
											_receipt.items[i].price = value
											return _receipt
										})
									}}
									label="가격"
									value={item.price}
									editMode={editMode}
								/>
							</td>
							<td align="right">
								<IconButton
									id={'item-delete-' + i}
									className="person"
									onClick={(event) => {
										setMemberPopoverAction({
											anchorEl: event.currentTarget,
											index: i,
										})
									}}>
									<Person fontSize="small" />
									<span className="count">{receipt.items[i].buyers.length}</span>
								</IconButton>
							</td>

							{editMode ? (
								<td>
									<IconButton
										id={'item-delete-' + i}
										onClick={(event) => {
											setDeleteConfirmAction({
												anchorEl: event.currentTarget,
												deleteAction: () => {
													let _receipt = { ...receipt }
													_receipt.items.splice(i, 1)
													setReceipt(_receipt)
												},
											})
										}}>
										<Delete fontSize="small" />
									</IconButton>
								</td>
							) : null}
						</tr>
					)
				})}
			</tbody>
			<tfoot>
				{editMode ? (
					<tr>
						<td colSpan="4">
							<IconButton
								onClick={(event) => {
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
							</IconButton>
						</td>
					</tr>
				) : null}
				<tr>
					<td>총</td>
					<td align="right">
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
					<td>결제자</td>
					<td align="right">결제 금액</td>
					{editMode ? <td>삭제</td> : null}
				</tr>
			</thead>
			<tbody>
				{Object.entries(receipt.payers).map((data, i) => {
					let id = data[0]
					let price = data[1]

					return (
						<tr key={'payer-' + i}>
							<td>{members[id]}</td>
							<td align="right">
								<EditableNumberView
									onValueChange={(value) => {
										setReceipt((receipt) => {
											let _receipt = { ...receipt }
											_receipt.payers[id] = value
											return _receipt
										})
									}}
									label="가격"
									value={price}
									editMode={editMode}
									id={`pay-price-${i}`}
								/>
							</td>

							{editMode ? (
								<td>
									<IconButton
										id={'delete-' + i}
										onClick={(event) => {
											setDeleteConfirmAction({
												anchorEl: event.currentTarget,
												deleteAction: () => {
													let _receipt = { ...receipt }
													delete _receipt.payers[id]
													setReceipt(_receipt)
												},
											})
										}}>
										<Delete fontSize="small" />
									</IconButton>
								</td>
							) : null}
						</tr>
					)
				})}
			</tbody>
			<tfoot>
				{editMode ? (
					<tr>
						<td colSpan="3">
							<IconButton
								onClick={(event) => {
									setPayerPopoverAction({
										anchorEl: event.currentTarget,
									})
								}}>
								<Add />
							</IconButton>
						</td>
					</tr>
				) : null}
				<tr>
					<td>총</td>
					<td align="right">
						<NumberFormat value={totalPaied} displayType={'text'} thousandSeparator={true} />
					</td>
				</tr>
			</tfoot>
		</table>
	)

	let nextStep = null

	if (editMode) {
		if (tab === 0 && totalPaied === 0) {
			nextStep = (
				<Button
					onClick={() => {
						setTab(1)
					}}>
					다음
				</Button>
			)
		} else
			nextStep = (
				<Button
					onClick={() => {
						updateToFB(receipt)
					}}>
					저장
				</Button>
			)
	}

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
			<Popover
				id="popover-member"
				anchorEl={memberPopoverAction?.anchorEl}
				open={memberPopoverAction != null}
				onClose={() => {
					setMemberPopoverAction(null)
				}}>
				<List>
					{Object.entries(sortObject(members)).map((data) => {
						let id = data[0]
						let name = data[1]

						let buyers = receipt.items[memberPopoverAction?.index]?.buyers || []
						let checked = buyers.includes(id)
						return (
							<ListItem
								key={id}
								role={undefined}
								dense
								button
								onClick={(e) => {
									if (editMode) {
										let _receipt = { ...receipt }
										let buyers = _receipt.items[memberPopoverAction?.index]?.buyers || []
										let checked = buyers.includes(id)

										if (!checked) buyers.push(id)
										else buyers.splice(buyers.indexOf(id), 1)

										setReceipt(_receipt)
									}
								}}>
								<ListItemIcon>
									<Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple />
								</ListItemIcon>
								<ListItemText primary={name} />
							</ListItem>
						)
					})}
				</List>
			</Popover>
			<Popover
				id="popover-payer"
				anchorEl={payerPopoverAction?.anchorEl}
				open={payerPopoverAction != null}
				onClose={() => {
					setPayerPopoverAction(null)
				}}>
				<List>
					{Object.entries(sortObject(members)).map((data) => {
						let id = data[0]
						let name = data[1]

						return receipt.payers[id] === undefined ? (
							<ListItem
								key={id}
								button
								onClick={() => {
									let _receipt = { ...receipt }
									_receipt.payers[id] = Object.keys(receipt.payers).length === 0 ? totalPrice : 0
									setReceipt(_receipt)

									setPayerPopoverAction(null)
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
			<div className="card">
				<EditableTextView
					className="title"
					onChange={(e) => {
						let _receipt = { ...receipt }
						_receipt.name = e.target.value
						setReceipt(_receipt)
					}}
					label="영수증 이름"
					editMode={editMode}
					text={receipt.name}
				/>
				<TextField
					type="datetime-local"
					value={format(receipt.timestamp, "yyyy-MM-dd'T'HH:mm")}
					disabled={!editMode}
					onChange={(e) => {
						setReceipt((receipt) => {
							return { ...receipt, timestamp: new Date(e.target.value) }
						})
					}}
				/>
				<div className="content">
					<AntTabs centered value={tab} indicatorColor="primary" textColor="primary" onChange={(event, newValue) => setTab(newValue)}>
						<AntTab label="영수증" />
						<AntTab label="결제" />
					</AntTabs>
					<section className="tab-page">{tab === 0 ? tab1 : tab2}</section>
				</div>
				<div className="actions">
					{editMode && params.receiptId !== 'new' ? (
						<IconButton
							key="button"
							name="delete"
							onClick={(event) => {
								setDeleteConfirmAction({
									anchorEl: event.currentTarget,
									deleteAction: () => {
										deleteFromFB()
									},
								})
							}}>
							<Delete />
						</IconButton>
					) : null}
					<div className="space"></div>
					<Button
						onClick={() => {
							close()
						}}>
						{editMode ? '취소' : '확인'}
					</Button>
					{nextStep}
				</div>
			</div>
		</div>
	)
}
