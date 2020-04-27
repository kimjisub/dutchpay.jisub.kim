import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './ReceiptCard.scss'

// Components
import NumberFormat from 'react-number-format'
import { ExpandMore } from '@material-ui/icons'
import {
	Card,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableFooter,
	ExpansionPanel,
	ExpansionPanelSummary,
} from '@material-ui/core'

export default function (props) {
	let totalPrice = 0
	let paiedPrice = 0

	let itemList = props.receipt.items.map((item, i) => {
		totalPrice += item.price
		return (
			<TableRow key={i}>
				<TableCell>{item.name}</TableCell>
				<TableCell>
					<NumberFormat value={parseFloat(item.price).toFixed(2)} displayType={'text'} thousandSeparator={true} />
				</TableCell>
				<TableCell>{item.buyers.length}명</TableCell>
			</TableRow>
		)
	})

	let payerList = []
	for (let id in props.receipt.payers) {
		let price = props.receipt.payers[id]
		paiedPrice += price
		payerList.push(
			<TableRow key={id}>
				<TableCell>{props.members[id]}</TableCell>
				<TableCell>
					<NumberFormat value={parseFloat(price).toFixed(2)} displayType={'text'} thousandSeparator={true} />
				</TableCell>
				<TableCell></TableCell>
			</TableRow>
		)
	}

	let diff = totalPrice - paiedPrice
	let statusMsg

	if (diff === 0) statusMsg = '결제 완료'
	else if (diff > 0) statusMsg = <NumberFormat value={parseFloat(diff).toFixed(2)} displayType={'text'} thousandSeparator={true} suffix="원 미결제" />
	else if (diff < 0) statusMsg = <NumberFormat value={parseFloat(-diff).toFixed(2)} displayType={'text'} thousandSeparator={true} suffix="원 초과결제" />

	return (
		// <Link to={props.to}>
		<ExpansionPanel variant="outlined" className="ReceiptCard" expanded={props.expanded} onChange={props.onExpanded}>
			<ExpansionPanelSummary expandIcon={<ExpandMore />}>
				<Typography className="title" variant="h5" component="h2">
					{props.receipt.name}
				</Typography>
			</ExpansionPanelSummary>
			<Table key="table1" size="small">
				<TableHead>
					<TableRow>
						<TableCell>이름</TableCell>
						<TableCell>가격</TableCell>
						<TableCell>인원</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>{itemList}</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell>총</TableCell>
						<TableCell>
							<NumberFormat value={parseFloat(totalPrice).toFixed(2)} displayType={'text'} thousandSeparator={true} />
						</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableFooter>
			</Table>
			<Table key="table2" size="small">
				<TableHead>
					<TableRow>
						<TableCell>결제자</TableCell>
						<TableCell>결제 금액</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableHead>

				<TableBody>{payerList}</TableBody>

				<TableFooter>
					<TableRow>
						<TableCell>총</TableCell>
						<TableCell>
							<NumberFormat value={parseFloat(paiedPrice).toFixed(2)} displayType={'text'} thousandSeparator={true} />
						</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableFooter>
			</Table>
			{statusMsg}
		</ExpansionPanel>
	)
}
