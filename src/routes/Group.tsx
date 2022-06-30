import React, { FC, useState, useEffect, useReducer } from 'react'
import { useParams, Outlet, useNavigate } from 'react-router-dom'
import './Group.scss'

// Backend
import * as db from '../db/firestore'
import { calcExpenditure, calcSettlement } from '../algorithm'

// Components
import { Add, Edit, Delete, Save } from '@mui/icons-material'
import { Snackbar, IconButton, Menu, MenuItem, Alert } from '@mui/material'

// Custom Components
import ExpenditureCard from '../components/ExpenditureCard'
import SettlementCard from '../components/SettlementCard'
import ReceiptCard from '../components/ReceiptCard'
import EditableTextView from '../elements/EditableTextView'
import EditableDateView from '../elements/EditableDateView'
import { ReceiptType } from '../types/ReceiptType'
import { GroupType } from '../types/GroupType'

export type GroupProps = {}

const Group: FC<GroupProps> = () => {
	const params = useParams()
	const navigate = useNavigate()

	const [groupName, setGroupName] = useState<string>('')
	const [errMsg, setErrMsg] = useState<string | null>(null)
	const [expanded, setExpanded] = useState<string | null>(null)

	const [deleteConfirmAction, setDeleteConfirmAction] = useState<{ anchorEl: Element; deleteAction: () => void } | null>(null)

	const [editMode, setEditMode] = useState<boolean>(false)
	const [havePermmision, setHavePermmision] = useState(false)

	// const [group, groupDispatch] = useReducer((_state, action: {type:string; data:GroupType}) => {
	// 	if (!params.groupId) return null
	// 	const { type, data } = action
	// 	switch (type) {
	// 		case 'fromFirebase':
	// 			setGroupName(data.name)
	// 			break
	// 		case 'saveFirebase':
	// 			if (data) {
	// 				db.setGroup(params.groupId, data)
	// 					.then(() => {})
	// 					.catch((err) => setErrMsg(err))
	// 			} else setErrMsg('데이터를 불러온 후에 시도해주세요.')
	// 			break
	// 		case 'saveFirebaseAndDone':
	// 			if (data) {
	// 				db.setGroup(params.groupId, data)
	// 					.then(() => {
	// 						editModeDispatch({ type: 'doneEditMode' })
	// 					})
	// 					.catch((err) => {
	// 						setErrMsg(err)
	// 						editModeDispatch({ type: 'editModeDenied' })
	// 					})
	// 			} else setErrMsg('데이터를 불러온 후에 시도해주세요.')
	// 			break
	// 		default:
	// 	}
	// 	return data
	// }, null)

	const [group, setGroup] = useState<GroupType | null>()
	const [receipts, setReceipts] = useState<{ [name in string]: ReceiptType }>({})

	// const [editMode, editModeDispatch] = useReducer((state, action) => {
	// 	if (!params.groupId) return null

	// 	let { type } = action
	// 	let editMode = state
	// 	switch (type) {
	// 		// 수정모드로 진입하려고 함.
	// 		case 'requestEditMode':
	// 			db.checkPermission(params.groupId).then((havePermmision) => {
	// 				if (havePermmision) editModeDispatch({ type: 'editModeApproved' })
	// 				else editModeDispatch({ type: 'editModeDenied' })
	// 			})
	// 			break
	// 		case 'doneEditMode':
	// 			editMode = false
	// 			break
	// 		// 수정모드 승인
	// 		case 'editModeApproved':
	// 			editMode = true
	// 			break
	// 		// 수정모드 거부
	// 		case 'editModeDenied':
	// 			editMode = false
	// 			setErrMsg('권한이 없습니다.')
	// 			break
	// 		default:
	// 	}
	// 	return editMode
	// }, false)

	// Subscribe Firestore
	useEffect(() => {
		if (!params.groupId) return
		const unsubscribeGroup = db.subscribeGroup(params.groupId, (group) => {
			setGroup(group)
			setGroupName(group.name)
		})

		const unsubscribeReceipts = db.subscribeReceipts(params.groupId, (receipts) => {
			setReceipts(receipts)
		})

		db.checkPermission(params.groupId).then((havePermmision) => {
			setHavePermmision(havePermmision)
		})

		return () => {
			unsubscribeGroup()
			unsubscribeReceipts()
		}
	}, [params.groupId])

	if (!params.groupId || !group) return <div className="popup"></div>
	const groupId = params.groupId

	function requestEditMode() {
		db.checkPermission(groupId).then((havePermmision) => {
			if (havePermmision) setEditMode(true)
			else setErrMsg('권한이 없습니다.')
		})
	}
	function saveToFB(group: GroupType) {
		db.setGroup(groupId, group)
			.then(() => {})
			.catch((err) => setErrMsg(err))
	}

	function deleteFromFB() {
		if (!params.groupId) return
		db.deleteGroup(params.groupId)
			.then(() => {
				navigate('../')
			})
			.catch((err) => setErrMsg(err))
	}

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
						deleteConfirmAction?.deleteAction()
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
								onChange={(text) => {
									setGroupName(text)
								}}
								onBlur={(text) => {
									saveToFB({ ...group, name: groupName })
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
										if (editMode) setEditMode(false)
										else requestEditMode()
									}}>
									{editMode ? <Save /> : <Edit />}
								</IconButton>
							) : null}
						</div>

						<EditableDateView
							className="date"
							date={group.timestamp}
							editMode={editMode}
							formatPattern="yyyy-MM-dd"
							onValueChange={(date) => {
								saveToFB({ ...group, timestamp: date })
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
										saveToFB(_group)
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
								<div className="addButton">
									<IconButton
										onClick={() => {
											navigate('./receipts/new')
										}}>
										<Add />
									</IconButton>
								</div>
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

export default Group
