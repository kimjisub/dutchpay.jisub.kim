import React, { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Add, Check, Close, Delete, Edit, Person, Save } from '@mui/icons-material'
import { Alert, Badge, Checkbox, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Popover, Snackbar } from '@mui/material'

import './ReceiptPage.scss'

import * as db from '../db/firestore'
import EditableDateView from '../elements/EditableDateView'
import EditableNumberView from '../elements/EditableNumberView'
import EditableTextView from '../elements/EditableTextView'
import { useGetSetterState } from '../hooks/useGetSetterState'
import { MembersType } from '../models/Group'
import { Receipt } from '../models/Receipt'
import { sortObject } from '../utils'

export type ReceiptProps = {}

const ReceiptPage: FC<ReceiptProps> = () => {
	const params = useParams()
	const navigate = useNavigate()

	// Status
	const [editMode, setEditMode] = useState<boolean>(params.receiptId === 'new')
	const [havePermission, setHavePermission] = useState<boolean>(false)

	// UI
	const [errMsg, setErrMsg] = useState<string | null>(null)
	const [memberPopoverAction, setMemberPopoverAction] = useState<{ anchorEl: Element; index: number } | null>(null)
	const [payerPopoverAction, setPayerPopoverAction] = useState<{ anchorEl: Element } | null>(null)
	const [deleteConfirmAction, setDeleteConfirmAction] = useState<{ anchorEl: Element; deleteAction: () => void } | null>(null)

	// Data
	const [members, setMembers] = useState<MembersType>({})
	const [receiptRaw, receipt, setReceipt] = useGetSetterState<Receipt | null>(
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

			return { ..._receipt, items: receiptItems }
		},
		(_receipt) => {
			if (!_receipt) return null
			const r = { ..._receipt }
			r.items = r.items.filter((item) => item.name !== '' || item.price !== 0 || item.buyers.length !== Object.keys(members).length)

			return r
		}
	)

	useEffect(() => {
		if (!params.groupId || !params.receiptId) return
		// 멤버 정보 가져오기
		db.getGroup(params.groupId)
			.then((group) => {
				setMembers(group.members)
			})
			.catch((err) => {
				setErrMsg(err)
			})

		// 영수증 정보 가져오기
		if (params.receiptId !== 'new') {
			db.getReceipt(params.groupId, params.receiptId)
				.then((r) => setReceipt(() => r))
				.catch((err) => {
					setErrMsg(err)
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
		if (!params.groupId) return
		db.checkPermission(params.groupId).then(setHavePermission)
	}, [params.groupId])

	function updateToFB(r: Receipt) {
		if (!params.groupId || !params.receiptId) return
		const action = params.receiptId !== 'new' ? db.setReceipt(params.groupId, params.receiptId, r) : db.addReceipt(params.groupId, r)
		action
			.then(() => {
				close()
			})
			.catch((e) => {
				setErrMsg(e)
			})
	}

	function deleteFromFB() {
		if (!params.groupId || !params.receiptId) return

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

	if (!receipt || !members || !params.groupId || !params.receiptId) return <div className="popup"></div>

	let totalPrice = 0
	for (let i in receipt.items) {
		let item = receipt.items[i]
		totalPrice += item.price
	}

	let totalPaid = 0
	for (let i in receipt.payers) {
		let item = receipt.payers[i]
		totalPaid += item
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

						let buyers = receipt.items[memberPopoverAction?.index ?? 0]?.buyers || []
						let checked = buyers.includes(id)
						return (
							<ListItem
								key={id}
								role={undefined}
								dense
								button
								onClick={(e) => {
									if (editMode) {
										setReceipt((r) => {
											if (!r) return null
											const _receipt = { ...r }
											let _buyers = _receipt.items[memberPopoverAction?.index ?? 0]?.buyers || []
											let _checked = _buyers.includes(id)

											if (!_checked) _buyers.push(id)
											else _buyers.splice(_buyers.indexOf(id), 1)
											return _receipt
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

						return (
							<ListItem
								key={id}
								button
								onClick={() => {
									setReceipt((r) => {
										if (!r) return null
										const _receipt = { ...r }
										_receipt.payers[id] = (_receipt.payers[id] ?? 0) + unpaid
										return _receipt
									})
									setPayerPopoverAction(null)
								}}>
								{name}
							</ListItem>
						)
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
						deleteConfirmAction?.deleteAction()
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
									if (!_receipt) return null
									const r = { ..._receipt }
									r.name = text
									return r
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
							setReceipt((r) => {
								if (!r) return null
								return { ...r, timestamp: date }
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
														if (!_receipt) return null
														const r = { ..._receipt }
														r.items[i].name = text
														return r
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
														if (!_receipt) return null
														const r = { ..._receipt }
														r.items[i].price = value
														return r
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
																		if (!_receipt) return null
																		const r = { ..._receipt }
																		r.items.splice(i, 1)
																		return r
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
														if (!_receipt) return null
														const r = { ..._receipt }
														r.payers[id] = value
														return r
													})
												}}
												label="금액"
												value={price}
												editMode={editMode}
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
																	if (!_receipt) return null
																	const r = { ..._receipt }
																	delete r.payers[id]
																	return r
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

					{havePermission && !editMode ? (
						<IconButton
							className="addButton"
							onClick={() => {
								if (havePermission) setEditMode(true)
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
								if (receiptRaw) updateToFB(receiptRaw)
							}}>
							<Save />
						</IconButton>
					) : null}
				</div>
			</div>
		</div>
	)
}
export default ReceiptPage
