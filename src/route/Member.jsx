import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Member.scss'

// Backend
import * as db from '../db/firestore'
import { calcSingleExpenditure } from '../algorithm'
import EditableNumberView from '../elements/EditableNumberView'

export default function Member(props) {
	const params = useParams()
	const navigate = useNavigate()

	const [group, setGroup] = useState(null)
	const [receipts, setReceipts] = useState([])

	useEffect(() => {
		const unsubscribeGroup = db.subscribeGroup(params.groupId, (group) => {
			setGroup(group)
		})

		const unsubscribeReceipts = db.subscribeReceipts(params.groupId, (receipts) => {
			setReceipts(receipts)
		})

		return () => {
			unsubscribeGroup()
			unsubscribeReceipts()
		}
	}, [params.groupId])

	function close() {
		navigate(-1)
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
								<td>개인 금액</td>
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
