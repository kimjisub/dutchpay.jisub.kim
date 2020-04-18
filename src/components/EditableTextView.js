import React, { Component } from 'react'
import NumberFormat from 'react-number-format'
import './EditableTextView.scss'

class App extends Component {
	render() {
		let view

		if (this.props.type === 'number') {
			if (this.props.editMode) {
				view = (
					<NumberFormat
						thousandSeparator={true}
						placeholder={this.props.label}
						defaultValue={this.props.text}
						onChange={(e) => {
							if (this.props.onChange) this.props.onChange(e)
						}}
					/>
				)
			} else {
				view = <NumberFormat value={this.props.text} thousandSeparator={true} />
			}
		} else {
			if (this.props.editMode) {
				view = (
					<input
						placeholder={this.props.label}
						defaultValue={this.props.text}
						onChange={(e) => {
							if (this.props.onChange) this.props.onChange(e)
						}}
					/>
				)
			} else {
				view = this.props.text
			}
		}

		return (
			<p className="EditableTextView" style={this.props.style}>
				{view}
			</p>
		)
	}
}

export default App
