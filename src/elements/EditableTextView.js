import React from 'react'
import './EditableTextView.scss'

export default function (props) {
	let view

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

	return (
		<p className={'EditableTextView ' + (props.className || '')} style={props.style}>
			{view}
		</p>
	)
}
