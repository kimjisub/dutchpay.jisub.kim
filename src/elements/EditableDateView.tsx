import React, { FC } from 'react'
import clsx from 'clsx'
import { format } from 'date-fns'

import './EditableView.scss'

export interface EditableDateViewProps {
	className?: string

	editMode: boolean
	label?: string
	date: Date
	formatPattern: string
	onValueChange?: (date: Date) => void
	onBlur?: (date: Date) => void
}

const EditableDateView: FC<EditableDateViewProps> = ({
	className,

	editMode,
	label,
	date,
	formatPattern,
	onValueChange,
	onBlur,
}) => {
	return (
		<span className={clsx('EditableView', className)}>
			{editMode ? (
				<input
					type="datetime-local"
					placeholder={label}
					value={format(date, "yyyy-MM-dd'T'HH:mm")}
					onChange={(e) => {
						if (onValueChange) onValueChange(new Date(e.target.value))
					}}
				/>
			) : (
				format(date, formatPattern || "yyyy-MM-dd'T'HH:mm")
			)}
		</span>
	)
}
export default EditableDateView
