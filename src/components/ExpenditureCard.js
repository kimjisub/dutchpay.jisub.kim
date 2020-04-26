import React, { useState } from 'react'
import './ExpenditureCard.scss'

// Backend
import { bigNumberToCode } from '../algorithm'

// Components
import NumberFormat from 'react-number-format'
import { Add, Delete } from '@material-ui/icons'
import { Menu, MenuItem, IconButton } from '@material-ui/core'

// Custom Components
import EditableTextView from '../elements/EditableTextView'

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
											}}>
											<Delete />
										</IconButton>
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
								<EditableTextView
									label="이름"
									text={addName}
									editMode={true}
									onChange={(e) => {
										setAddName(e.target.value)
									}}
								/>
							</th>
							<th>
								<IconButton
									onClick={() => {
										let members = Object.assign({}, props.members)
										members[bigNumberToCode(new Date())] = addName
										props.onMembersChange(members)
										setAddName('')
									}}>
									<Add />
								</IconButton>
							</th>
						</tr>
					) : null}
				</tfoot>
			</table>
			<Menu
				keepMounted
				anchorEl={deleteConfirmAction?.anchorEl}
				open={deleteConfirmAction != null}
				onClose={() => {
					setDeleteConfirmAction(null)
				}}>
				<MenuItem
					onClick={() => {
						deleteConfirmAction.deleteAction()
						setDeleteConfirmAction(null)
					}}>
					삭제
				</MenuItem>
			</Menu>
		</main>
	)
}
