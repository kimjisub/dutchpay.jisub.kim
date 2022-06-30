export type ReceiptItemType = {
	buyers: string[]
	name: string
	price: number
}

export type ReceiptType = {
	name: string
	items: ReceiptItemType[]
	payers: { [key in string]: number }
	timestamp: Date
}
