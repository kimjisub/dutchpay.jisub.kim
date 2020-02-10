import React, { Component } from 'react'
import './EditableTextView.css'

class App extends Component {
	render() {
		return (
			<p className="editable-textview" style={this.props.style}>
				{this.props.editMode ? (
					<input
						placeholder={this.props.label}
						defaultValue={this.props.text}
						onChange={e => {
							if (this.props.onChange) this.props.onChange(e)
						}}
					/>
				) : (
					this.props.text
				)}
			</p>
		)
	}
}

export default App
