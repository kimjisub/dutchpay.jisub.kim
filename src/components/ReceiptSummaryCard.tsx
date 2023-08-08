import React, { FC, useState } from 'react'
// Components
import { Add, Delete } from '@mui/icons-material'
import { IconButton, Menu, MenuItem } from '@mui/material'
import clsx from 'clsx'

import './ReceiptSummaryCard.scss'

import EditableNumberView from '../elements/EditableNumberView'
// Custom Components
import EditableTextView from '../elements/EditableTextView'
import { MembersType } from '../models/Group'
// Backend
import { bigNumberToCode } from '../utils'
import { CalcReceiptSummaryResult } from '../utils/algorithm/calcReceiptSummary'

export interface ReceiptSummaryCardProps {
	className?: string

	editMode: boolean
	members: MembersType
	receiptSummary: CalcReceiptSummaryResult
	onMembersChange: (members: MembersType) => void
	onMemberClick: (id: string) => void
}
const ReceiptSummaryCard: FC<ReceiptSummaryCardProps> = ({ className, editMode, members, receiptSummary, onMembersChange, onMemberClick }) => {
	const [addName, setAddName] = useState('')
	const [deleteConfirmAction, setDeleteConfirmAction] = useState<null | { anchorEl: EventTarget & HTMLButtonElement; deleteAction: () => void }>(null)

	return (
		<div className={clsx('ReceiptSummaryCard', className)}>
			<h2 className="title">지출 내역</h2>
			<table>
				<thead>
					<tr>
						<td>이름</td>
						<td align="right">지출</td>
						<td align="right">결제</td>
						{editMode ? <td></td> : null}
					</tr>
				</thead>
				<tbody>
					{Object.entries(members).map((data) => {
						const [id, name] = data

						const { spend, paid } = receiptSummary.eachMembers[id]
						return (
							<tr
								key={id}
								onClick={() => {
									if (!editMode) onMemberClick(id)
								}}>
								<td>{name}</td>
								<td align="right">
									<EditableNumberView value={parseFloat(spend.toFixed(2))} editMode={false} />
								</td>
								<td align="right">
									<EditableNumberView value={parseFloat(paid.toFixed(2))} editMode={false} />
								</td>
								{editMode ? (
									<td>
										<IconButton
											size="small"
											disabled={!(spend === 0 && paid === 0)}
											onClick={(event) => {
												setDeleteConfirmAction({
													anchorEl: event.currentTarget,
													deleteAction: () => {
														if (spend === 0 && paid === 0) {
															let _members = { ...members }
															delete _members[id]
															onMembersChange(_members)
														}
													},
												})
											}}>
											<Delete fontSize="inherit" />
										</IconButton>
									</td>
								) : null}
							</tr>
						)
					})}
					{editMode ? (
						<tr>
							<td colSpan={3}>
								<EditableTextView
									label="이름"
									text={addName}
									editMode={true}
									onChange={(text) => {
										setAddName(text)
									}}
								/>
							</td>
							<td>
								<IconButton
									size="small"
									onClick={() => {
										let _members = { ...members }
										_members[bigNumberToCode(new Date().getTime())] = addName
										onMembersChange(_members)
										setAddName('')
									}}>
									<Add fontSize="inherit" />
								</IconButton>
							</td>
						</tr>
					) : null}
				</tbody>
				<tfoot>
					<tr>
						<td>합계</td>
						<td align="right">
							<EditableNumberView value={parseFloat(receiptSummary.spendAmount.toFixed(2))} editMode={false} />
						</td>
						<td align="right">
							<EditableNumberView value={parseFloat(receiptSummary.paidAmount.toFixed(2))} editMode={false} />
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
						deleteConfirmAction?.deleteAction()
						setDeleteConfirmAction(null)
					}}>
					삭제
				</MenuItem>
			</Menu>
		</div>
	)
}

export default ReceiptSummaryCard
