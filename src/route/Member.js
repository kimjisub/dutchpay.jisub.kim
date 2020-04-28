import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useHistory } from 'react-router-dom'
import queryString from 'query-string'
import './Member.scss'

// Backend
import { firestore } from '../firebase'
import { calcSingleExpenditure, sortObject } from '../algorithm'
import { fbLog } from '../logger'

// Components
import NumberFormat from 'react-number-format'
import { Button, CircularProgress, Card, Typography, Table, TableHead, TableBody, TableFooter, TableRow, TableCell } from '@material-ui/core'

const fs = firestore()

export default function (props) {
	const params = useParams()
	const queries = queryString.parse(useLocation().search)
	const history = useHistory()
	const editMode = queries.edit === 'true'

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
				console.log('Group Data Changed: ', data)
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
		history.push({ pathname: `/${params.groupId}`, search: editMode ? '?edit=true' : '' })
	}

	if (!group)
		return (
			<div className="Member popup">
				<div>
					<CircularProgress color="inherit" />
				</div>
			</div>
		)

	let singleExpenditure = calcSingleExpenditure(params.memberId, receipts)

	return (
		<div className="Member popup">
			<Card className="card">
				<Typography className="title" variant="h5" component="h2">
					<span id="name">{group.members[params.memberId]}</span>님의 지출 및 결제 내역
				</Typography>

				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>영수증 이름</TableCell>
							<TableCell>가격</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{singleExpenditure.map((receipt, i) => {
							return (
								<TableRow key={i}>
									<TableCell>{receipt.name}</TableCell>
									<TableCell>
										<NumberFormat value={receipt.totalPrice} displayType={'text'} thousandSeparator={true} />
									</TableCell>
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
								</TableRow>
							)
						})}
					</TableBody>

					<TableFooter>
						<TableRow>
							<TableCell>총</TableCell>
							<TableCell>가격</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
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
			</Card>
		</div>
	)
}
