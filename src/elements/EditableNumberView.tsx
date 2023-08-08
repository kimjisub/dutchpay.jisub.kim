import React, { FC } from 'react'
import clsx from 'clsx'

import './EditableView.scss'

function format(value: number) {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export interface EditableNumberViewProps {
	className?: string

	editMode: boolean
	label?: string
	value: number
	onValueChange?: (value: number) => void
	onBlur?: (value: number) => void
}

const EditableNumberView: FC<EditableNumberViewProps> = ({
	className,

	editMode,
	label,
	value = 0,
	onValueChange,
	onBlur,
}) => {
	return (
		<span className={clsx('EditableView', className)}>
			{editMode ? (
				<input
					placeholder={label}
					value={format(value)}
					pattern="\d*"
					onChange={(e) => {
						if (onValueChange) onValueChange(parseInt(e.target.value.replaceAll(',', '')) || 0)
					}}
					onBlur={(e) => {
						if (onBlur) onBlur(parseInt(e.target.value.replaceAll(',', '')) || 0)
					}}
				/>
			) : (
				format(value)
			)}
		</span>
	)
}
export default EditableNumberView
