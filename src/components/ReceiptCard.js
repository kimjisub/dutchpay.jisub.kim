import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import NumberFormat from 'react-number-format'
import './ReceiptCard.scss'

class App extends Component {
	constructor() {
		super()
		this.state = {
			expend: true,
		}
	}

	render() {
		let totalPrice = 0
		let paiedPrice = 0

		let itemList = this.props.receipt.items.map((item, i) => {
			totalPrice += item.price
			return (
				<tr key={i}>
					<td>{item.name}</td>
					<td>
						<NumberFormat value={item.price} displayType={'text'} thousandSeparator={true} />
					</td>
					<td>{item.buyers.length}명</td>
				</tr>
			)
		})

		let payerList = []
		for (let id in this.props.receipt.payers) {
			let price = this.props.receipt.payers[id]
			paiedPrice += price
			payerList.push(
				<tr key={id}>
					<td>{this.props.members[id]}</td>
					<td>
						<NumberFormat value={price} displayType={'text'} thousandSeparator={true} />
					</td>
					<td></td>
				</tr>
			)
		}

		let diff = totalPrice - paiedPrice
		let statusMsg

		if (diff === 0) statusMsg = '결제 완료'
		else if (diff > 0) statusMsg = <NumberFormat value={diff} displayType={'text'} thousandSeparator={true} suffix="원 미결제" />
		else if (diff < 0) statusMsg = <NumberFormat value={-diff} displayType={'text'} thousandSeparator={true} suffix="원 초과결제" />

		return (
			<Link to={this.props.to} className="ReceiptCard">
				<main className="card">
					<div className="title">{this.props.receipt.name}</div>
					{this.state.expend
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
												<NumberFormat value={totalPrice} displayType={'text'} thousandSeparator={true} />
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
												<NumberFormat value={paiedPrice} displayType={'text'} thousandSeparator={true} />
											</th>
											<th></th>
										</tr>
									</tfoot>
								</table>,
						  ]
						: null}
					{this.state.expend ? statusMsg : null}
				</main>
			</Link>
		)
	}
}

export default App
