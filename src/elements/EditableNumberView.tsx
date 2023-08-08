import React, { FC } from 'react'
import styled from 'styled-components'

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

const EditableView = styled.span`
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

const Paragraph = styled.span`
	font-size: inherit;
`

const EditableNumberView: FC<EditableNumberViewProps> = ({
	className,

	editMode,
	label,
	value = 0,
	onValueChange,
	onBlur,
}) => {
	return (
		<EditableView className={className}>
			{editMode ? (
				<Input
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
				<Paragraph>{format(value)}</Paragraph>
			)}
		</EditableView>
	)
}

export default EditableNumberView
