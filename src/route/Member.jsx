import React, { useState, useEffect, useReducer } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useNavigateSearch } from '../hooks/useNavigationSearch'
import './Member.scss'

// Backend
import { firestore } from '../firebase'
import { calcSingleExpenditure, sortObject } from '../algorithm'
import { fbLog } from '../logger'
import EditableNumberView from '../elements/EditableNumberView'

const fs = firestore()

export default function Member(props) {
	const params = useParams()
	const [searchParams] = useSearchParams()
	const navigateSearch = useNavigateSearch()
	const editMode = searchParams.get('edit') === 'true'

	const [group, setGroup] = useState(null)

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

	function close() {
		navigateSearch('../', { edit: editMode ? true : undefined }) // history.push({ pathname: `/groups/${params.groupId}`, search: editMode ? '?edit=true' : '' })
	}

	if (!group) return <div className="Member popup"></div>

	const singleExpenditure = calcSingleExpenditure(params.memberId, receipts)
	const totalExpenditure = Object.values(singleExpenditure).reduce((acc, cur) => acc + cur.totalPrice, 0)

	return (
		<div
			className="Member popup"
			onClick={() => {
				close()
			}}>
			<div className="card" onClick={() => {}}>
				<h2 className="title">{group.members[params.memberId]}</h2>

				<div className="table-wrapper">
					<table size="small">
						<thead>
							<tr>
								<td>영수증 이름</td>
								<td>금액</td>
							</tr>
						</thead>
						<tbody>
							{singleExpenditure.map((receipt, i) => {
								return (
									<tr key={i}>
										<td>{receipt.name}</td>
										<td>
											<EditableNumberView value={receipt.totalPrice} editMode={false} />
										</td>
										{/* <ol>
									{receipt.items.map((item, i) => {
										return (
											<li key={i}>
												<div>
													<p>{item.name}</p>
													<p>
														<EditableNumberView value={item.price} editMode={false} />
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
								<td>합계</td>
								<td>
									<EditableNumberView value={totalExpenditure} editMode={false} />
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
	)
}
