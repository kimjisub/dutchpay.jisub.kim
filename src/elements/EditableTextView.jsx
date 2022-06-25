import React from 'react'
import './EditableView.scss'

export default function EditableTextView(props) {
	return (
		<span className={'EditableView ' + (props.className || '')} style={props.style}>
			{props.editMode ? (
				<input
					placeholder={props.label}
					value={props.text}
					onChange={(e) => {
						if (props.onChange) props.onChange(e)
					}}
				/>
			) : (
				props.text
			)}
		</span>
	)
}
