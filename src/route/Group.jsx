import React, { useState, useEffect, useReducer } from 'react'
import { Link, useParams, Outlet, useSearchParams } from 'react-router-dom'
import { useNavigateSearch } from '../hooks/useNavigationSearch'
import './Group.scss'

// Backend
import { firestore } from '../firebase'
import { calcExpenditure, calcSettlement, sortObject } from '../algorithm'
import { fbLog } from '../logger'

// Components
import { Add, Check, Edit } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { Snackbar, CircularProgress, IconButton, Button } from '@material-ui/core'

// Custom Components
import ExpenditureCard from '../components/ExpenditureCard'
import SettlementCard from '../components/SettlementCard'
import ReceiptCard from '../components/ReceiptCard'
import EditableTextView from '../elements/EditableTextView'

const fs = firestore()

export default function (props) {
	const params = useParams()
	const navigateSearch = useNavigateSearch()
	const [searchParams, setSearchParams] = useSearchParams()

	const [groupName, setGroupName] = useState('')
	const [errMsg, setErrMsg] = useState(null)
	const [expanded, setExpanded] = useState(null)

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
			return Atarget > Btarget ? 1 : -1
		})
	}, {})

	const [editMode, editModeDispatch] = useReducer((state, action) => {
		let { type } = action
		let editMode = state
		switch (type) {
			case 'init':
				const isEditMode = searchParams.get('edit') === 'true'
				if (isEditMode) {
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
				} else editMode = false

				break
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
		if (editMode) setSearchParams({ edit: editMode })
		else setSearchParams({}) // history.push({ pathname: history.location.pathname, search: editMode ? '?edit=true' : '' })
		return editMode
	}, false)

	useEffect(() => {
		editModeDispatch({ type: 'init' })
	}, [])

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

				groupDispatch({ type: 'fromFirebase', data })
			})
		const unsubscribeReceipts = fs
			.collection('DutchPay')
			.doc(params.groupId)
			.collection('Receipts')
			.orderBy('timestamp', 'asc')
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

	if (!group)
		return (
			<div className="popup">
				<div>
					<CircularProgress color="inherit" />
				</div>
			</div>
		)

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
					navigateSearch(`./receipts/${key}`, { edit: editMode ? true : undefined }) // history.push({ pathname: '/groups/' + params.groupId + '/receipts/' + key, search: editMode ? '?edit=true' : '' })
				}}
				editMode={editMode}
			/>
		)
	}
	receiptCards.reverse()

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
			<div className="area">
				<section>
					<div className="top">
						<EditableTextView
							className="group-title"
							label="모임 이름"
							text={groupName}
							editMode={editMode}
							onChange={(e) => {
								setGroupName(e.target.value)
							}}
						/>
						<IconButton
							onClick={() => {
								if (editMode) {
									groupDispatch({ type: 'saveFirebaseAndDone', data: { ...group, name: groupName } })
								} else editModeDispatch({ type: 'requestEditMode' })
							}}>
							{editMode ? <Check /> : <Edit />}
						</IconButton>
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
										navigateSearch(`./members/${id}`, { edit: editMode ? true : undefined }) // history.push({ pathname: '/groups/' + params.groupId + '/members/' + id, search: editMode ? '?edit=true' : '' })
									}}
									editMode={editMode}
								/>
								<SettlementCard members={group.members} settlement={settlement} />
							</div>
						</div>
						<div id="receipts">
							{editMode ? (
								<Link to={`/groups/${params.groupId}/receipts/new?edit=true`}>
									<div>
										<Button className="addButton">
											<Add />
										</Button>
									</div>
								</Link>
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
