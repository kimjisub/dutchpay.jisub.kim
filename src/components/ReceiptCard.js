import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './ReceiptCard.scss'

// Components
import NumberFormat from 'react-number-format'

export default function (props) {
	// eslint-disable-next-line no-unused-vars
	const [expend, setExpend] = useState(true)

	let totalPrice = 0
	let paiedPrice = 0

	let itemList = props.receipt.items.map((item, i) => {
		totalPrice += item.price
		return (
			<tr key={i}>
				<td>{item.name}</td>
				<td>
					<NumberFormat value={parseFloat(item.price).toFixed(2)} displayType={'text'} thousandSeparator={true} />
				</td>
				<td>{item.buyers.length}명</td>
			</tr>
		)
	})

	let payerList = []
	for (let id in props.receipt.payers) {
		let price = props.receipt.payers[id]
		paiedPrice += price
		payerList.push(
			<tr key={id}>
				<td>{props.members[id]}</td>
				<td>
					<NumberFormat value={parseFloat(price).toFixed(2)} displayType={'text'} thousandSeparator={true} />
				</td>
				<td></td>
			</tr>
		)
	}

	let diff = totalPrice - paiedPrice
	let statusMsg

	if (diff === 0) statusMsg = '결제 완료'
	else if (diff > 0) statusMsg = <NumberFormat value={parseFloat(diff).toFixed(2)} displayType={'text'} thousandSeparator={true} suffix="원 미결제" />
	else if (diff < 0) statusMsg = <NumberFormat value={parseFloat(-diff).toFixed(2)} displayType={'text'} thousandSeparator={true} suffix="원 초과결제" />

	return (
		<Link to={props.to} className="ReceiptCard">
			<main className="card">
				<div className="title">{props.receipt.name}</div>
				{expend
					? [
							<table key="table1">
								<thead>
									<tr>
										<th>이름</th>
										<th>가격</th>
										<th>인원</th>
									</tr>
								</thead>

								<tbody>{itemList}</tbody>
								<tfoot>
									<tr>
										<th>총</th>
										<th>
											<NumberFormat value={parseFloat(totalPrice).toFixed(2)} displayType={'text'} thousandSeparator={true} />
										</th>
										<th></th>
									</tr>
								</tfoot>
							</table>,
							<table key="table2">
								<thead>
									<tr>
										<th>결제자</th>
										<th>결제 금액</th>
										<th></th>
									</tr>
								</thead>

								<tbody>{payerList}</tbody>

								<tfoot>
									<tr>
										<th>총</th>
										<th>
											<NumberFormat value={parseFloat(paiedPrice).toFixed(2)} displayType={'text'} thousandSeparator={true} />
										</th>
										<th></th>
									</tr>
								</tfoot>
							</table>,
					  ]
					: null}
				{expend ? statusMsg : null}
			</main>
		</Link>
	)
}
