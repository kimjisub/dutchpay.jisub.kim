import React, { FC } from 'react'
import clsx from 'clsx'

import './TransferCard.scss'

// Components
import EditableNumberView from '../elements/EditableNumberView'
import { MembersType } from '../models/Group'
import { Transfer } from '../models/Transfer'

export interface TransferCardProps {
	className?: string

	transfers: { [key in string]: Transfer }
	transfersNeeded: Omit<Transfer, 'timestamp'>[] | null
	members: MembersType
}

const TransferCard: FC<TransferCardProps> = ({ className, transfers, transfersNeeded, members }) => {
	return (
		<div className={clsx('TransferCard', className)}>
			<h2 className="title">정산</h2>

			<div id="body">
				{transfersNeeded ? (
					transfersNeeded.map((data, i) => {
						let from = data.from
						let to = data.to
						let value = data.amount

						return (
							<p key={i}>
								{members[from]}
								<span className="small">(이)가</span>
								{members[to]}
								<span className="small">에게</span>
								<EditableNumberView value={value} editMode={false} />
								<span className="small">원</span>
							</p>
						)
					})
				) : (
					<p>소비 금액과 결제 금액이 일치하지 않는 영수증이 있습니다.</p>
				)}
				{Object.values(transfers).map((data, i) => {
					let from = data.from
					let to = data.to
					let value = data.amount

					return (
						<p key={i}>
							{members[from]}
							<span className="small">(이)가</span>
							{members[to]}
							<span className="small">에게</span>
							<EditableNumberView value={value} editMode={false} />
							<span className="small">원 보냄</span>
						</p>
					)
				})}
			</div>
		</div>
	)
}

export default TransferCard
