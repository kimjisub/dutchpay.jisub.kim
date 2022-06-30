import React from 'react'
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

const EditableNumberView = React.forwardRef<HTMLDivElement, EditableNumberViewProps>((props, ref) => {
	const value = props.value || 0
	return (
		<span className={clsx('EditableView', props.className)}>
			{props.editMode ? (
				<input
					placeholder={props.label}
					value={format(value)}
					pattern="\d*"
					onChange={(e) => {
						if (props.onValueChange) props.onValueChange(parseInt(e.target.value.replaceAll(',', '')) || 0)
					}}
					onBlur={(e) => {
						if (props.onBlur) props.onBlur(parseInt(e.target.value.replaceAll(',', '')) || 0)
					}}
				/>
			) : (
				format(value)
			)}
		</span>
	)
})
export default EditableNumberView
