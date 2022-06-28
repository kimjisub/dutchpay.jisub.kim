// Backend
import { firestore } from '../firebase'
import { sortObject } from '../algorithm2'
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

export const addGroup = (ownerUid: string) =>
	new Promise<string>((resolve, reject) => {
		fbLog('Add /DutchPay')
		fs.collection('DutchPay')
			.add({
				name: '',
				members: [],
				owner: ownerUid,
				timestamp: new Date(),
			})
			.then((docRef) => {
				resolve(docRef.id)
			})
			.catch((err) => {
				reject('로그인이 필요합니다.')
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
					resolve({ name: data.name, owner: data.owner, timestamp: data.timestamp?.toDate(), members: data.members })
				} else reject('Group not found')
			})
	})

export const setGroup = (groupId: string, group: GroupType) =>
	new Promise<void>((resolve, reject) => {
		fbLog(`Set /DutchPay/{${groupId}}`)
		fs.collection('DutchPay')
			.doc(groupId)
			.set(group)
			.then(() => {
				resolve()
			})
			.catch((err) => {
				reject('권한이 없습니다.')
			})
	})

export const deleteGroup = (groupId: string) =>
	new Promise<void>((resolve, reject) => {
		fbLog(`Delete /DutchPay/{${groupId}}`)
		fs.collection('DutchPay')
			.doc(groupId)
			.delete()
			.then(() => {
				resolve()
			})
			.catch((err) => {
				reject('권한이 없습니다.')
			})
	})

export const subscribeGroups = (uid: string, onChange: (groups: { [key in string]: GroupType }) => void) => {
	fbLog(`Subscribe /DutchPay by uid: ${uid}`)
	const unsubscribe = fs
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

	return () => {
		fbLog(`Unsubscribe /DutchPay by uid: ${uid}`)
		unsubscribe()
	}
}

export const subscribeGroup = (groupId: string, onChange: (group: GroupType) => void) => {
	fbLog(`Subscribe /DutchPay/{${groupId}}`)
	const unsubscribe = fs
		.collection('DutchPay')
		.doc(groupId)
		.onSnapshot((doc) => {
			const data = doc.data()
			if (doc.exists && data) {
				onChange({ name: data.name, owner: data.owner, timestamp: data.timestamp.toDate(), members: data.members })
			}
		})
	return () => {
		fbLog(`Unsubscribe /DutchPay/{${groupId}}`)
		unsubscribe()
	}
}

export const addReceipt = (groupId: string, receipt: ReceiptType) =>
	new Promise<string>((resolve, reject) => {
		fs.collection('DutchPay')
			.doc(groupId)
			.collection('Receipts')
			.add(receipt)
			.then((docRef) => {
				resolve(docRef.id)
			})
			.catch((e) => {
				reject('권한이 없습니다.')
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
					resolve({ name: data.name, items: data.items, payers: data.payers, timestamp: data.timestamp?.toDate() })
				}
			})
	})

export const setReceipt = (groupId: string, receiptId: string, receipt: ReceiptType) =>
	new Promise<void>((resolve, reject) => {
		fbLog(`Set /DutchPay/{${groupId}}/Receipt/{${receiptId}}`)
		fs.collection('DutchPay')
			.doc(groupId)
			.collection('Receipts')
			.doc(receiptId)
			.set(receipt)
			.then(() => {
				resolve()
			})
			.catch((e) => {
				reject('권한이 없습니다.')
			})
	})

export const deleteReceipt = (groupId: string, receiptId: string) =>
	new Promise<void>((resolve, reject) => {
		fbLog(`Delete /DutchPay/{${groupId}}/Receipt/{${receiptId}}`)
		fs.collection('DutchPay')
			.doc(groupId)
			.collection('Receipts')
			.doc(receiptId)
			.delete()
			.then(() => {
				resolve()
			})
			.catch((e) => {
				reject('권한이 없습니다.')
			})
	})

export const subscribeReceipts = (groupId: string, onChange: (receipts: { [key in string]: ReceiptType }) => void) => {
	fbLog(`Subscribe /DutchPay/{${groupId}}/Receipt`)
	const unsubscribe = fs
		.collection('DutchPay')
		.doc(groupId)
		.collection('Receipts')
		.onSnapshot((snapshot) => {
			const receipts: { [key in string]: ReceiptType } = {}
			snapshot.forEach((doc) => {
				const data = doc.data()
				if (data) {
					receipts[doc.id] = { name: data.name, items: data.items, payers: data.payers, timestamp: data.timestamp?.toDate() }
				}
			})
			onChange(
				sortObject(receipts, (a, b) => {
					const Atarget = receipts[a].timestamp
					const Btarget = receipts[b].timestamp
					return Atarget < Btarget ? 1 : -1
				})
			)
		})
	return () => {
		fbLog(`Unsubscribe /DutchPay/{${groupId}}/Receipt`)
		unsubscribe()
	}
}
