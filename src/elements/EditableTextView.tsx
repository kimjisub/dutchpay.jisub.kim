import React, { FC } from 'react'
import clsx from 'clsx'
import styled from 'styled-components'

const EditableView = styled.span`
	margin: 0px;
	padding: 0px;
`

const EditableInput = styled.input`
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

const EditableParagraph = styled.p`
	font-size: inherit;
`

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
		<EditableView className={clsx(className)}>
			{editMode ? (
				<EditableInput
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
				<EditableParagraph>{text}</EditableParagraph>
			)}
		</EditableView>
	)
}

export default EditableTextView
