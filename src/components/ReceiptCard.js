import React from 'react'
import './ReceiptCard.scss'

// Components
import NumberFormat from 'react-number-format'
import { ExpandMore } from '@material-ui/icons'
import { Typography, Accordion, AccordionSummary, CardActionArea } from '@material-ui/core'
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
					<NumberFormat value={parseFloat(item.price.toFixed(2))} displayType={'text'} thousandSeparator={true} />
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
					<NumberFormat value={parseFloat(price.toFixed(2))} displayType={'text'} thousandSeparator={true} />
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
					<NumberFormat value={parseFloat(diff.toFixed(2))} displayType={'text'} thousandSeparator={true} />
				</td>
			</tr>
		)
	else if (diff < 0)
		diffRow = (
			<tr className="red">
				<td align="left">초과결제</td>
				<td align="center"></td>
				<td align="right">
					<NumberFormat value={parseFloat(diff.toFixed(2))} displayType={'text'} thousandSeparator={true} />
				</td>
			</tr>
		)
	return (
		<Accordion variant="outlined" className="ReceiptCard" expanded={props.expanded} onChange={props.onExpanded}>
			<AccordionSummary expandIcon={<ExpandMore />}>
				<div className="summary">
					<Typography className="title" variant="h5">
						{props.receipt.name}
					</Typography>
					<Typography className="date" variant="subtitle1">
						{format(props.receipt.timestamp.toDate(), 'yyyy-MM-dd HH:mm')}
					</Typography>
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
								<td align="left">상품명</td>
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
									<NumberFormat value={parseFloat(totalPrice.toFixed(2))} displayType={'text'} thousandSeparator={true} />
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
