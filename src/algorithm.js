export function calcExpenditure(members, receipts) {
	let ret = {}

	for (let id in members) ret[id] = { spend: 0, paied: 0 }

	for (let i in receipts) {
		let receipt = receipts[i]

		//let totalPrice = 0
		for (let j in receipt.items) {
			let item = receipt.items[j]
			let eachPrice = item.price / item.buyers.length
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

	for (let id in members)
		ret[id] = {
			spend: parseFloat(ret[id].spend.toFixed(2)),
			paied: parseFloat(ret[id].paied.toFixed(2)),
		}

	return ret
}

export function calcSingleExpenditure(memberId, receipts) {
	let ret = []

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

export function calcSettlement(expenditure) {
	let data = {}
	for (let id in expenditure) {
		let spend = expenditure[id].spend
		let paied = expenditure[id].paied
		data[id] = spend - paied
	}

	let ret = []
	for (let from in data) {
		if (data[from] > 0) {
			for (let to in data) {
				if (data[to] < 0) {
					if (data[from] <= -data[to]) {
						let value = Math.min(data[from], -data[to])
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
					let value = Math.min(data[from], -data[to])
					ret.push({ from, to, value: parseFloat(value.toFixed(2)) })
					data[to] += value
					data[from] -= value
				}
			}
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
