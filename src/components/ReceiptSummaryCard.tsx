import React, { FC, useState } from 'react'
// Components
import { Add, Delete } from '@mui/icons-material'
import { IconButton, Menu, MenuItem } from '@mui/material'
import clsx from 'clsx'
import styled from 'styled-components'

import EditableNumberView from '../elements/EditableNumberView'
import EditableTextView from '../elements/EditableTextView'
import { MembersType } from '../models/Group'
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
		<ReceiptSummaryCardContainer className={clsx('ReceiptSummaryCard', className)}>
			<Title>지출 내역</Title>
			<StyledTable>
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
			</StyledTable>
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
		</ReceiptSummaryCardContainer>
	)
}

export default ReceiptSummaryCard

const ReceiptSummaryCardContainer = styled.div`
	padding: 20px;
	margin: 10px;
	box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
	border-radius: 30px;
`

const Title = styled.h2`
	color: #ffb14d;
	font-size: 1.2rem;
	font-weight: bold;
	padding: 10px;
	margin: 0;
`

const StyledTable = styled.table`
	tbody {
		tr {
			cursor: pointer;
			transition-duration: 0.1s;
			&:hover {
				background: #bdbdbd;
			}
			&:active {
				background: #ababab;
			}
		}
	}
`
