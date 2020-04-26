import React from 'react'
import NumberFormat from 'react-number-format'
import './EditableNumberView.scss'

export default function (props) {
	let view

	if (props.editMode) {
		view = (
			<NumberFormat
				thousandSeparator={true}
				placeholder={props.label}
				defaultValue={props.value}
				onValueChange={(values) => {
					if (props.onValueChange) props.onValueChange(values)
				}}
			/>
		)
	} else {
		view = <NumberFormat value={props.value} thousandSeparator={true} displayType={'text'} />
	}

	return (
		<p className={'EditableNumberView ' + props.className} style={props.style}>
			{view}
		</p>
	)
}
