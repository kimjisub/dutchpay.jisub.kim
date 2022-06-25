import React from 'react'
import clsx from 'clsx'
import './EditableView.scss'

export default function EditableTextView(props) {
	return (
		<span className={clsx('EditableView', props.className)} style={props.style}>
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
