import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetSetterState } from '../hooks/useGetSetterState'
import './Receipt.scss'

// Backend
import { sortObject } from '../algorithm'
import * as db from '../db/firestore'

// Components
import { Person, Delete, Add, Edit, Close, Check, Save } from '@mui/icons-material'
import { Alert, Badge, Snackbar, Popover, ListItemIcon, ListItemText, Checkbox, List, ListItem, Menu, MenuItem, IconButton } from '@mui/material'

// Custom Components
import EditableTextView from '../elements/EditableTextView'
import EditableNumberView from '../elements/EditableNumberView'
import EditableDateView from '../elements/EditableDateView'

export default function Receipt(props) {
	const params = useParams()
	const navigate = useNavigate()

	// Status
	const [editMode, setEditMode] = useState(params.receiptId === 'new')
	const [havePermmision, setHavePermmision] = useState(false)

	// UI
	const [errMsg, setErrMsg] = useState(null)
	const [memberPopoverAction, setMemberPopoverAction] = useState(null)
	const [payerPopoverAction, setPayerPopoverAction] = useState(null)
	const [deleteConfirmAction, setDeleteConfirmAction] = useState(null)

	// Data
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

	useEffect(() => {
		// 멤버 정보 가져오기
		db.getGroup(params.groupId)
			.then((group) => {
				setMembers(group.members)
			})
			.catch((err) => {
				errMsg(err)
			})

		// 영수증 정보 가져오기
		if (params.receiptId !== 'new') {
			db.getReceipt(params.groupId, params.receiptId)
				.then((receipt) => {
					setReceipt(() => receipt)
				})
				.catch((err) => {
					errMsg(err)
				})
		} else {
			// 새로 만드는 경우 초기값 설정
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
		db.checkPermission(params.groupId).then((havePermmision) => {
			setHavePermmision(havePermmision)
		})
	}, [params.groupId])

	function updateToFB(receipt) {
		const action = params.receiptId !== 'new' ? db.setReceipt(params.groupId, params.receiptId, receipt) : db.addReceipt(params.groupId, receipt)
		action
			.then(() => {
				close()
			})
			.catch((e) => {
				setErrMsg(e)
			})
	}

	function deleteFromFB() {
		if (params.receiptId !== 'new')
			db.deleteReceipt(params.groupId, params.receiptId)
				.then(() => {
					close()
				})
				.catch((e) => {
					setErrMsg(e)
				})
	}

	function close() {
		navigate('../')
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
							onChange={(text) => {
								setReceipt((_receipt) => {
									const receipt = { ..._receipt }
									receipt.name = text
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
						formatPattern="yyyy-MM-dd HH:mm"
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
												onChange={(text) => {
													setReceipt((_receipt) => {
														const receipt = { ..._receipt }
														receipt.items[i].name = text
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
													<Person fontSize="inherit" />
												</Badge>
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
														size="small"
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
														<Delete fontSize="inherit" />
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
													size="small"
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
													<Delete fontSize="inherit" />
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
												size="small"
												onClick={(event) => {
													setPayerPopoverAction({
														anchorEl: event.currentTarget,
													})
												}}>
												<Add fontSize="inherit" />
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
							name="delete"
							onClick={(event) => {
								setDeleteConfirmAction({
									anchorEl: event.currentTarget,
									deleteAction: () => {
										deleteFromFB()
									},
								})
							}}>
							<Delete fontSize="inherit" />
						</IconButton>
					) : null}

					{havePermmision && !editMode ? (
						<IconButton
							className="addButton"
							onClick={() => {
								if (havePermmision) setEditMode(true)
								else setErrMsg('수정 권한이 없습니다.')
							}}>
							<Edit fontSize="inherit" />
						</IconButton>
					) : null}
					<div className="space"></div>
					<IconButton
						onClick={() => {
							close()
						}}>
						{editMode ? <Close /> : <Check />}
					</IconButton>

					{editMode ? (
						<IconButton
							onClick={() => {
								updateToFB(receiptRaw)
							}}>
							<Save />
						</IconButton>
					) : null}
				</div>
			</div>
		</div>
	)
}
