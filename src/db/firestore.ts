import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore'

import { sortObject } from '../algorithm'
// Backend
import { fs } from '../firebase'
import { GroupType } from '../types/GroupType'
import { ReceiptType } from '../types/ReceiptType'

import { MembersType } from './../types/MembersType'

function fbLog(msg: string) {
	console.debug('[Firebase]', msg)
}

export const checkPermission = async (groupId: string): Promise<boolean> => {
	fbLog(`Permission Test /DutchPay/{${groupId}}`)
	try {
		await updateDoc(doc(fs, 'DutchPay', groupId), {})
		return true
	} catch {
		return false
	}
}

export const addGroup = async (adminUid: string): Promise<string> => {
	fbLog('Add /DutchPay')
	try {
		const docRef = await addDoc(collection(fs, 'DutchPay'), {
			name: '',
			members: [],
			admins: [adminUid],
			timestamp: new Date(),
		})
		return docRef.id
	} catch {
		throw new Error('로그인이 필요합니다.')
	}
}

export const getGroup = async (groupId: string): Promise<GroupType> => {
	fbLog(`Get /DutchPay/{${groupId}}`)
	const docSnap = await getDoc(doc(fs, 'DutchPay', groupId))
	if (docSnap.exists()) {
		const data = docSnap.data()
		if (data) {
			const sortedMembers = sortObject(data.members) as MembersType
			return { name: data.name, admins: data.admins, timestamp: data.timestamp?.toDate(), members: sortedMembers }
		}
	}
	throw new Error('Group not found')
}

export const setGroup = async (groupId: string, group: GroupType): Promise<void> => {
	fbLog(`Set /DutchPay/{${groupId}}`)
	await setDoc(doc(fs, 'DutchPay', groupId), group)
}

export const deleteGroup = async (groupId: string): Promise<void> => {
	fbLog(`Delete /DutchPay/{${groupId}}`)
	await deleteDoc(doc(fs, 'DutchPay', groupId))
}

export const subscribeGroups = (uid: string, onChange: (groups: { [key in string]: GroupType }) => void) => {
	fbLog(`Subscribe /DutchPay by uid: ${uid}`)
	const unsubscribe = onSnapshot(query(collection(fs, 'DutchPay'), where('admins', 'array-contains', uid)), (snapshot) => {
		const groups: { [key in string]: GroupType } = {}
		snapshot.forEach((d) => {
			const data = d.data()
			if (data) {
				const sortedMembers = sortObject(data.members) as MembersType
				groups[d.id] = { name: data.name, admins: data.admins, timestamp: data.timestamp?.toDate(), members: sortedMembers }
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
	const unsubscribe = onSnapshot(doc(fs, 'DutchPay', groupId), (d) => {
		const data = d.data()
		if (data) {
			const sortedMembers = sortObject(data.members) as MembersType
			onChange({ name: data.name, admins: data.admins, timestamp: data.timestamp?.toDate(), members: sortedMembers })
		}
	})
	return () => {
		fbLog(`Unsubscribe /DutchPay/{${groupId}}`)
		unsubscribe()
	}
}

export const addReceipt = async (groupId: string, receipt: ReceiptType): Promise<string> => {
	const docRef = await addDoc(collection(fs, 'DutchPay', groupId, 'Receipts'), receipt)
	return docRef.id
}

export const getReceipt = async (groupId: string, receiptId: string): Promise<ReceiptType | null> => {
	fbLog(`Get /DutchPay/{${groupId}}/Receipt/{${receiptId}}`)
	const receiptDoc = await getDoc(doc(fs, 'DutchPay', groupId, 'Receipts', receiptId))
	const data = receiptDoc.data()
	if (data) {
		const sortedPayers = sortObject(data.payers) as { [x: string]: number }
		return { name: data.name, items: data.items, payers: sortedPayers, timestamp: data.timestamp?.toDate() }
	}
	return null
}

export const setReceipt = async (groupId: string, receiptId: string, receipt: ReceiptType): Promise<void> => {
	fbLog(`Set /DutchPay/{${groupId}}/Receipt/{${receiptId}}`)
	await setDoc(doc(fs, 'DutchPay', groupId, 'Receipts', receiptId), receipt)
}

export const deleteReceipt = async (groupId: string, receiptId: string): Promise<void> => {
	fbLog(`Delete /DutchPay/{${groupId}}/Receipt/{${receiptId}}`)
	await deleteDoc(doc(fs, 'DutchPay', groupId, 'Receipts', receiptId))
}

export const subscribeReceipts = (groupId: string, onChange: (receipts: { [key in string]: ReceiptType }) => void) => {
	fbLog(`Subscribe /DutchPay/{${groupId}}/Receipt`)
	const unsubscribe = onSnapshot(collection(fs, 'DutchPay', groupId, 'Receipts'), (snapshot) => {
		const receipts: { [key in string]: ReceiptType } = {}
		snapshot.forEach((d) => {
			const data = d.data()
			if (data) {
				const sortedPayers = sortObject(data.payers) as { [x: string]: number }
				receipts[d.id] = { name: data.name, items: data.items, payers: sortedPayers, timestamp: data.timestamp?.toDate() }
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
