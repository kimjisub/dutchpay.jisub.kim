import React, { useState } from 'react'
import './ExpenditureCard.scss'

// Backend
import { bigNumberToCode } from '../algorithm'

// Components
import NumberFormat from 'react-number-format'
import { Add, Delete } from '@material-ui/icons'
import { Menu, MenuItem, IconButton, Typography } from '@material-ui/core'

// Custom Components
import EditableTextView from '../elements/EditableTextView'

export default function ExpenditureCard(props) {
	const [addName, setAddName] = useState('')
	const [deleteConfirmAction, setDeleteConfirmAction] = useState(null)

	let spendSum = 0
	let paiedSum = 0

	return (
		<div className="ExpenditureCard">
			<Typography className="title" variant="h5" component="h2">
				지출 내역
			</Typography>
			<table>
				<thead>
					<tr>
						<td>이름</td>
						<td align="right">지출</td>
						<td align="right">결제</td>
						{props.editMode ? <td></td> : null}
					</tr>
				</thead>
				<tbody>
					{Object.entries(props.members).map((data) => {
						let id = data[0]
						let name = data[1]

						const { spend, paied } = props.expenditure[id]
						spendSum += spend
						paiedSum += paied
						return (
							<tr
								key={id}
								onClick={() => {
									if (!props.editMode) props.onMemberClick(id)
								}}>
								<td>{name}</td>
								<td align="right">
									<NumberFormat value={spend} displayType={'text'} thousandSeparator={true} />
								</td>
								<td align="right">
									<NumberFormat value={paied} displayType={'text'} thousandSeparator={true} />
								</td>
								{props.editMode ? (
									<td>
										<IconButton
											size="small"
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
					{props.editMode ? (
						<tr>
							<td colSpan="3">
								<EditableTextView
									label="이름"
									text={addName}
									editMode={true}
									onChange={(e) => {
										setAddName(e.target.value)
									}}
								/>
							</td>
							<td>
								<IconButton
									size="small"
									onClick={() => {
										let members = Object.assign({}, props.members)
										members[bigNumberToCode(new Date())] = addName
										props.onMembersChange(members)
										setAddName('')
									}}>
									<Add />
								</IconButton>
							</td>
						</tr>
					) : null}
				</tbody>
				<tfoot>
					<tr>
						<td>합계</td>
						<td align="right">
							<NumberFormat value={parseFloat(spendSum.toFixed(2))} displayType={'text'} thousandSeparator={true} />
						</td>
						<td align="right">
							<NumberFormat value={parseFloat(paiedSum.toFixed(2))} displayType={'text'} thousandSeparator={true} />
						</td>
					</tr>
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
		</div>
	)
}
