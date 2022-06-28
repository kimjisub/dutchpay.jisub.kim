import React, { useState, useEffect, useReducer } from 'react'
import { Link, useParams, Outlet, useNavigate } from 'react-router-dom'
import './Group.scss'

// Backend
import { firestore } from '../firebase'
import { calcExpenditure, calcSettlement, sortObject } from '../algorithm'
import { fbLog } from '../logger'

// Components
import { Add, Edit, Delete, Save } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { Snackbar, IconButton, Menu, MenuItem } from '@material-ui/core'

// Custom Components
import ExpenditureCard from '../components/ExpenditureCard'
import SettlementCard from '../components/SettlementCard'
import ReceiptCard from '../components/ReceiptCard'
import EditableTextView from '../elements/EditableTextView'
import EditableDateView from '../elements/EditableDateView'

const fs = firestore()

export default function Group(props) {
	const params = useParams()
	const navigate = useNavigate()

	const [groupName, setGroupName] = useState('')
	const [errMsg, setErrMsg] = useState(null)
	const [expanded, setExpanded] = useState(null)

	const [deleteConfirmAction, setDeleteConfirmAction] = useState(null)
	const [havePermmision, setHavePermmision] = useState(false)

	const [group, groupDispatch] = useReducer((state, action) => {
		const { type, data } = action
		switch (type) {
			case 'fromFirebase':
				setGroupName(data.name)
				break
			case 'saveFirebase':
				if (data) {
					fbLog(`Set /DutchPay/{${params.groupId}}`)
					fs.collection('DutchPay')
						.doc(params.groupId)
						.set(data)
						.then(() => {})
						.catch((err) => {
							setErrMsg('권한이 없습니다.')
						})
				} else setErrMsg('데이터를 불러온 후에 시도해주세요.')
				break
			case 'saveFirebaseAndDone':
				if (data) {
					fbLog(`Set /DutchPay/{${params.groupId}}`)
					fs.collection('DutchPay')
						.doc(params.groupId)
						.set(data)
						.then(() => {
							editModeDispatch({ type: 'doneEditMode' })
						})
						.catch((err) => {
							editModeDispatch({ type: 'editModeDenied' })
						})
				} else setErrMsg('데이터를 불러온 후에 시도해주세요.')
				break
			default:
		}
		return data
	}, null)

	const [receipts, receiptsDispatch] = useReducer((state, actions) => {
		let _state = { ...state }
		actions.forEach((action) => {
			const { type, id, data } = action
			switch (type) {
				case 'added':
					_state[id] = data
					break
				case 'modified':
					_state[id] = data
					break
				case 'removed':
					delete _state[id]
					break
				default:
			}
		})
		return sortObject(_state, (a, b) => {
			const Atarget = _state[a].timestamp
			const Btarget = _state[b].timestamp
			return Atarget < Btarget ? 1 : -1
		})
	}, {})

	const [editMode, editModeDispatch] = useReducer((state, action) => {
		let { type } = action
		let editMode = state
		switch (type) {
			// 수정모드로 진입하려고 함.
			case 'requestEditMode':
				fbLog(`Permission Test /DutchPay/{${params.groupId}}`)
				fs.collection('DutchPay')
					.doc(params.groupId)
					.update({})
					.then(() => {
						editModeDispatch({ type: 'editModeApproved' })
					})
					.catch((err) => {
						editModeDispatch({ type: 'editModeDenied' })
					})
				break
			case 'doneEditMode':
				editMode = false
				break
			// 수정모드 승인
			case 'editModeApproved':
				editMode = true
				break
			// 수정모드 거부
			case 'editModeDenied':
				editMode = false
				setErrMsg('권한이 없습니다.')
				break
			default:
		}
		return editMode
	}, false)

	// Subscribe Firestore
	useEffect(() => {
		fbLog(`Subscribe /DutchPay/{${params.groupId}}`)
		fbLog(`Subscribe /DutchPay/{${params.groupId}}/Receipts`)
		const unsubscribeGroup = fs
			.collection('DutchPay')
			.doc(params.groupId)
			.onSnapshot((doc) => {
				let data = (window.$data = doc.data())
				data.members = sortObject(data.members)
				data.timestamp = data.timestamp.toDate()

				groupDispatch({ type: 'fromFirebase', data })
			})
		const unsubscribeReceipts = fs
			.collection('DutchPay')
			.doc(params.groupId)
			.collection('Receipts')
			.onSnapshot((querySnapshot) => {
				let actions = []
				querySnapshot.docChanges().forEach((change) => {
					let id = change.doc.id
					let data = change.doc.data()

					actions.push({ type: change.type, id, data })
				})
				receiptsDispatch(actions)
			})

		return () => {
			fbLog(`Unsubscribe /DutchPay/{${params.groupId}}`)
			fbLog(`Unsubscribe /DutchPay/{${params.groupId}}/Receipts`)
			unsubscribeGroup()
			unsubscribeReceipts()
		}
	}, [params.groupId])

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

	function deleteFromFB() {
		fs.collection('DutchPay')
			.doc(params.groupId)
			.delete()
			.then(() => {
				navigate(-1)
			})
			.catch((e) => {
				setErrMsg('권한이 없습니다.')
			})
	}

	if (!group) return <div className="popup"></div>

	let receiptCards = []

	for (let key in receipts) {
		let receipt = receipts[key]
		receiptCards.push(
			<ReceiptCard
				key={key}
				receipt={receipt}
				members={group.members}
				expanded={expanded === key}
				onExpanded={() => {
					setExpanded(expanded !== key ? key : null)
				}}
				onClick={() => {
					navigate(`./receipts/${key}`)
				}}
				editMode={editMode}
			/>
		)
	}

	let expenditure = calcExpenditure(group.members, receipts)

	let settlement = calcSettlement(expenditure)

	return (
		<div className="Group">
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
			<div className="area">
				<section>
					<div className="top">
						<div className="row">
							<EditableTextView
								className="group-title"
								label="모임 이름"
								text={groupName}
								editMode={editMode}
								onChange={(e) => {
									setGroupName(e.target.value)
								}}
								onBlur={(e) => {
									groupDispatch({ type: 'saveFirebase', data: { ...group, name: groupName } })
								}}
							/>
							{editMode ? (
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
							{havePermmision ? (
								<IconButton
									onClick={() => {
										if (editMode) editModeDispatch({ type: 'doneEditMode' })
										else editModeDispatch({ type: 'requestEditMode' })
									}}>
									{editMode ? <Save /> : <Edit />}
								</IconButton>
							) : null}
						</div>

						<EditableDateView
							className="date"
							date={group.timestamp}
							editMode={editMode}
							format="yyyy-MM-dd"
							onValueChange={(date) => {
								groupDispatch({ type: 'saveFirebase', data: { ...group, timestamp: date } })
							}}
						/>
					</div>
					<div className="content">
						<div className="dashboard-wrapper">
							<div className="dashboard">
								<ExpenditureCard
									expenditure={expenditure}
									members={group.members}
									onMembersChange={(members) => {
										let _group = { ...group }
										_group.members = members
										groupDispatch({ type: 'saveFirebase', data: _group })
									}}
									onMemberClick={(id) => {
										navigate(`./members/${id}`)
									}}
									editMode={editMode}
								/>
								<SettlementCard members={group.members} settlement={settlement} />
							</div>
						</div>
						<div id="receipts">
							{havePermmision ? (
								<IconButton
									className="addButton"
									onClick={() => {
										navigate('./receipts/new')
									}}>
									<Add />
								</IconButton>
							) : null}
							<div>{receiptCards}</div>
						</div>
					</div>
				</section>
			</div>
			<Outlet />
		</div>
	)
}
