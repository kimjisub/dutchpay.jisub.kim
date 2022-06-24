import { useNavigate, createSearchParams } from 'react-router-dom'

export const useNavigateSearch = () => {
	const navigate = useNavigate()
	return (pathname, params) => {
		const filterdParams = {}
		Object.keys(params).forEach((key) => {
			const value = params[key]
			if (value !== undefined && value !== null) {
				filterdParams[key] = value
			}
		})

		navigate({ pathname, search: `?${createSearchParams(filterdParams)}` })
	}
}
