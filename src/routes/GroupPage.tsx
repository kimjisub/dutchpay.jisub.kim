import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
// Components
import { Add, Delete, Edit, Link, Save } from '@mui/icons-material'
import { Alert, IconButton, Menu, MenuItem, Snackbar } from '@mui/material'

import './GroupPage.scss'

import ReceiptCard from '../components/ReceiptCard'
// Custom Components
import ReceiptSummaryCard from '../components/ReceiptSummaryCard'
import TransferCard from '../components/TransferCard'
// Backend
import * as db from '../db/firestore'
import EditableDateView from '../elements/EditableDateView'
import EditableTextView from '../elements/EditableTextView'
import { Group } from '../models/Group'
import { Receipt } from '../models/Receipt'
import { Transfer } from '../models/Transfer'
import { calcDutchpay } from '../utils/algorithm/calcDutchpay'

export type GroupProps = {}
export type GroupPageParams = {
	groupId: string
}

const GroupPage: FC<GroupProps> = () => {
	const { groupId } = useParams<GroupPageParams>()
	const navigate = useNavigate()

	const [groupName, setGroupName] = useState<string>('')
	const [errMsg, setErrMsg] = useState<string | null>(null)
	const [alert, setAlert] = useState<string | null>(null)
	const [expanded, setExpanded] = useState<string | null>(null)

	const [deleteConfirmAction, setDeleteConfirmAction] = useState<{ anchorEl: Element; deleteAction: () => void } | null>(null)

	const [editMode, setEditMode] = useState<boolean>(false)
	const [havePermission, setHavePermission] = useState(false)

	const [group, setGroup] = useState<Group | null>()
	const [receipts, setReceipts] = useState<{ [name in string]: Receipt }>({})
	const [transfers, setTransfers] = useState<{ [name in string]: Transfer }>({})

	// Subscribe Firestore
	useEffect(() => {
		if (!groupId) return
		const unsubscribeGroup = db.subscribeGroup(groupId, (g) => {
			setGroup(g)
			setGroupName(g.name)
		})

		const unsubscribeReceipts = db.subscribeReceipts(groupId, setReceipts)

		const unsubscribeTransfer = db.subscribeTransfers(groupId, setTransfers)

		db.checkPermission(groupId).then(setHavePermission)

		return () => {
			unsubscribeGroup()
			unsubscribeReceipts()
			unsubscribeTransfer()
		}
	}, [groupId])

	const dutchpay = useMemo(
		() =>
			group &&
			calcDutchpay({
				members: group.members,
				receipts: receipts,
				transfers: transfers,
			}),
		[group, receipts, transfers]
	)

	const requestEditMode = useCallback(() => {
		if (!groupId) return setErrMsg('권한이 없습니다.')
		db.checkPermission(groupId).then((hp) => {
			if (hp) setEditMode(true)
			else setErrMsg('권한이 없습니다.')
		})
	}, [groupId])
	const saveToFB = useCallback(
		(g: Group) => {
			if (!groupId) return setErrMsg('권한이 없습니다.')
			db.setGroup(groupId, g)
				.then(() => {})
				.catch((err) => setErrMsg(err))
		},
		[groupId]
	)

	function deleteFromFB() {
		if (!groupId) return
		db.deleteGroup(groupId)
			.then(() => {
				navigate('../')
			})
			.catch((err) => setErrMsg(err))
	}

	if (!groupId || !group || !dutchpay) return <div> 로딩중</div>

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
			<Snackbar
				open={alert != null && !alert.includes('CLOSE')}
				autoHideDuration={5000}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				onClose={() => {
					setAlert(alert + 'CLOSE')
				}}>
				<Alert elevation={6} variant="filled" severity="success">
					{alert?.replace('CLOSE', '')}
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

							<IconButton
								onClick={() => {
									navigator.clipboard.writeText(window.location.href)
									setAlert('클립보드에 복사되었습니다.')
								}}>
								<Link />
							</IconButton>
							{havePermission ? (
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
								<ReceiptSummaryCard
									receiptSummary={dutchpay.receiptSummary}
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
								<TransferCard
									groupId={groupId}
									members={group.members}
									transfers={transfers}
									transfersNeeded={dutchpay.transfersNeeded}
									havePermission={havePermission}
								/>
							</div>
						</div>
						<div id="receipts">
							{havePermission ? (
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

export default GroupPage
