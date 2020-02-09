import React, { Component } from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import './ExpenditureCard.css'

class App extends Component {
	render() {
		let list = []

		for (let id in this.props.members) {
			let name = this.props.members[id]
			let spend = this.props.expenditure[id].spend
			let paied = this.props.expenditure[id].paied
			list.push(
				<ListGroup.Item className="list" key={id}>
					<div className="item">
						<p>{name}</p>
						<p>{spend}</p>
						<p>{paied}</p>
					</div>
				</ListGroup.Item>
			)
		}

		return (
			<Card shadow={20} className="card">
				<Card.Body>
					<Card.Title>지출 내역</Card.Title>
				</Card.Body>
				<ListGroup className="list-group-flush">
					<ListGroup.Item className="list">
						<div className="item">
							<p>이름</p>
							<p>지출</p>
							<p>결제</p>
						</div>
					</ListGroup.Item>
					{list}
				</ListGroup>
			</Card>
		)
	}
}

export default App
