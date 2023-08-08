import { CalcReceiptSummaryResult } from './calcReceiptSummary'

export interface CalcTransfersNeededInput {
	receiptSummary: CalcReceiptSummaryResult
}

export type CalcTransfersNeededResult = {
	from: string
	to: string
	amount: number
}[]

/**
 * 각 회원의 지출과 지불 금액을 기반으로 송금이 필요한 내용을 계산합니다.
 * @param receiptSummary - 영수증 요약 결과로, 각 회원의 지출 및 지불 금액과 총 지출 및 지불 금액을 포함합니다.
 * @return 송금이 필요한 회원과 금액 정보.
 */
export function calcTransfersNeeded({ receiptSummary }: CalcTransfersNeededInput): CalcTransfersNeededResult {
	const data: { [key in string]: number } = {}
	const result: CalcTransfersNeededResult = []

	for (let id in receiptSummary.eachMembers) {
		const { spend, paid } = receiptSummary.eachMembers[id]
		data[id] = spend - paid
	}

	for (let from in data) {
		const fromAmount = data[from]
		if (fromAmount <= 0) continue

		for (let to in data) {
			const toAmount = data[to]
			if (toAmount >= 0) continue

			const value = Math.min(fromAmount, -toAmount)
			result.push({ from, to, amount: parseFloat(value.toFixed(2)) })
			data[to] += value
			data[from] -= value

			if (data[from] === 0) break
		}
	}

	return result
}
