import React, { useState } from 'react'
import './EditableView.scss'

// Components
import NumberFormat from 'react-number-format'

export default function EditableNumberView(props) {
	return (
		<p className={'EditableView ' + (props.className || '')} style={props.style}>
			{props.editMode ? (
				<NumberFormat
					thousandSeparator={true}
					placeholder={props.label}
					value={props.value || 0}
					onValueChange={(values) => {
						if (props.onValueChange) props.onValueChange(values.floatValue)
					}}
				/>
			) : (
				<NumberFormat value={props.value} thousandSeparator={true} displayType={'text'} />
			)}
		</p>
	)
}
