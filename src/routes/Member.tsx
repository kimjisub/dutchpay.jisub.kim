import React, { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import './Member.scss'

import { calcSingleExpenditure } from '../algorithm'
// Backend
import * as db from '../db/firestore'
import EditableNumberView from '../elements/EditableNumberView'
import { GroupType } from '../types/GroupType'
import { ReceiptType } from '../types/ReceiptType'

export type MemberProps = {}

const Member: FC<MemberProps> = (props) => {
	const params = useParams()
	const navigate = useNavigate()

	const [group, setGroup] = useState<GroupType | null>(null)
	const [receipts, setReceipts] = useState<ReceiptType[]>([])

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
					<table>
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

export default Member
