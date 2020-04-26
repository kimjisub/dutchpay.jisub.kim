import React, { useState, useEffect, useCallback } from 'react'
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
	const [group, setGroup] = useState(null)
	const [receipts, setReceipts] = useState({})
	const [editMode, setEditMode] = useState(queries.edit)
	const [errMsg, setErrMsg] = useState(null)

	const onGroupSnapshot = useCallback((doc) => {
		let data = (window.$data = doc.data())
		//console.log("Group Data Changed: ", data);
		data.members = sortObject(data.members)
		setGroup(data)
	}, [])

	const onReceiptSnapshot = useCallback((querySnapshot) => {
		setReceipts((receipts) => {
			let _receipts = { ...receipts }
			querySnapshot.docChanges().forEach((change) => {
				let id = change.doc.id
				let data = change.doc.data()
				console.log('Receipts', change.type, id)

				switch (change.type) {
					case 'added':
						_receipts[id] = data
						break
					case 'modified':
						_receipts[id] = data
						break
					case 'removed':
						delete _receipts[id]
						break
					default:
				}
			})
			return _receipts
		})
	}, [])

	// Subscribe Firestore
	useEffect(() => {
		fbLog(`Subscribe /DutchPay/{${params.groupId}}`)
		fbLog(`Subscribe /DutchPay/{${params.groupId}}/Receipts`)
		const unsubscribeGroup = fs.collection('DutchPay').doc(params.groupId).onSnapshot(onGroupSnapshot)
		const unsubscribeReceipts = fs.collection('DutchPay').doc(params.groupId).collection('Receipts').orderBy('timestamp', 'asc').onSnapshot(onReceiptSnapshot)

		return () => {
			fbLog(`Unsubscribe /DutchPay/{${params.groupId}}`)
			fbLog(`Unsubscribe /DutchPay/{${params.groupId}}/Receipts`)
			unsubscribeGroup()
			unsubscribeReceipts()
		}
	}, [params.groupId, onGroupSnapshot, onReceiptSnapshot])

	// EditMode Changed
	useEffect(() => {
		history.push({ pathname: history.location.pathname, search: editMode ? '?edit=true' : '' })
		if (editMode) {
			// Permission Test
			fbLog(`Permission Test /DutchPay/{${params.groupId}}`)
			fs.collection('DutchPay')
				.doc(params.groupId)
				.update({})
				.then(() => {})
				.catch((err) => {
					setErrMsg('권한이 없습니다.')
					setEditMode(false)
				})
		} else {
			// Apply Group Name
			if (group) setGroup((group) => ({ ...group, name: groupName }))
		}
		// eslint-disable-next-line
	}, [editMode, history, params.groupId])

	// Group Changed
	useEffect(() => {
		if (group) {
			fbLog(`Set /DutchPay/{${params.groupId}}`)
			fs.collection('DutchPay')
				.doc(params.groupId)
				.set(group)
				.then(() => {})
				.catch((err) => {
					setErrMsg('권한이 없습니다.')
					setEditMode(false)
				})
		}
	}, [group, editMode, params.groupId])

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
							className="group-title"
							label="모임 이름"
							text={group.name}
							editMode={editMode}
							onChange={(e) => {
								setGroupName(e.target.value)
							}}
						/>
						정산 내역서
						<IconButton
							onClick={() => {
								if (editMode) setEditMode(false)
								else setEditMode(true)
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
										let _group = Object.assign({}, group)
										_group.members = members
										setGroup(_group)
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
