export function calcExpenditure(members, receipts) {
	let ret = {}

	for (let id in members) ret[id] = { spend: 0, paied: 0 }

	for (let i in receipts) {
		let receipt = receipts[i]

		//let totalPrice = 0
		for (let j in receipt.items) {
			let item = receipt.items[j]
			let price = item.price
			let eachPrice = price / item.buyers.length
			//totalPrice += price

			for (let k in item.buyers) {
				let id = item.buyers[k]
				ret[id].spend += eachPrice
			}
		}

		for (let id in receipt.payers) {
			let price = receipt.payers[id]
			ret[id].paied += price
		}
	}

	return ret
}

export function bigNumberToCode(num) {
	if (num === 0) return '0'
	let digit = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
	let ret = ''
	for (; parseInt(num / digit.length) > 0; ) {
		ret = digit[parseInt(num % digit.length)] + ret
		num = parseInt(num / digit.length)
	}
	if (num !== 0) ret = digit[num] + ret
	return ret
}
