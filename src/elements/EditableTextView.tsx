import React, { FC } from 'react'
import clsx from 'clsx'

import './EditableView.scss'

export interface EditableTextViewProps {
	className?: string

	editMode: boolean
	label?: string
	text: string
	onChange?: (text: string) => void
	onBlur?: (text: string) => void
}

const EditableTextView: FC<EditableTextViewProps> = ({ className, editMode, label, text, onChange, onBlur }) => {
	return (
		<span className={clsx('EditableView', className)}>
			{editMode ? (
				<input
					placeholder={label}
					value={text}
					onChange={(e) => {
						if (onChange) onChange(e.target.value)
					}}
					onBlur={(e) => {
						if (onBlur) onBlur(e.target.value)
					}}
				/>
			) : (
				text
			)}
		</span>
	)
}

export default EditableTextView
