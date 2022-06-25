import { useState } from 'react'

export function useGetSetterState<T>(defaultValue: T, getter: (value: T) => T, setter: (value: T) => T) {
	const [value, setValue] = useState(defaultValue)

	// 변환된 변수
	const get = getter(value)

	return [
		value,
		get,
		(callback: (prev: T) => T) => {
			// 사용자에 의해 처리된 변수
			const processed = callback(get)
			// setter에 의해 차리
			setValue(setter(processed))
		},
	]
}
