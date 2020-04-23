import React, { useState, useEffect } from 'react'
import { Link, useParams, useLocation, useHistory } from 'react-router-dom'
import { IconButton } from 'react-mdl'
import { Card, Spinner } from 'react-bootstrap'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import queryString from 'query-string'
import { firestore } from '../firebase'
import ExpenditureCard from '../components/ExpenditureCard'
import SettlementCard from '../components/SettlementCard'
import ReceiptCard from '../components/ReceiptCard'
import EditableTextView from '../components/EditableTextView'
import './Group.scss'
import { calcExpenditure, calcSettlement, sortObject } from '../algorithm'

const fs = firestore()

export default function (props) {
	const params = useParams()
	const queries = queryString.parse(useLocation().search)
	const history = useHistory()

	const [group, setGroup] = useState(null)
	const [receipts, setReceipts] = useState({})
	const [editMode, setEditMode] = useState(queries.edit)
	const [errMsg, setErrMsg] = useState(null)

	useEffect(() => {
		fs.collection('DutchPay')
			.doc(params.groupId)
			.onSnapshot((doc) => {
				let data = (window.$data = doc.data())
				//console.log('Group Data Changed: ', data)
				data.members = sortObject(data.members)
				setGroup(data)
			})

		fs.collection('DutchPay')
			.doc(params.groupId)
			.collection('Receipts')
			.orderBy('timestamp', 'asc')
			.onSnapshot((querySnapshot) => {
				console.log(receipts)
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
				console.log(receipts, _receipts)
				setReceipts(_receipts)
			})
	}, [])

	useEffect(() => {
		history.push({ pathname: history.location.pathname, search: editMode ? '?edit=true' : '' })
		if (editMode)
			fs.collection('DutchPay')
				.doc(params.groupId)
				.update({})
				.then(() => {})
				.catch((e) => {
					setErrMsg('권한이 없습니다.')
					setEditMode(false)
				})
	}, [editMode])

	function saveGroupSetting() {
		if (group)
			fs.collection('DutchPay')
				.doc(params.groupId)
				.set(group)
				.then(() => {})
				.catch((e) => {
					setErrMsg('권한이 없습니다.')
					setEditMode(false)
				})
	}

	if (!group)
		return (
			<div className="popup">
				<div>
					<Spinner animation="border" />
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
							label="모임 이름"
							text={group.name}
							editMode={editMode}
							onChange={(e) => {
								let _group = Object.assign({}, group)
								_group.name = e.target.value
								setGroup(_group)
							}}
						/>
						정산 내역서
						<IconButton
							ripple
							name={editMode ? 'check' : 'edit'}
							onClick={() => {
								if (editMode) {
									saveGroupSetting()
									setEditMode(false)
								} else setEditMode(true)
							}}
						/>
						<IconButton
							ripple
							name="edit"
							onClick={() => {
								console.log(receipts)
								let _receipts = { ...receipts }
								_receipts['test'] = { name: '테스트', items: [], payers: {}, timestamp: null }
								console.log(receipts, _receipts)
								setReceipts(_receipts)
							}}
						/>
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
									<Card className="add-card">
										<Card.Body>추가하기</Card.Body>
									</Card>
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
