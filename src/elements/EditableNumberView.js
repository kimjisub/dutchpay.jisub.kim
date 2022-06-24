import React, { useState, useEffect } from 'react'
import './EditableView.scss'

// Components
import NumberFormat from 'react-number-format'

export default function (props) {
	const [value, setValue] = useState(props.value)

	return (
		<p className={'EditableView ' + (props.className || '')} style={props.style}>
			{props.editMode ? (
				<NumberFormat
					thousandSeparator={true}
					placeholder={props.label}
					value={value}
					onValueChange={(values) => {
						setValue(values.floatValue)
						if (props.onValueChange) props.onValueChange(values.floatValue)
					}}
				/>
			) : (
				<NumberFormat value={props.value} thousandSeparator={true} displayType={'text'} />
			)}
		</p>
	)
}
