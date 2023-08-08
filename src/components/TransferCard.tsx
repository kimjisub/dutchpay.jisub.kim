import React, { FC, useCallback } from 'react'
import { Add } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import styled from 'styled-components'

import { addTransfer } from '../db/firestore'
import EditableNumberView from '../elements/EditableNumberView'
import { MembersType } from '../models/Group'
import { Transfer } from '../models/Transfer'

export interface TransferCardProps {
	className?: string
	transfers: { [key in string]: Transfer }
	transfersNeeded: Omit<Transfer, 'timestamp'>[] | null
	members: MembersType
	havePermission: boolean
	groupId: string
}

const TransferCardWrapper = styled.div`
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

const Body = styled.div`
	text-align: center;
	color: #495057;
`

const Text = styled.p`
	font-size: 1rem;
	margin: 0;
	font-weight: bold;
	padding: 5px;
`

const SmallText = styled.span`
	color: #7f868b;
	margin: 0px 5px 0px 0px;
	font-size: 0.6rem;
`

const Separator = styled.div`
	height: 1px; // 선의 두께
	width: 100%; // 선의 길이
	background-color: #e0e0e0; // 선의 색상
`

const TransferCard: FC<TransferCardProps> = ({ className, groupId, transfers, transfersNeeded, members, havePermission }) => {
	const onClickAdd = useCallback(() => {
		const fromName = prompt('보내는 사람')
		const toName = prompt('받는 사람')
		const amount = prompt('금액')

		if (!fromName || !toName || !amount) {
			return alert('입력이 잘못되었습니다.')
		}
		const from = Object.keys(members).find((key) => members[key] === fromName)
		const to = Object.keys(members).find((key) => members[key] === toName)

		if (!from || !to) {
			return alert('입력이 잘못되었습니다.')
		}

		addTransfer(groupId, {
			from,
			to,
			amount: Number(amount),
			timestamp: new Date(),
		})
	}, [transfers, members])

	return (
		<TransferCardWrapper className={className}>
			<Title>정산</Title>
			{havePermission && (
				<IconButton size="small" onClick={onClickAdd}>
					<Add fontSize="inherit" />
				</IconButton>
			)}

			<Body>
				{transfersNeeded ? (
					transfersNeeded.map((data, i) => {
						let from = data.from
						let to = data.to
						let value = data.amount

						return (
							<Text key={i}>
								{members[from]}
								<SmallText>(이)가</SmallText>
								{members[to]}
								<SmallText>에게</SmallText>
								<EditableNumberView value={value} editMode={false} />
								<SmallText>원</SmallText>
							</Text>
						)
					})
				) : (
					<Text>소비 금액과 결제 금액이 일치하지 않는 영수증이 있습니다.</Text>
				)}
				{transfersNeeded && transfersNeeded.length !== 0 && <Separator />}
				{Object.values(transfers).map((data, i) => {
					let from = data.from
					let to = data.to
					let value = data.amount

					return (
						<Text key={i}>
							{members[from]}
							<SmallText>(이)가</SmallText>
							{members[to]}
							<SmallText>에게</SmallText>
							<EditableNumberView value={value} editMode={false} />
							<SmallText>원 보냄</SmallText>
						</Text>
					)
				})}
			</Body>
		</TransferCardWrapper>
	)
}

export default TransferCard
