export interface ReceiptItem {
	buyers: string[]
	name: string
	price: number
}

export interface Receipt {
	name: string
	items: ReceiptItem[]
	payers: { [key in string]: number }
	timestamp: Date
}
