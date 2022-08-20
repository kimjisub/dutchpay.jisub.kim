import { MembersType } from './../types/MembersType'
// Backend
import { firestore } from '../firebase'
import { sortObject } from '../algorithm'

import { GroupType } from '../types/GroupType'
import { ReceiptType } from '../types/ReceiptType'
const fs = firestore()

function fbLog(msg: string) {
	console.debug('[Firebase]', msg)
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

export const addGroup = (adminUid: string) =>
	new Promise<string>((resolve, reject) => {
		fbLog('Add /DutchPay')
		fs.collection('DutchPay')
			.add({
				name: '',
				members: [],
				admins: [adminUid],
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
					const sortedMembers = sortObject(data.members, (a, b) => {
						const Atarget = a
						const Btarget = b
						return Atarget > Btarget ? 1 : -1
					}) as MembersType
					resolve({ name: data.name, admins: data.admins, timestamp: data.timestamp?.toDate(), members: sortedMembers })
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
		.where('admins', 'array-contains', uid)
		.onSnapshot((snapshot) => {
			const groups: { [key in string]: GroupType } = {}
			snapshot.forEach((doc) => {
				const data = doc.data()
				if (data) {
					const sortedMembers = sortObject(data.members, (a, b) => {
						const Atarget = a
						const Btarget = b
						return Atarget > Btarget ? 1 : -1
					}) as MembersType
					groups[doc.id] = { name: data.name, admins: data.admins, timestamp: data.timestamp?.toDate(), members: sortedMembers }
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
				const sortedMembers = sortObject(data.members, (a, b) => {
					const Atarget = a
					const Btarget = b
					return Atarget > Btarget ? 1 : -1
				}) as MembersType
				onChange({ name: data.name, admins: data.admins, timestamp: data.timestamp.toDate(), members: sortedMembers })
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
					const sortedPayers = sortObject(data.payers, (a, b) => {
						const Atarget = a
						const Btarget = b
						return Atarget > Btarget ? 1 : -1
					}) as { [x: string]: number }
					resolve({ name: data.name, items: data.items, payers: sortedPayers, timestamp: data.timestamp?.toDate() })
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
					const sortedPayers = sortObject(data.payers, (a, b) => {
						const Atarget = a
						const Btarget = b
						return Atarget > Btarget ? 1 : -1
					}) as { [x: string]: number }
					receipts[doc.id] = { name: data.name, items: data.items, payers: sortedPayers, timestamp: data.timestamp?.toDate() }
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
