import React from 'react'
import clsx from 'clsx'
import './ReceiptCard.scss'

// Components
import { ExpandMore } from '@material-ui/icons'
import { Accordion, AccordionSummary, CardActionArea } from '@material-ui/core'
import EditableNumberView from '../elements/EditableNumberView'

import { format } from 'date-fns'

export default function ReceiptCard(props) {
	let totalPrice = 0
	let paiedPrice = 0

	let itemList = props.receipt.items.map((item, i) => {
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
	for (let id in props.receipt.payers) {
		let price = props.receipt.payers[id]
		paiedPrice += price
		payerList.push(
			<tr key={id} className="green">
				<td align="left">결제</td>
				<td align="center">{props.members[id]}</td>
				<td align="right">
					<EditableNumberView value={parseFloat(price.toFixed(2))} editMode={false} />
				</td>
			</tr>
		)
	}

	const diff = totalPrice - paiedPrice
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
		<Accordion variant="outlined" className="ReceiptCard" expanded={props.expanded} onChange={props.onExpanded}>
			<AccordionSummary expandIcon={<ExpandMore />}>
				<div className="summary">
					<div className="left">
						<p className="title">{props.receipt.name}</p>
						<p className="date">{format(props.receipt.timestamp, 'MM/dd HH:mm')}</p>
					</div>
					<EditableNumberView className={clsx('price', diff !== 0 ? 'red' : '')} value={parseFloat(totalPrice.toFixed(2))} editMode={false} />
				</div>
			</AccordionSummary>
			<CardActionArea
				onClick={() => {
					props.onClick()
				}}>
				<div className="table-wrapper">
					{/* <TableContainer component={Paper} variant="outlined"> */}
					<table size="small">
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
					{/* </TableContainer> */}
				</div>
			</CardActionArea>
		</Accordion>
	)
}
