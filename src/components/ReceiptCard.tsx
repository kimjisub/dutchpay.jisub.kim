import React, { FC } from 'react'
// Components
import { ExpandMore } from '@mui/icons-material'
import { Accordion, AccordionSummary, CardActionArea } from '@mui/material'
import clsx from 'clsx'
import { format } from 'date-fns'
import styled from 'styled-components'

import EditableNumberView from '../elements/EditableNumberView'
import { MembersType } from '../models/Group'
import { Receipt } from '../models/Receipt'

export interface ReceiptCardProps {
	className?: string

	receipt: Receipt
	members: MembersType
	expanded: boolean
	onExpanded?: () => void
	onClick?: () => void
}

const ReceiptCard: FC<ReceiptCardProps> = ({ className, receipt, members, expanded, onExpanded, onClick }) => {
	let totalPrice = 0
	let paidPrice = 0

	let itemList = receipt.items.map((item, i) => {
		totalPrice += item.price
		return (
			<tr key={i}>
				<td align="left">{item.name}</td>
				<td align="center">{item.buyers.length}명</td>
				<td align="right">
					<EditableNumberView value={parseFloat(item.price.toFixed(2))} editMode={false} />
				</td>
			</tr>
		)
	})

	let payerList = []
	for (let id in receipt.payers) {
		let price = receipt.payers[id]
		paidPrice += price
		payerList.push(
			<tr key={id} className="green">
				<td align="left">결제</td>
				<td align="center">{members[id]}</td>
				<td align="right">
					<EditableNumberView value={parseFloat(price.toFixed(2))} editMode={false} />
				</td>
			</tr>
		)
	}

	const diff = totalPrice - paidPrice
	let diffRow = null

	if (diff > 0)
		diffRow = (
			<tr className="red">
				<td align="left">미결제</td>
				<td align="center"></td>
				<td align="right">
					<EditableNumberView value={parseFloat(diff.toFixed(2))} editMode={false} />
				</td>
			</tr>
		)
	else if (diff < 0)
		diffRow = (
			<tr className="red">
				<td align="left">초과결제</td>
				<td align="center"></td>
				<td align="right">
					<EditableNumberView value={parseFloat(diff.toFixed(2))} editMode={false} />
				</td>
			</tr>
		)
	return (
		<StyledReceiptCard variant="outlined" className={clsx('ReceiptCard', className)} expanded={expanded} onChange={onExpanded}>
			<AccordionSummary expandIcon={<ExpandMore />}>
				<Summary>
					<Left>
						<p className="title">{receipt.name}</p>
						<p className="date">{format(receipt.timestamp, 'MM/dd HH:mm')}</p>
					</Left>
					<Price className={clsx('price', diff !== 0 ? 'red' : '')}>
						<EditableNumberView value={parseFloat(totalPrice.toFixed(2))} editMode={false} />
					</Price>
				</Summary>
			</AccordionSummary>
			<StyledCardActionArea
				onClick={() => {
					if (onClick) onClick()
				}}>
				<TableWrapper>
					<table>
						<thead>
							<tr>
								<td align="left">내용</td>
								<td align="center">인원</td>
								<td align="right">금액</td>
							</tr>
						</thead>

						<tbody>
							{itemList}
							{payerList}
							{diffRow}
						</tbody>
						<tfoot>
							<tr>
								<td align="left"></td>
								<td align="center"></td>
								<td align="right">
									<EditableNumberView value={parseFloat(totalPrice.toFixed(2))} editMode={false} />
								</td>
							</tr>
						</tfoot>
					</table>
				</TableWrapper>
			</StyledCardActionArea>
		</StyledReceiptCard>
	)
}

export default ReceiptCard

const StyledReceiptCard = styled(Accordion)`
	border: none !important;
	background-color: #fff;
	transition: 0.3s !important;
	border-radius: 30px !important;

	&.Mui-expanded {
		box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
	}
	&:before {
		background-color: transparent !important;
	}
`

const StyledCardActionArea = styled(CardActionArea)`
	border-radius: 0 0 30px 30px;
`

const Summary = styled.div`
	width: 100%;
	display: flex;
`

const Left = styled.div`
	flex-grow: 1;

	.title {
		font-size: 1rem;
		font-weight: bold;
		margin: 0;
	}
	.date {
		font-size: 0.5rem;
		font-weight: bold;
		margin: 0;
	}
`

const Price = styled.div`
	align-self: center;
	margin: 0;
	font-weight: bold;
	flex-grow: 0;
`

const TableWrapper = styled.div`
	margin: 0px 20px 10px 20px;
`
