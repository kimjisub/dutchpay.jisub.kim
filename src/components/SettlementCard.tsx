import React, { FC } from 'react'
import clsx from 'clsx'

import './SettlementCard.scss'

import { CalcSettlementResultType } from '../algorithm'
// Components
import EditableNumberView from '../elements/EditableNumberView'
import { MembersType } from '../types/MembersType'

export interface SettlementCardProps {
	className?: string

	settlement: CalcSettlementResultType
	members: MembersType
}

const SettlementCard: FC<SettlementCardProps> = ({ className, settlement, members }) => {
	return (
		<div className={clsx('SettlementCard', className)}>
			<h2 className="title">정산</h2>

			<div id="body">
				{settlement.map((data, i) => {
					let from = data.from
					let to = data.to
					let value = data.value

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
				})}
			</div>
		</div>
	)
}

export default SettlementCard
