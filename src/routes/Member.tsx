import React, { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import './Member.scss'

// Backend
import * as db from '../db/firestore'
import EditableNumberView from '../elements/EditableNumberView'
import { Group } from '../models/Group'
import { Receipt } from '../models/Receipt'
import { calcSingleReceiptSummary } from '../utils/algorithm/calcSingleReceiptSummary'

export type MemberProps = {}

const Member: FC<MemberProps> = (props) => {
	const params = useParams()
	const navigate = useNavigate()

	const [group, setGroup] = useState<Group | null>(null)
	const [receipts, setReceipts] = useState<Receipt[]>([])

	useEffect(() => {
		if (params.groupId) {
			const unsubscribeGroup = db.subscribeGroup(params.groupId, setGroup)

			const unsubscribeReceipts = db.subscribeReceipts(params.groupId, (r) => {
				setReceipts(Object.values(r))
			})

			return () => {
				unsubscribeGroup()
				unsubscribeReceipts()
			}
		}
	}, [params.groupId])

	function close() {
		navigate('../')
	}

	if (!group || !params.groupId || !params.memberId) return <div className="Member popup"></div>

	const singleReceiptSummary = calcSingleReceiptSummary(params.memberId, receipts)
	const totalReceiptSummary = Object.values(singleReceiptSummary).reduce((acc, cur) => acc + cur.totalPrice, 0)

	return (
		<div
			className="Member popup"
			onClick={() => {
				close()
			}}>
			<div className="card" onClick={() => {}}>
				<h2 className="title">{group.members[params.memberId]}</h2>

				<div className="table-wrapper">
					<table>
						<thead>
							<tr>
								<td>영수증 이름</td>
								<td>개인 금액</td>
							</tr>
						</thead>
						<tbody>
							{singleReceiptSummary.map((receipt, i) => {
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
									<EditableNumberView value={totalReceiptSummary} editMode={false} />
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
	)
}

export default Member
