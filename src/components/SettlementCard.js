import React from 'react'
import './SettlementCard.scss'

// Components
import NumberFormat from 'react-number-format'
import { Typography } from '@material-ui/core'

export default function (props) {
	return (
		<div className="SettlementCard" variant="outlined">
			<Typography className="title" variant="h5" component="h2">
				정산
			</Typography>

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
		</div>
	)
}
