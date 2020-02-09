import React, { Component } from 'react'
import { Card } from 'react-bootstrap'

class App extends Component {
	render() {
		return (
			<Card shadow={0} className="card">
				<Card.Body>
					<Card.Title>정산</Card.Title>
					<Card.Text></Card.Text>
				</Card.Body>
			</Card>
		)
	}
}

export default App
