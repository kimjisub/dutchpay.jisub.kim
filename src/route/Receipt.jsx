import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetSetterState } from '../hooks/useGetSetterState'
import './Receipt.scss'

// Backend
import { firestore } from '../firebase'
import { sortObject } from '../algorithm'
import { fbLog } from '../logger'

// Components
import { Person, Delete, Add, Edit } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { Badge, Snackbar, Popover, ListItemIcon, ListItemText, Checkbox, List, ListItem, Menu, MenuItem, Button, IconButton } from '@material-ui/core'
import EditableDateView from '../elements/EditableDateView'

// Custom Components
import EditableTextView from '../elements/EditableTextView'
import EditableNumberView from '../elements/EditableNumberView'

const fs = firestore()

export default function Receipt(props) {
	const params = useParams()
	const navigate = useNavigate()
	const [editMode, setEditMode] = useState(params.receiptId === 'new')
	const [havePermmision, setHavePermmision] = useState(false)

	const [members, setMembers] = useState(null)
	const [receiptRaw, receipt, setReceipt] = useGetSetterState(
		null,
		(_receipt) => {
			if (_receipt == null) return null
			const receiptItems = [..._receipt.items]

			if (editMode) {
				receiptItems.push({
					name: '',
					buyers: members ? Object.keys(members) : [],
					price: 0,
				})
			}

			const receipt = { ..._receipt, items: receiptItems }
			return receipt
		},
		(_receipt) => {
			const receipt = { ..._receipt }
			receipt.items = receipt.items.filter((item) => item.name !== '' || item.price !== 0 || item.buyers.length !== Object.keys(members).length)

			return receipt
		}
	)
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

	useEffect(() => {
		fbLog(`Permission Test /DutchPay/{${params.groupId}}`)
		fs.collection('DutchPay')
			.doc(params.groupId)
			.update({})
			.then(() => {
				setHavePermmision(true)
			})
			.catch((err) => {
				setHavePermmision(false)
			})
	}, [])

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
				})
	}

	function close() {
		navigate(-1)
	}

	if (!receipt || !members) return <div className="popup"></div>

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
					<p>
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
					</p>
					<EditableDateView
						className="date"
						date={receipt.timestamp}
						editMode={editMode}
						format="yyyy-MM-dd HH:mm"
						onValueChange={(date) => {
							setReceipt((receipt) => {
								return { ...receipt, timestamp: date }
							})
						}}
					/>
				</div>
				<div className="content">
					<table>
						<thead>
							<tr>
								<td>내용</td>
								<td>인원</td>
								<td>금액</td>
								{editMode ? <td></td> : null}
							</tr>
						</thead>
						<tbody>
							{receipt.items.map((item, i) => {
								const isLast = receipt.items.length - 1 <= i
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
												label="내용"
												text={item.name}
												editMode={editMode}
											/>
										</td>
										<td>
											<IconButton
												id={'item-delete-' + i}
												className="person"
												size="small"
												onClick={(event) => {
													setMemberPopoverAction({
														anchorEl: event.currentTarget,
														index: i,
													})
												}}>
												<Badge color="primary" badgeContent={receipt.items[i].buyers.length}>
													<Person />
												</Badge>
												{/* <span className="count">{receipt.items[i].buyers.length}</span> */}
											</IconButton>
										</td>
										<td>
											<EditableNumberView
												className="item-price"
												onValueChange={(value) => {
													setReceipt((_receipt) => {
														const receipt = { ..._receipt }
														receipt.items[i].price = value
														return receipt
													})
												}}
												label="금액"
												value={item.price}
												editMode={editMode}
											/>
										</td>

										{editMode ? (
											<td>
												{!isLast ? (
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
										<td>
											<EditableNumberView
												onValueChange={(value) => {
													setReceipt((_receipt) => {
														const receipt = { ..._receipt }
														receipt.payers[id] = value
														return receipt
													})
												}}
												label="금액"
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
									<td>
										<EditableNumberView label="금액" value={unpaid} editMode={false} />
									</td>
									{editMode ? (
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
									) : null}
								</tr>
							) : null}
							{unpaid < 0 ? (
								<tr className="red">
									<td>초과 결제</td>
									<td> </td>
									<td>
										<EditableNumberView label="금액" value={unpaid} editMode={false} />
									</td>

									{editMode ? <td></td> : null}
								</tr>
							) : null}
						</tbody>
						<tfoot>
							<tr>
								<td>합계</td>
								<td></td>
								<td>
									<EditableNumberView value={totalPrice} editMode={false} />
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

					{havePermmision && !editMode ? (
						<IconButton
							className="addButton"
							onClick={() => {
								if (havePermmision) setEditMode(true)
								else setErrMsg('수정 권한이 없습니다.')
							}}>
							<Edit />
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
