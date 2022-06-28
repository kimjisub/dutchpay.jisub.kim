import React from 'react'
import clsx from 'clsx'
import './EditableView.scss'
import { format } from 'date-fns'

export default function EditableDateView(props) {
	return (
		<span className={clsx('EditableView', props.className)} style={props.style}>
			{props.editMode ? (
				<input
					type="datetime-local"
					placeholder={props.label}
					value={format(props.date, "yyyy-MM-dd'T'HH:mm")}
					onChange={(e) => {
						if (props.onValueChange) props.onValueChange(new Date(e.target.value))
					}}
				/>
			) : (
				format(props.date, 'yyyy-MM-dd')
			)}
		</span>
	)
}
