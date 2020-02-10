import React, { Component } from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import { Textfield, Button, IconButton, Menu, MenuItem } from 'react-mdl'
import { bigNumberToCode } from '../algorithm'
import './ExpenditureCard.css'

class App extends Component {
	constructor() {
		super()
		this.state = {
			addName: ''
		}
	}

	render() {
		return (
			<Card shadow={20} className="card">
				<Card.Body>
					<Card.Title>지출 내역</Card.Title>
					<ListGroup className="list-group-flush" variant="flush">
						<ListGroup.Item className="list">
							<div className="item">
								<p>이름</p>
								<p>지출</p>
								<p>결제</p>
							</div>
						</ListGroup.Item>
						{Object.entries(this.props.members).map(data => {
							let id = data[0]
							let name = data[1]

							let spend = this.props.expenditure[id].spend
							let paied = this.props.expenditure[id].paied
							return (
								<ListGroup.Item className="list" key={id} action={!this.props.editMode}>
									<div className="item">
										<p>{name}</p>
										<p>{spend}</p>
										<p>{paied}</p>
										{this.props.editMode ? (
											<p>
												<IconButton name="delete" id={'member-delete-' + id} disabled={!(spend === 0 && paied === 0)} />
												<Menu target={'member-delete-' + id}>
													<MenuItem
														onClick={() => {
															if (spend === 0 && paied === 0) {
																let members = Object.assign({}, this.props.members)
																delete members[id]
																this.props.onMembersChange(members)
															}
														}}>
														삭제
													</MenuItem>
												</Menu>
											</p>
										) : null}
									</div>
								</ListGroup.Item>
							)
						})}
						{this.props.editMode ? (
							<ListGroup.Item className="list">
								<Textfield
									className="mdl-textfield-small"
									id="textfield-add-name"
									label="이름"
									value={this.state.addName}
									onChange={e => {
										this.setState({ addName: e.target.value })
									}}
									style={{ width: '100px' }}
								/>
								<Button
									ripple
									onClick={() => {
										let members = Object.assign({}, this.props.members)
										members[bigNumberToCode(new Date())] = this.state.addName
										this.props.onMembersChange(members)
										this.setState({ addName: '' })
									}}>
									추가
								</Button>
							</ListGroup.Item>
						) : null}
					</ListGroup>
				</Card.Body>
			</Card>
		)
	}
}

export default App
