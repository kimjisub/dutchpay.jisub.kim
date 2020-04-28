import React, { useState } from 'react'
import './ExpenditureCard.scss'

// Backend
import { bigNumberToCode } from '../algorithm'

// Components
import NumberFormat from 'react-number-format'
import { Add, Delete } from '@material-ui/icons'
import { Menu, MenuItem, IconButton, Card, Typography, Table, TableHead, TableBody, TableFooter, TableRow, TableCell } from '@material-ui/core'

// Custom Components
import EditableTextView from '../elements/EditableTextView'

export default function (props) {
	console.log('expenditurecard render')
	const [addName, setAddName] = useState('')
	const [deleteConfirmAction, setDeleteConfirmAction] = useState(null)

	let spendSum = 0
	let paiedSum = 0
	const tableBody = Object.entries(props.members).map((data) => {
		let id = data[0]
		let name = data[1]

		const { spend, paied } = props.expenditure[id]
		spendSum += spend
		paiedSum += paied
		return (
			<TableRow
				key={id}
				onClick={() => {
					if (!props.editMode) props.onMemberClick(id)
				}}>
				<TableCell>{name}</TableCell>
				<TableCell align="right">
					<NumberFormat value={spend} displayType={'text'} thousandSeparator={true} />
				</TableCell>
				<TableCell align="right">
					<NumberFormat value={paied} displayType={'text'} thousandSeparator={true} />
				</TableCell>
				{props.editMode ? (
					<TableCell>
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
					</TableCell>
				) : null}
			</TableRow>
		)
	})

	return (
		<Card className="ExpenditureCard" variant="outlined">
			<Typography className="title" variant="h5" component="h2">
				지출 내역
			</Typography>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>이름</TableCell>
						<TableCell align="right">지출</TableCell>
						<TableCell align="right">결제</TableCell>
						{props.editMode ? <TableCell>삭제</TableCell> : null}
					</TableRow>
				</TableHead>
				<TableBody>{tableBody}</TableBody>
				<TableFooter>
					{props.editMode ? (
						<TableRow>
							<TableCell colSpan="3">
								<EditableTextView
									label="이름"
									text={addName}
									editMode={true}
									onChange={(e) => {
										setAddName(e.target.value)
									}}
								/>
							</TableCell>
							<TableCell>
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
							</TableCell>
						</TableRow>
					) : null}

					<TableRow>
						<TableCell>총</TableCell>
						<TableCell align="right">
							<NumberFormat value={parseFloat(spendSum.toFixed(2))} displayType={'text'} thousandSeparator={true} />
						</TableCell>
						<TableCell align="right">
							<NumberFormat value={parseFloat(paiedSum.toFixed(2))} displayType={'text'} thousandSeparator={true} />
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
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
		</Card>
	)
}
