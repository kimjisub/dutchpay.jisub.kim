import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Table, Card } from 'react-bootstrap'
import { IconButton } from 'react-mdl'
import './ReceiptCard.css'

class App extends Component {
	render() {
		let totalPrice = 0
		let paiedPrice = 0

		let itemList = this.props.receipt.items.map((item, i) => {
			totalPrice += item.price
			return (
				<tr key={i}>
					<th>{item.name}</th>
					<th>{item.price}</th>
					<th>{item.buyers.length}명</th>
				</tr>
			)
		})

		let payerList = []
		for (let id in this.props.receipt.payers) {
			let price = this.props.receipt.payers[id]
			paiedPrice += price
			payerList.push(
				<tr key={id}>
					<th>{this.props.members[id]}</th>
					<th>{price}</th>
					<th></th>
				</tr>
			)
		}

		let diff = totalPrice - paiedPrice
		let statusMsg

		if (diff === 0) statusMsg = '결제 완료'
		else if (diff > 0) statusMsg = `${diff}원 미결제`
		else if (diff < 0) statusMsg = `${-diff}원 초과결제`

		return (
			<Link to={this.props.to}>
				<Card className="receipt-card">
					<Card.Body>
						<Card.Title>{this.props.receipt.name}</Card.Title>
						<Table size="sm" responsive borderless>
							<thead>
								<tr>
									<th>이름</th>
									<th>가격</th>
									<th>구매 인원</th>
								</tr>
							</thead>

							<tbody>{itemList}</tbody>
							<tfoot>
								<tr>
									<th>총</th>
									<th>{totalPrice}</th>
									<th></th>
								</tr>
							</tfoot>
						</Table>
						<Table size="sm" responsive borderless>
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
									<th>{paiedPrice}</th>
									<th></th>
								</tr>
							</tfoot>
						</Table>
					</Card.Body>
					<Card.Footer className="text-muted">{statusMsg}</Card.Footer>
				</Card>
			</Link>
		)
	}
}

export default App
