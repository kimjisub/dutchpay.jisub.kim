import { MembersType } from '../../models/Group'
import { Receipt } from '../../models/Receipt'
import { Transfer } from '../../models/Transfer'
import { deepCopy } from '..'

import { calcReceiptSummary, CalcReceiptSummaryResult } from './calcReceiptSummary'
import { calcTransfersNeeded } from './calcTransfersNeeded'

export interface CalcDutchpayInput {
	members: MembersType
	receipts: { [name in string]: Receipt }
	transfers: { [name in string]: Transfer }
}

export interface CalcDutchpayResult {
	receiptSummary: CalcReceiptSummaryResult
	transfersNeeded: Omit<Transfer, 'timestamp'>[] | null
}

export function calcDutchpay({ members, receipts, transfers }: CalcDutchpayInput): CalcDutchpayResult {
	const receiptSummary = calcReceiptSummary({ members, receipts })
	const { spendAmount, paidAmount, eachMembers } = receiptSummary

	if (spendAmount !== paidAmount) {
		return {
			receiptSummary,
			transfersNeeded: null,
		}
	}

	// Transfers를 반영하기 위해 eachMembers 객체를 복사합니다.
	const adjustedEachMembers = deepCopy(eachMembers)
	for (let transferName in transfers) {
		const transfer = transfers[transferName]
		if (adjustedEachMembers[transfer.from]) {
			adjustedEachMembers[transfer.from].paid += transfer.amount
		}
		if (adjustedEachMembers[transfer.to]) {
			adjustedEachMembers[transfer.to].paid -= transfer.amount
		}
	}

	const adjustedReceiptSummaryResult = { ...receiptSummary, eachMembers: adjustedEachMembers }
	const settlementResult = calcTransfersNeeded({ receiptSummary: adjustedReceiptSummaryResult })

	return {
		receiptSummary,
		transfersNeeded: settlementResult.map((item) => ({
			from: item.from,
			to: item.to,
			amount: item.amount,
		})),
	}
}
