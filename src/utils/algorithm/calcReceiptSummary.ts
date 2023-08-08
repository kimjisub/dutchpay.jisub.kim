import { MembersType } from '../../models/Group'
import { Receipt } from '../../models/Receipt'

export interface CalcReceiptSummaryInput {
	members: MembersType
	receipts: { [name in string]: Receipt }
}

export interface CalcReceiptSummaryResult {
	eachMembers: { [key in string]: { spend: number; paid: number } }
	spendAmount: number
	paidAmount: number
}

/**
 * 각 회원의 지출과 지불 금액, 그리고 총 지출 및 지불 금액을 계산합니다.
 * @param members - 각 회원에 대한 정보.
 * @param receipts - 각 영수증의 세부 정보.
 * @return 각 회원의 지출 및 지불 금액과 총 지출 및 지불 금액을 포함한 결과.
 */
export function calcReceiptSummary({ members, receipts }: CalcReceiptSummaryInput): CalcReceiptSummaryResult {
	const result: CalcReceiptSummaryResult = { spendAmount: 0, paidAmount: 0, eachMembers: {} }

	// 각 회원의 지출과 지불 금액을 0으로 초기화합니다.
	for (const id in members) result.eachMembers[id] = { spend: 0, paid: 0 }

	// 영수증을 순회하면서 지출과 지불 금액을 계산합니다.
	for (const i in receipts) {
		const receipt = receipts[i]

		// 물품별 총 지출과 각 회원의 지출을 계산합니다.
		for (const j in receipt.items) {
			const item = receipt.items[j]
			result.spendAmount += item.price
			const eachPrice = item.price / item.buyers.length

			for (const k in item.buyers) {
				const id = item.buyers[k]
				result.eachMembers[id].spend += eachPrice
			}
		}

		// 총 지불과 각 회원의 지불 금액을 계산합니다.
		for (const id in receipt.payers) {
			const price = receipt.payers[id]
			result.paidAmount += price
			result.eachMembers[id].paid += price
		}
	}

	return result
}
