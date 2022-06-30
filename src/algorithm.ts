import { MembersType } from './types/MembersType'
import { ReceiptType } from './types/ReceiptType'

export type CalcExpenditureResultType = {
	eachMembers: { [key in string]: { spend: number; paid: number } }
	totalSpend: number
	totalPaid: number
}

export function calcExpenditure(members: MembersType, receipts: ReceiptType[]): CalcExpenditureResultType {
	const ret: CalcExpenditureResultType = { totalSpend: 0, totalPaid: 0, eachMembers: {} }

	for (let id in members) ret.eachMembers[id] = { spend: 0, paid: 0 }

	for (let i in receipts) {
		const receipt = receipts[i]

		for (let j in receipt.items) {
			const item = receipt.items[j]
			ret.totalSpend += item.price
			const eachPrice = item.price / item.buyers.length

			for (let k in item.buyers) {
				const id = item.buyers[k]
				ret.eachMembers[id].spend += eachPrice
			}
		}

		for (let id in receipt.payers) {
			const price = receipt.payers[id]
			ret.totalPaid += price
			ret.eachMembers[id].paid += price
		}
	}

	return ret
}

export type CalcSettlementResultType = { from: string; to: string; value: number }[]

export function calcSettlement(expenditure: CalcExpenditureResultType): CalcSettlementResultType {
	const data: { [key in string]: number } = {}
	for (let id in expenditure.eachMembers) {
		const spend = expenditure.eachMembers[id].spend
		const paid = expenditure.eachMembers[id].paid
		data[id] = spend - paid
	}

	const ret = []
	for (let from in data) {
		if (data[from] > 0) {
			for (let to in data) {
				if (data[to] < 0) {
					if (data[from] <= -data[to]) {
						const value = Math.min(data[from], -data[to])
						ret.push({ from, to, value: parseFloat(value.toFixed(2)) })
						data[to] += data[from]
						data[from] -= data[from]
						break
					}
				}
			}
		}
	}
	for (let from in data) {
		if (data[from] > 0) {
			for (let to in data) {
				if (data[to] < 0) {
					const value = Math.min(data[from], -data[to])
					ret.push({ from, to, value: parseFloat(value.toFixed(2)) })
					data[to] += value
					data[from] -= value
				}
			}
		}
	}
	return ret
}

export type calcSingleExpenditureResultType = { name: string; totalPrice: number; items: { name: string; price: number }[] }[]

export function calcSingleExpenditure(memberId: string, receipts: ReceiptType[]): calcSingleExpenditureResultType {
	const ret: calcSingleExpenditureResultType = []

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

export function bigNumberToCode(num: number) {
	if (num === 0) return '0'
	const digit = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
	let ret = ''
	for (; Math.floor(num / digit.length) > 0; ) {
		ret = digit[num % digit.length] + ret
		num = Math.floor(num / digit.length)
	}
	if (num !== 0) ret = digit[num] + ret
	return ret
}

export function sortObject<T>(objects: { [key in string]: T }, sort: (a: string, b: string) => number = (a, b) => (a > b ? 1 : -1)): { [key in string]: T } {
	const sorted: { [key in string]: T } = {}
	const keys = []
	for (let key in objects) if (objects.hasOwnProperty(key)) keys.push(key)
	keys.sort(sort)

	for (let key = 0; key < keys.length; key++) sorted[keys[key]] = objects[keys[key]]

	return sorted
}
