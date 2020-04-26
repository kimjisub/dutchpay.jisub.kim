import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useHistory } from 'react-router-dom'
import queryString from 'query-string'
import { Spinner } from 'react-bootstrap'
import { firestore } from '../firebase'
import NumberFormat from 'react-number-format'
import './Member.scss'
import { calcSingleExpenditure, sortObject } from '../algorithm'
import { Button } from '@material-ui/core'

const fs = firestore()

export default function (props) {
	const params = useParams()
	const queries = queryString.parse(useLocation().search)
	const history = useHistory()
	const editMode = queries.edit === 'true'

	const [group, setGroup] = useState(null)
	const [receipts, setReceipts] = useState({})

	const onGroupSnapshot = useCallback((doc) => {
		let data = (window.$data = doc.data())
		//console.log("Group Data Changed: ", data);
		data.members = sortObject(data.members)
		setGroup(data)
	}, [])

	const onReceiptSnapshot = useCallback(
		(querySnapshot) => {
			let _receipts = { ...receipts }
			querySnapshot.docChanges().forEach((change) => {
				let id = change.doc.id
				let data = change.doc.data()
				//console.log('Receipts', change.type, id)

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
			setReceipts(_receipts)
		},
		[receipts]
	)

	useEffect(() => {
		fs.collection('DutchPay').doc(params.groupId).onSnapshot(onGroupSnapshot)

		fs.collection('DutchPay').doc(params.groupId).collection('Receipts').orderBy('timestamp', 'asc').onSnapshot(onReceiptSnapshot)
	}, [params.groupId, onGroupSnapshot, onReceiptSnapshot])

	function close() {
		history.push({ pathname: `/${params.groupId}`, search: editMode ? '?edit=true' : '' })
	}

	if (!group)
		return (
			<div className="Member popup">
				<div>
					<Spinner animation="border" />
				</div>
			</div>
		)

	let singleExpenditure = calcSingleExpenditure(params.memberId, receipts)

	return (
		<div className="Member popup">
			<main>
				<p id="title">
					<span id="name">{group.members[params.memberId]}</span>님의 지출 내역
				</p>

				<div id="list">
					<ol>
						{singleExpenditure.map((receipt, i) => {
							return (
								<li key={i}>
									<div>
										<p>{receipt.name}</p>
										<p>
											<NumberFormat value={receipt.totalPrice} displayType={'text'} thousandSeparator={true} />
										</p>
									</div>

									<ol>
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
									</ol>
								</li>
							)
						})}
					</ol>
				</div>
				<div className="action">
					<div>
						<Button
							onClick={() => {
								close()
							}}>
							확인
						</Button>
					</div>
				</div>
			</main>
		</div>
	)
}
