import React, { useState, useEffect, useReducer, useRef } from 'react'
import { Link, useParams, useLocation, useHistory } from 'react-router-dom'
import queryString from 'query-string'
import './Group.scss'

// Backend
import { firestore } from '../firebase'
import { calcExpenditure, calcSettlement, sortObject } from '../algorithm'
import { fbLog } from '../logger'

// Components
import { Add, Check, Edit } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import { Snackbar, CircularProgress, IconButton } from '@material-ui/core'

// Custom Components
import ExpenditureCard from '../components/ExpenditureCard'
import SettlementCard from '../components/SettlementCard'
import ReceiptCard from '../components/ReceiptCard'
import EditableTextView from '../elements/EditableTextView'

const fs = firestore()

export default function (props) {
	const params = useParams()
	const queries = queryString.parse(useLocation().search)
	const history = useHistory()

	const [groupName, setGroupName] = useState('')
	const [errMsg, setErrMsg] = useState(null)
	const [expanded, setExpanded] = useState(null)

	const [group, groupDispatch] = useReducer((state, action) => {
		const { type, data } = action
		switch (type) {
			case 'fromFirebase':
				setGroupName(data.name)
				break
			case 'saveLocal':
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
							editModeDispatch({ type: 'permissionDenied', data: false })
						})
				}
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
		return _state
	}, {})

	const [editMode, editModeDispatch] = useReducer((state, action) => {
		const { type, data } = action
		if (data)
			// 수정모드 요청시
			switch (type) {
				case 'userRequest':
					if (group) {
						fbLog(`Permission Test /DutchPay/{${params.groupId}}`)
						fs.collection('DutchPay')
							.doc(params.groupId)
							.update({})
							.then(() => {})
							.catch((err) => {
								editModeDispatch({ type: 'permissionDenied', data: false })
							})
					}
					break
				default:
			}
		// 데이터 저장 요청시
		else
			switch (type) {
				case 'permissionDenied':
					setErrMsg('권한이 없습니다.')
					break
				case 'userRequest':
					if (group) {
						groupDispatch({ type: 'saveFirebase', data: { ...group }, name: groupName }) //name: groupName
					}
					break
				default:
			}

		history.push({ pathname: history.location.pathname, search: data ? '?edit=true' : '' })
		return data
	}, queries.edit === 'true')

	// Subscribe Firestore
	useEffect(() => {
		fbLog(`Subscribe /DutchPay/{${params.groupId}}`)
		fbLog(`Subscribe /DutchPay/{${params.groupId}}/Receipts`)
		const unsubscribeGroup = fs
			.collection('DutchPay')
			.doc(params.groupId)
			.onSnapshot((doc) => {
				let data = (window.$data = doc.data())
				console.log('Group Data Changed: ', data)
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
					console.log('Receipts', change.type, id)

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
					history.push({ pathname: '/' + params.groupId + '/receipt/' + key, search: editMode ? '?edit=true' : '' })
				}}
				to={`/${params.groupId}/receipt/${key}${editMode ? '?edit=true' : ''}`}
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
			<section>
				<article>
					<span>
						<EditableTextView
							id="group-title"
							label="모임 이름"
							text={groupName}
							editMode={editMode}
							onChange={(e) => {
								setGroupName(e.target.value)
							}}
						/>
						정산 내역서
						<IconButton
							onClick={() => {
								editModeDispatch({ type: 'userRequest', data: !editMode })
							}}>
							{editMode ? <Check /> : <Edit />}
						</IconButton>
					</span>
					<div>
						<aside id="dashboard">
							<div>
								<ExpenditureCard
									expenditure={expenditure}
									members={group.members}
									onMembersChange={(members) => {
										let _group = { ...group }
										_group.members = members
										groupDispatch({ type: 'saveFirebase', data: _group })
									}}
									onMemberClick={(id) => {
										history.push({ pathname: '/' + params.groupId + '/member/' + id, search: editMode ? '?edit=true' : '' })
									}}
									editMode={editMode}
								/>
								<SettlementCard members={group.members} settlement={settlement} />
							</div>
						</aside>
						<main id="receipts">
							{editMode ? (
								<Link to={`/${params.groupId}/receipt/new?edit=true`}>
									<IconButton>
										<Add />
									</IconButton>
								</Link>
							) : null}
							{receiptCards}
						</main>
					</div>
				</article>
			</section>
			<footer>기획,개발: 김지섭 디자인: 손채린</footer>
		</div>
	)
}
