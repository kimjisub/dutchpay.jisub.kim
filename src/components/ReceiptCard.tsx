import React, { FC } from 'react'
import clsx from 'clsx'
import './ReceiptCard.scss'

// Components
import { ExpandMore } from '@mui/icons-material'
import { Accordion, AccordionSummary, CardActionArea } from '@mui/material'
import EditableNumberView from '../elements/EditableNumberView'

import { format } from 'date-fns'
import { ReceiptType } from '../types/ReceiptType'
import { MembersType } from '../types/MembersType'

export interface ReceiptCardProps {
	className?: string

	receipt: ReceiptType
	members: MembersType
	expanded: boolean
	onExpanded?: () => void
	onClick?: () => void
}

const ReceiptCard: FC<ReceiptCardProps> = ({ className, receipt, members, expanded, onExpanded, onClick }) => {
	let totalPrice = 0
	let paidPrice = 0

	let itemList = receipt.items.map((item, i) => {
		totalPrice += item.price
		return (
			<tr key={i}>
				<td align="left">{item.name}</td>
				<td align="center">{item.buyers.length}명</td>
				<td align="right">
					<EditableNumberView value={parseFloat(item.price.toFixed(2))} editMode={false} />
				</td>
			</tr>
		)
	})

	let payerList = []
	for (let id in receipt.payers) {
		let price = receipt.payers[id]
		paidPrice += price
		payerList.push(
			<tr key={id} className="green">
				<td align="left">결제</td>
				<td align="center">{members[id]}</td>
				<td align="right">
					<EditableNumberView value={parseFloat(price.toFixed(2))} editMode={false} />
				</td>
			</tr>
		)
	}

	const diff = totalPrice - paidPrice
	let diffRow = null

	if (diff > 0)
		diffRow = (
			<tr className="red">
				<td align="left">미결제</td>
				<td align="center"></td>
				<td align="right">
					<EditableNumberView value={parseFloat(diff.toFixed(2))} editMode={false} />
				</td>
			</tr>
		)
	else if (diff < 0)
		diffRow = (
			<tr className="red">
				<td align="left">초과결제</td>
				<td align="center"></td>
				<td align="right">
					<EditableNumberView value={parseFloat(diff.toFixed(2))} editMode={false} />
				</td>
			</tr>
		)
	return (
		<Accordion variant="outlined" className={clsx('ReceiptCard', className)} expanded={expanded} onChange={onExpanded}>
			<AccordionSummary expandIcon={<ExpandMore />}>
				<div className="summary">
					<div className="left">
						<p className="title">{receipt.name}</p>
						<p className="date">{format(receipt.timestamp, 'MM/dd HH:mm')}</p>
					</div>
					<EditableNumberView className={clsx('price', diff !== 0 ? 'red' : '')} value={parseFloat(totalPrice.toFixed(2))} editMode={false} />
				</div>
			</AccordionSummary>
			<CardActionArea
				onClick={() => {
					if (onClick) onClick()
				}}>
				<div className="table-wrapper">
					<table>
						<thead>
							<tr>
								<td align="left">내용</td>
								<td align="center">인원</td>
								<td align="right">금액</td>
							</tr>
						</thead>

						<tbody>
							{itemList}
							{payerList}
							{diffRow}
						</tbody>
						<tfoot>
							<tr>
								<td align="left"></td>
								<td align="center"></td>
								<td align="right">
									<EditableNumberView value={parseFloat(totalPrice.toFixed(2))} editMode={false} />
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</CardActionArea>
		</Accordion>
	)
}

export default ReceiptCard
