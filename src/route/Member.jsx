import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useNavigateSearch } from '../hooks/useNavigationSearch'
import './Member.scss'

// Backend
import { firestore } from '../firebase'
import { calcSingleExpenditure, sortObject } from '../algorithm'
import { fbLog } from '../logger'

// Components
import NumberFormat from 'react-number-format'
import { CircularProgress } from '@material-ui/core'

const fs = firestore()

export default function Member(props) {
	const params = useParams()
	const [searchParams] = useSearchParams()
	const navigateSearch = useNavigateSearch()
	const editMode = searchParams.get('edit') === 'true'

	const [group, setGroup] = useState(null)
	const [receipts, setReceipts] = useState({})

	useEffect(() => {
		fbLog(`Subscribe /DutchPay/{${params.groupId}}`)
		fbLog(`Subscribe /DutchPay/{${params.groupId}}/Receipts`)
		const unsubscribeGroup = fs
			.collection('DutchPay')
			.doc(params.groupId)
			.onSnapshot((doc) => {
				let data = (window.$data = doc.data())
				data.members = sortObject(data.members)
				setGroup(data)
			})
		const unsubscribeReceipts = fs
			.collection('DutchPay')
			.doc(params.groupId)
			.collection('Receipts')
			.orderBy('timestamp', 'asc')
			.onSnapshot((querySnapshot) => {
				setReceipts((receipts) => {
					let _receipts = { ...receipts }
					querySnapshot.docChanges().forEach((change) => {
						let id = change.doc.id
						let data = change.doc.data()

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

					return sortObject(_receipts, (a, b) => {
						const Atarget = _receipts[a].timestamp
						const Btarget = _receipts[b].timestamp
						return Atarget > Btarget ? 1 : -1
					})
				})
			})

		return () => {
			fbLog(`Unsubscribe /DutchPay/{${params.groupId}}`)
			fbLog(`Unsubscribe /DutchPay/{${params.groupId}}/Receipts`)
			unsubscribeGroup()
			unsubscribeReceipts()
		}
	}, [params.groupId])

	function close() {
		navigateSearch('../', { edit: editMode ? true : undefined }) // history.push({ pathname: `/groups/${params.groupId}`, search: editMode ? '?edit=true' : '' })
	}

	if (!group)
		return (
			<div className="Member popup">
				<div>
					<CircularProgress color="inherit" />
				</div>
			</div>
		)

	const singleExpenditure = calcSingleExpenditure(params.memberId, receipts)
	const totalExpenditure = Object.values(singleExpenditure).reduce((acc, cur) => acc + cur.totalPrice, 0)

	return (
		<div
			className="Member popup"
			onClick={() => {
				close()
			}}>
			<div className="card" onClick={() => {}}>
				<p className="title">
					<span id="name">{group.members[params.memberId]}</span>
				</p>

				<div className="table-wrapper">
					<table size="small">
						<thead>
							<tr>
								<td>영수증 이름</td>
								<td>가격</td>
							</tr>
						</thead>
						<tbody>
							{singleExpenditure.map((receipt, i) => {
								return (
									<tr key={i}>
										<td>{receipt.name}</td>
										<td>
											<NumberFormat value={receipt.totalPrice} displayType={'text'} thousandSeparator={true} />
										</td>
										{/* <ol>
									{receipt.items.map((item, i) => {
										return (
											<li key={i}>
												<div>
													<p>{item.name}</p>
													<p>
														<NumberFormat value={item.price} displayType={'text'} thousandSeparator={true} />
													</p>
												</div>
											</li>
										)
									})}
								</ol> */}
									</tr>
								)
							})}
						</tbody>

						<tfoot>
							<tr>
								<td>총</td>
								<td>
									<NumberFormat value={totalExpenditure} displayType={'text'} thousandSeparator={true} />
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
	)
}
