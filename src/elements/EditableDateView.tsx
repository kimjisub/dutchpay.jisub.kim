import React, { FC } from 'react'
import clsx from 'clsx'
import { format } from 'date-fns'
import styled from 'styled-components'

const EditableViewContainer = styled.span`
	margin: 0px;
	padding: 0px;
`

const Input = styled.input`
	font-size: inherit;
	width: inherit;
	font-weight: inherit;
	font-family: inherit;
	outline: none;
	border: none;
	background: rgb(215, 215, 215);
	border-radius: 10px;
	padding: 3px 3px 3px 10px;
	transition: 0.3s;
	width: 100%;
	box-sizing: border-box;

	&:focus {
		background: rgb(179, 179, 179);
	}
`

export interface EditableDateViewProps {
	className?: string
	editMode: boolean
	label?: string
	date: Date
	formatPattern: string
	onValueChange?: (date: Date) => void
	onBlur?: (date: Date) => void
}

const EditableDateView: FC<EditableDateViewProps> = ({ className, editMode, label, date, formatPattern, onValueChange, onBlur }) => {
	return (
		<EditableViewContainer className={clsx('EditableView', className)}>
			{editMode ? (
				<Input
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
		</EditableViewContainer>
	)
}

export default EditableDateView
