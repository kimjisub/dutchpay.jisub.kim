import React from 'react'
import clsx from 'clsx'
import './EditableView.scss'
import { format } from 'date-fns'

export interface EditableDateViewProps {
	className?: string

	editMode: boolean
	label: string
	date: Date
	format: string
	onValueChange?: (date: Date) => void
	onBlur?: (date: Date) => void
}

const EditableDateView = React.forwardRef<HTMLDivElement, EditableDateViewProps>((props, ref) => {
	return (
		<span className={clsx('EditableView', props.className)}>
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
				format(props.date, props.format || "yyyy-MM-dd'T'HH:mm")
			)}
		</span>
	)
})
export default EditableDateView
