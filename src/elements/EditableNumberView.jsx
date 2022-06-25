import React, { useState } from 'react'
import './EditableView.scss'

// Components
import NumberFormat from 'react-number-format'

function format(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function EditableNumberView(props) {
	const value = props.value || 0
	return (
		<p className={'EditableView ' + (props.className || '')} style={props.style}>
			{props.editMode ? (
				<input
					placeholder={props.label}
					value={format(value)}
					onChange={(e) => {
						if (props.onValueChange) props.onValueChange(parseInt(e.target.value.replaceAll(',', '')) || 0)
					}}
				/>
			) : (
				format(value)
			)}
		</p>
	)
}
