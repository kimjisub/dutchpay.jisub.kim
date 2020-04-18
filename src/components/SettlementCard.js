import React, { Component } from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import NumberFormat from 'react-number-format'
import './SettlementCard.scss'

class App extends Component {
	render() {
		return (
			<Card shadow={0} className="SettlementCard card">
				<Card.Body>
					<Card.Title>정산</Card.Title>

					<ListGroup className="list-group-flush">
						{this.props.settlement.map((data, i) => {
							let from = data.from
							let to = data.to
							let value = data.value

							return (
								<ListGroup.Item className="item" key={i}>
									<p>
										{this.props.members[from]}
										<span className="small">(이)가</span>
										{this.props.members[to]}
										<span className="small">에게</span>
										<NumberFormat value={value} displayType={'text'} thousandSeparator={true} />
										<span className="small">원</span>
									</p>
								</ListGroup.Item>
							)
						})}
					</ListGroup>
				</Card.Body>
			</Card>
		)
	}
}

export default App
