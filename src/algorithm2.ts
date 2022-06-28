export function sortObject<T>(objects: { [key in string]: T }, sort: (a: string, b: string) => number): { [key in string]: T } {
	sort = sort || ((a, b) => (a > b ? 1 : -1))
	const sorted: { [key in string]: T } = {}
	const keys = []
	for (let key in objects) if (objects.hasOwnProperty(key)) keys.push(key)
	keys.sort(sort)

	for (let key = 0; key < keys.length; key++) sorted[keys[key]] = objects[keys[key]]

	return sorted
}
