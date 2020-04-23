import React from 'react'
import NumberFormat from 'react-number-format'
import './EditableTextView.scss'

export default function (props) {
	let view

	if (props.type === 'number') {
		if (props.editMode) {
			view = (
				<NumberFormat
					thousandSeparator={true}
					placeholder={props.label}
					defaultValue={props.text}
					onChange={(e) => {
						if (props.onChange) props.onChange(e)
					}}
				/>
			)
		} else {
			view = <NumberFormat value={props.text} thousandSeparator={true} />
		}
	} else {
		if (props.editMode) {
			view = (
				<input
					placeholder={props.label}
					defaultValue={props.text}
					onChange={(e) => {
						if (props.onChange) props.onChange(e)
					}}
				/>
			)
		} else {
			view = props.text
		}
	}

	return (
		<p className="EditableTextView" style={props.style}>
			{view}
		</p>
	)
}
