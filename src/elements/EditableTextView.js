import React from 'react'
import './EditableView.scss'

export default function (props) {
	return (
		<p className={'EditableView ' + (props.className || '')} style={props.style}>
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
		</p>
	)
}
