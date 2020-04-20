import React, { useState, useEffect } from 'react'
import NumberFormat from 'react-number-format'
import './SettlementCard.scss'

export default function (props) {
	return (
		<main className="SettlementCard card">
			<div className="title">정산</div>

			<div id="body">
				{props.settlement.map((data, i) => {
					let from = data.from
					let to = data.to
					let value = data.value

					return (
						<p key={i}>
							{props.members[from]}
							<span className="small">(이)가</span>
							{props.members[to]}
							<span className="small">에게</span>
							<NumberFormat value={value} displayType={'text'} thousandSeparator={true} />
							<span className="small">원</span>
						</p>
					)
				})}
			</div>
		</main>
	)
}
