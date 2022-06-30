import React from 'react'
import clsx from 'clsx'
import './EditableView.scss'

export interface EditableTextViewProps {
	className?: string

	editMode: boolean
	label: string
	text: string
	onChange?: (text: string) => void
	onBlur?: (text: string) => void
}

const EditableTextView = React.forwardRef<HTMLDivElement, EditableTextViewProps>((props, ref) => {
	return (
		<span className={clsx('EditableView', props.className)} ref={ref}>
			{props.editMode ? (
				<input
					placeholder={props.label}
					value={props.text}
					onChange={(e) => {
						if (props.onChange) props.onChange(e.target.value)
					}}
					onBlur={(e) => {
						if (props.onBlur) props.onBlur(e.target.value)
					}}
				/>
			) : (
				props.text
			)}
		</span>
	)
})

export default EditableTextView
