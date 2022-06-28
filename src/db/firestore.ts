// Backend
import { firestore } from '../firebase'
const fs = firestore()

function fbLog(msg: string) {
	console.log('[Firebase]', msg)
}

export type GroupType = {
	name: string
	owner: string
	timestamp?: Date
	members: { [key in string]: string }
}

export type ReceiptItemType = {
	buyers: string[]
	name: string
	price: number
}
export type ReceiptType = {
	name: string
	items: ReceiptItemType[]
	payers: { [key in string]: number }
	timestamp: Date
}

export const checkPermission = (groupId: string) =>
	new Promise<boolean>((resolve, reject) => {
		fbLog(`Permission Test /DutchPay/{${groupId}}`)
		fs.collection('DutchPay')
			.doc(groupId)
			.update({})
			.then(() => {
				resolve(true)
			})
			.catch((err) => {
				reject(false)
			})
	})

export const getGroup = (groupId: string) =>
	new Promise<GroupType>((resolve, reject) => {
		fbLog(`Get /DutchPay/{${groupId}}`)
		fs.collection('DutchPay')
			.doc(groupId)
			.get()
			.then((doc) => {
				const data = doc.data()
				if (doc.exists && data) {
					resolve({ name: data.name, owner: data.owner, timestamp: data.timestamp.toDate(), members: data.members })
				} else reject('Group not found')
			})
	})

export const getReceipt = (groupId: string, receiptId: string) =>
	new Promise<ReceiptType>((resolve, reject) => {
		fbLog(`Get /DutchPay/{${groupId}}/Receipt/{${receiptId}}`)
		fs.collection('DutchPay')
			.doc(groupId)
			.collection('Receipts')
			.doc(receiptId)
			.get()
			.then((doc) => {
				const data = doc.data()
				if (doc.exists && data) {
					resolve({ name: data.name, items: data.items, payers: data.payers, timestamp: data.timestamp.toDate() })
				}
			})
	})

export const subscribeGroups = (uid: string, onChange: (groups: { [key in string]: GroupType }) => void) => {
	fbLog(`Subscribe /DutchPay by uid: ${uid}`)
	return fs
		.collection('DutchPay')
		.where('owner', '==', uid)
		.onSnapshot((snapshot) => {
			const groups: { [key in string]: GroupType } = {}
			snapshot.forEach((doc) => {
				const data = doc.data()
				if (data) {
					groups[doc.id] = { name: data.name, owner: data.owner, timestamp: data.timestamp?.toDate(), members: data.members }
				}
			})
			onChange(groups)
		})
}
