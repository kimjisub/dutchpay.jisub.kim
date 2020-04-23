import React, { useState, useEffect } from 'react'
import { Menu, MenuItem } from '@material-ui/core'
import { Textfield, IconButton } from 'react-mdl'
import NumberFormat from 'react-number-format'
import { bigNumberToCode } from '../algorithm'
import './ExpenditureCard.scss'

export default function (props) {
	const [addName, setAddName] = useState('')
	const [deleteConfirmAction, setDeleteConfirmAction] = useState(null)

	return (
		<main className="ExpenditureCard card">
			<div className="title">지출 내역</div>
			<table>
				<thead>
					<tr>
						<th>이름</th>
						<th>지출</th>
						<th>결제</th>
						{props.editMode ? <th>삭제</th> : null}
					</tr>
				</thead>
				<tbody>
					{Object.entries(props.members).map((data) => {
						let id = data[0]
						let name = data[1]

						const { spend, paied } = props.expenditure[id]
						return (
							<tr
								key={id}
								onClick={() => {
									if (!props.editMode) props.onMemberClick(id)
								}}>
								<td>{name}</td>
								<td>
									<NumberFormat value={spend} displayType={'text'} thousandSeparator={true} />
								</td>
								<td>
									<NumberFormat value={paied} displayType={'text'} thousandSeparator={true} />
								</td>
								{props.editMode ? (
									<td>
										<IconButton
											name="close"
											id={'member-delete-' + id}
											disabled={!(spend === 0 && paied === 0)}
											onClick={(event) => {
												setDeleteConfirmAction({
													anchorEl: event.currentTarget,
													deleteAction: () => {
														if (spend === 0 && paied === 0) {
															let members = Object.assign({}, props.members)
															delete members[id]
															props.onMembersChange(members)
														}
													},
												})
											}}
										/>
									</td>
								) : null}
							</tr>
						)
					})}
				</tbody>
				<tfoot>
					{props.editMode ? (
						<tr>
							<th colSpan="3">
								<Textfield
									className="mdl-textfield-small textfield-add-name"
									label="이름"
									value={addName}
									onChange={(e) => {
										setAddName(e.target.value)
									}}
								/>
							</th>
							<th>
								<IconButton
									ripple
									name="add"
									onClick={() => {
										let members = Object.assign({}, props.members)
										members[bigNumberToCode(new Date())] = addName
										props.onMembersChange(members)
										setAddName('')
									}}>
									추가
								</IconButton>
							</th>
						</tr>
					) : null}
				</tfoot>
			</table>
			<Menu
				anchorEl={deleteConfirmAction?.anchorEl}
				keepMounted
				open={deleteConfirmAction != null}
				onClose={() => {
					setDeleteConfirmAction(null)
				}}>
				<MenuItem
					onClick={() => {
						setDeleteConfirmAction(null)
						deleteConfirmAction.deleteAction()
					}}>
					삭제
				</MenuItem>
			</Menu>
		</main>
	)
}
