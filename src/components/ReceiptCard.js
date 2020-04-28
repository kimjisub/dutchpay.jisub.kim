import React from 'react'
import './ReceiptCard.scss'

// Components
import NumberFormat from 'react-number-format'
import { ExpandMore } from '@material-ui/icons'
import {
	Typography,
	TableContainer,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TableFooter,
	ExpansionPanel,
	ExpansionPanelSummary,
	CardActionArea,
	Paper,
} from '@material-ui/core'

export default function (props) {
	let totalPrice = 0
	let paiedPrice = 0

	let itemList = props.receipt.items.map((item, i) => {
		totalPrice += item.price
		return (
			<TableRow key={i}>
				<TableCell>{item.name}</TableCell>
				<TableCell align="right">{item.buyers.length}명</TableCell>
				<TableCell align="right">
					<NumberFormat value={parseFloat(item.price.toFixed(2))} displayType={'text'} thousandSeparator={true} />
				</TableCell>
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
				<TableCell align="right">
					<NumberFormat value={parseFloat(price.toFixed(2))} displayType={'text'} thousandSeparator={true} />
				</TableCell>
			</TableRow>
		)
	}

	let diff = totalPrice - paiedPrice
	let statusMsg

	if (diff === 0) statusMsg = '결제 완료'
	else if (diff > 0) statusMsg = <NumberFormat value={parseFloat(diff.toFixed(2))} displayType={'text'} thousandSeparator={true} suffix="원 미결제" />
	else if (diff < 0) statusMsg = <NumberFormat value={parseFloat((-diff).toFixed(2))} displayType={'text'} thousandSeparator={true} suffix="원 초과결제" />
	return (
		<ExpansionPanel variant="outlined" className="ReceiptCard" expanded={props.expanded} onChange={props.onExpanded}>
			<ExpansionPanelSummary expandIcon={<ExpandMore />}>
				<Typography className="title" variant="h5" component="h2">
					{props.receipt.name}
				</Typography>
			</ExpansionPanelSummary>
			<CardActionArea
				onClick={() => {
					props.onClick()
				}}>
				<div className="table-wrapper">
					{/* <TableContainer component={Paper} variant="outlined"> */}
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>상품명</TableCell>
								<TableCell align="right">인원</TableCell>
								<TableCell align="right">가격</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>{itemList}</TableBody>
						<TableFooter>
							<TableRow>
								<TableCell>총</TableCell>
								<TableCell></TableCell>
								<TableCell align="right">
									<NumberFormat value={parseFloat(totalPrice.toFixed(2))} displayType={'text'} thousandSeparator={true} />
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
					{/* </TableContainer> */}
				</div>

				<div className="table-wrapper">
					{/* <TableContainer component={Paper} variant="outlined"> */}
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>결제자</TableCell>
								<TableCell align="right">결제</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>{payerList}</TableBody>

						<TableFooter>
							<TableRow>
								<TableCell>총</TableCell>
								<TableCell align="right">
									<NumberFormat value={parseFloat(paiedPrice.toFixed(2))} displayType={'text'} thousandSeparator={true} />
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
					{/* </TableContainer> */}
				</div>
				{statusMsg}
			</CardActionArea>
		</ExpansionPanel>
	)
}
