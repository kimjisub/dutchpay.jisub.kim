import React, { Component } from 'react'
import { Textfield, IconButton, Menu, MenuItem } from 'react-mdl'
import NumberFormat from 'react-number-format'
import { bigNumberToCode } from '../algorithm'
import './ExpenditureCard.scss'

class App extends Component {
	constructor() {
		super()
		this.state = {
			addName: '',
		}
	}

	render() {
		return (
			<main className="ExpenditureCard card">
				<div className="title">지출 내역</div>
				<table>
					<thead>
						<tr>
							<th>이름</th>
							<th>지출</th>
							<th>결제</th>
							{this.props.editMode ? <th>삭제</th> : null}
						</tr>
					</thead>
					<tbody>
						{Object.entries(this.props.members).map((data) => {
							let id = data[0]
							let name = data[1]

							const { spend, paied } = this.props.expenditure[id]
							return (
								<tr
									key={id}
									onClick={() => {
										if (!this.props.editMode) this.props.onMemberClick(id)
									}}>
									<td>{name}</td>
									<td>
										<NumberFormat value={spend} displayType={'text'} thousandSeparator={true} />
									</td>
									<td>
										<NumberFormat value={paied} displayType={'text'} thousandSeparator={true} />
									</td>
									{this.props.editMode ? (
										<td>
											<IconButton name="close" id={'member-delete-' + id} disabled={!(spend === 0 && paied === 0)} />
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
										</td>
									) : null}
								</tr>
							)
						})}
					</tbody>
					<tfoot>
						{this.props.editMode ? (
							<tr>
								<th colSpan="3">
									<Textfield
										className="mdl-textfield-small textfield-add-name"
										label="이름"
										value={this.state.addName}
										onChange={(e) => {
											this.setState({ addName: e.target.value })
										}}
									/>
								</th>
								<th>
									<IconButton
										ripple
										name="add"
										onClick={() => {
											let members = Object.assign({}, this.props.members)
											members[bigNumberToCode(new Date())] = this.state.addName
											this.props.onMembersChange(members)
											this.setState({ addName: '' })
										}}>
										추가
									</IconButton>
								</th>
							</tr>
						) : null}
					</tfoot>
				</table>
			</main>
		)
	}
}

export default App
