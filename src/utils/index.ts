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

export function deepCopy<T>(obj: T) {
	return JSON.parse(JSON.stringify(obj)) as T
}
