import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useNavigateSearch } from '../hooks/useNavigationSearch'
import { useGetSetterState } from '../hooks/useGetSetterState'
import { format } from 'date-fns'
import './Receipt.scss'

// Backend
import { firestore } from '../firebase'
import { sortObject } from '../algorithm'
import { fbLog } from '../logger'

// Components
import NumberFormat from 'react-number-format'

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
	Menu,
	MenuItem,
	Button,
	IconButton,
} from '@material-ui/core'

// Custom Components
import EditableTextView from '../elements/EditableTextView'
import EditableNumberView from '../elements/EditableNumberView'

const fs = firestore()

export default function Receipt(props) {
	const params = useParams()
	const navigateSearch = useNavigateSearch()
	const [searchParams, setSearchParams] = useSearchParams()
	const editMode = searchParams.get('edit') === 'true'

	const [members, setMembers] = useState(null)
	const [receiptRaw, receipt, setReceipt] = useGetSetterState(
		null,
		(_receipt) => {
			if (_receipt == null) return null
			const receiptItems = [
				..._receipt.items,
				{
					name: '',
					buyers: members ? Object.keys(members) : [],
					price: 0,
				},
			]

			const receipt = { ..._receipt, items: receiptItems }
			return receipt
		},
		(_receipt) => {
			const receipt = { ..._receipt }
			receipt.items = receipt.items.filter((item) => item.name !== '' || item.price !== 0)

			return receipt
		}
	)
	const [errMsg, setErrMsg] = useState(null)

	const [memberPopoverAction, setMemberPopoverAction] = useState(null)
	const [payerPopoverAction, setPayerPopoverAction] = useState(null)
	const [deleteConfirmAction, setDeleteConfirmAction] = useState(null)

	const loaded = receipt != null && members != null

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
						setReceipt(() => {
							return { ...data, timestamp: data.timestamp.toDate() }
						})
					}
				})
		} else {
			setReceipt(() => {
				return {
					name: '',
					items: [],
					payers: {},
					timestamp: new Date(),
				}
			})
		}
	}, [params.groupId, params.receiptId])

	function updateToFB(receiptRaw) {
		if (params.receiptId !== 'new')
			fs.collection('DutchPay')
				.doc(params.groupId)
				.collection('Receipts')
				.doc(params.receiptId)
				.set(receiptRaw)
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
				.add(receiptRaw)
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

	if (!loaded)
		return (
			<div className="popup">
				<div>
					<CircularProgress color="inherit" />
				</div>
			</div>
		)

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

	let totalPaid = 0
	for (let i in receipt.payers) {
		let item = receipt.payers[i]
		totalPaid += parseInt(item) || 0
	}
	const unpaid = totalPrice - totalPaid

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
										setReceipt((_receipt) => {
											const receipt = { ..._receipt }
											let buyers = receipt.items[memberPopoverAction?.index]?.buyers || []
											let checked = buyers.includes(id)

											if (!checked) buyers.push(id)
											else buyers.splice(buyers.indexOf(id), 1)
											return receipt
										})
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
									setReceipt((_receipt) => {
										const receipt = { ..._receipt }
										receipt.payers[id] = unpaid
										return receipt
									})
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
				<div className="top">
					<EditableTextView
						className="title"
						onChange={(e) => {
							setReceipt((_receipt) => {
								const receipt = { ..._receipt }
								receipt.name = e.target.value
								return receipt
							})
						}}
						label="영수증 이름"
						editMode={editMode}
						text={receipt.name}
					/>
					<TextField
						className="date"
						type="datetime-local"
						value={format(receipt.timestamp, "yyyy-MM-dd'T'HH:mm")}
						disabled={!editMode}
						onChange={(e) => {
							setReceipt((receipt) => {
								return { ...receipt, timestamp: new Date(e.target.value) }
							})
						}}
					/>
				</div>
				<div className="content">
					<table className="receipt-table" size="small">
						<thead>
							<tr>
								<td>상품명</td>
								<td align="right">인원</td>
								<td align="right">가격</td>
								{editMode ? <td></td> : null}
							</tr>
						</thead>
						<tbody>
							{receipt.items.map((item, i) => {
								return (
									<tr key={'item-' + i}>
										<td>
											<EditableTextView
												onChange={(e) => {
													setReceipt((_receipt) => {
														const receipt = { ..._receipt }
														receipt.items[i].name = e.target.value
														return receipt
													})
												}}
												label="상품명"
												text={item.name}
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
										<td align="right">
											<EditableNumberView
												className="item-price"
												onValueChange={(value) => {
													setReceipt((_receipt) => {
														const receipt = { ..._receipt }
														receipt.items[i].price = value
														return receipt
													})
												}}
												label="가격"
												value={item.price}
												editMode={editMode}
											/>
										</td>

										{editMode ? (
											<td>
												{receipt.items.length - 1 > i ? (
													<IconButton
														id={'item-delete-' + i}
														onClick={(event) => {
															setDeleteConfirmAction({
																anchorEl: event.currentTarget,
																deleteAction: () => {
																	setReceipt((_receipt) => {
																		const receipt = { ..._receipt }
																		receipt.items.splice(i, 1)
																		return receipt
																	})
																},
															})
														}}>
														<Delete fontSize="small" />
													</IconButton>
												) : null}
											</td>
										) : null}
									</tr>
								)
							})}
							{Object.entries(receipt.payers).map((data, i) => {
								let id = data[0]
								let price = data[1]

								return (
									<tr key={'payer-' + i} className="green">
										<td>결제</td>
										<td>{members[id]}</td>
										<td align="right">
											<EditableNumberView
												onValueChange={(value) => {
													setReceipt((_receipt) => {
														const receipt = { ..._receipt }
														receipt.payers[id] = value
														return receipt
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
																setReceipt((_receipt) => {
																	const receipt = { ..._receipt }
																	delete receipt.payers[id]
																	return receipt
																})
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
							{unpaid > 0 ? (
								<tr className="red">
									<td>미결제</td>
									<td> </td>
									<td align="right">
										<EditableNumberView label="가격" value={unpaid} editMode={false} />
									</td>
									<td>
										<IconButton
											onClick={(event) => {
												setPayerPopoverAction({
													anchorEl: event.currentTarget,
												})
											}}>
											<Add fontSize="small" />
										</IconButton>
									</td>
								</tr>
							) : null}
							{unpaid < 0 ? (
								<tr className="red">
									<td>초과 결제</td>
									<td> </td>
									<td align="right">
										<EditableNumberView label="가격" value={unpaid} editMode={false} />
									</td>
									<td></td>
								</tr>
							) : null}
						</tbody>
						<tfoot>
							<tr>
								<td>합계</td>
								<td></td>
								<td align="right">
									<NumberFormat value={totalPrice} displayType={'text'} thousandSeparator={true} />
								</td>
							</tr>
						</tfoot>
					</table>
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

					{editMode ? (
						<Button
							onClick={() => {
								updateToFB(receiptRaw)
							}}>
							저장
						</Button>
					) : null}
				</div>
			</div>
		</div>
	)
}
