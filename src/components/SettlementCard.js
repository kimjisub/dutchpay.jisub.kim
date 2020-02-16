import React, { Component } from 'react'
import { Card, ListGroup } from 'react-bootstrap'
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
										<p>(이)가</p>
										{this.props.members[to]}
										<p>에게</p>
										{value}
										<p>원</p>
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
