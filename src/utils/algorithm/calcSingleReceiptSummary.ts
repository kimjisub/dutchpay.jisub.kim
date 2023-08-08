import { Receipt } from '../../models/Receipt'

export type calcSingleReceiptSummaryResult = { name: string; totalPrice: number; items: { name: string; price: number }[] }[]

export function calcSingleReceiptSummary(memberId: string, receipts: Receipt[]): calcSingleReceiptSummaryResult {
	const ret: calcSingleReceiptSummaryResult = []

	for (let id in receipts) {
		let receipt = receipts[id]

		let totalPrice = 0

		let items = []
		for (let i in receipt.items) {
			let item = receipt.items[i]
			let eachPrice = item.price / item.buyers.length
			if (item.buyers.includes(memberId)) {
				totalPrice += eachPrice
				items.push({ name: item.name, price: parseFloat(eachPrice.toFixed(2)) })
			}
		}

		if (items.length)
			ret.push({
				name: receipt.name,
				totalPrice: parseFloat(totalPrice.toFixed(2)),
				items,
			})
	}
	return ret
}
