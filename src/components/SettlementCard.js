import React, { Component } from 'react'
import NumberFormat from 'react-number-format'
import './SettlementCard.scss'

class App extends Component {
	render() {
		return (
			<main className="SettlementCard card">
				<div className="title">정산</div>

				<div id="body">
					{this.props.settlement.map((data, i) => {
						let from = data.from
						let to = data.to
						let value = data.value

						return (
							<p key={i}>
								{this.props.members[from]}
								<span className="small">(이)가</span>
								{this.props.members[to]}
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
}

export default App
