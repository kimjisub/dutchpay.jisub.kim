import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore'

// Backend
import { fs } from '../firebase'
import { Group } from '../models/Group'
import { MembersType } from '../models/Group'
import { Receipt } from '../models/Receipt'
import { Transfer } from '../models/Transfer'
import { sortObject } from '../utils'

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

export const getGroup = async (groupId: string): Promise<Group> => {
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

export const setGroup = async (groupId: string, group: Group): Promise<void> => {
	fbLog(`Set /DutchPay/{${groupId}}`)
	await setDoc(doc(fs, 'DutchPay', groupId), group)
}

export const deleteGroup = async (groupId: string): Promise<void> => {
	fbLog(`Delete /DutchPay/{${groupId}}`)
	await deleteDoc(doc(fs, 'DutchPay', groupId))
}

export const subscribeGroups = (uid: string, onChange: (groups: { [key in string]: Group }) => void) => {
	fbLog(`Subscribe /DutchPay by uid: ${uid}`)
	const unsubscribe = onSnapshot(query(collection(fs, 'DutchPay'), where('admins', 'array-contains', uid)), (snapshot) => {
		const groups: { [key in string]: Group } = {}
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

export const subscribeGroup = (groupId: string, onChange: (group: Group) => void) => {
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

export const addReceipt = async (groupId: string, receipt: Receipt): Promise<string> => {
	const docRef = await addDoc(collection(fs, 'DutchPay', groupId, 'Receipts'), receipt)
	return docRef.id
}

export const getReceipt = async (groupId: string, receiptId: string): Promise<Receipt | null> => {
	fbLog(`Get /DutchPay/{${groupId}}/Receipt/{${receiptId}}`)
	const receiptDoc = await getDoc(doc(fs, 'DutchPay', groupId, 'Receipts', receiptId))
	const data = receiptDoc.data()
	if (data) {
		const sortedPayers = sortObject(data.payers) as { [x: string]: number }
		return { name: data.name, items: data.items, payers: sortedPayers, timestamp: data.timestamp?.toDate() }
	}
	return null
}

export const setReceipt = async (groupId: string, receiptId: string, receipt: Receipt): Promise<void> => {
	fbLog(`Set /DutchPay/{${groupId}}/Receipt/{${receiptId}}`)
	await setDoc(doc(fs, 'DutchPay', groupId, 'Receipts', receiptId), receipt)
}

export const deleteReceipt = async (groupId: string, receiptId: string): Promise<void> => {
	fbLog(`Delete /DutchPay/{${groupId}}/Receipt/{${receiptId}}`)
	await deleteDoc(doc(fs, 'DutchPay', groupId, 'Receipts', receiptId))
}

export const subscribeReceipts = (groupId: string, onChange: (receipts: { [key in string]: Receipt }) => void) => {
	fbLog(`Subscribe /DutchPay/{${groupId}}/Receipt`)
	const unsubscribe = onSnapshot(collection(fs, 'DutchPay', groupId, 'Receipts'), (snapshot) => {
		const receipts: { [key in string]: Receipt } = {}
		snapshot.forEach((d) => {
			const data = d.data()
			if (data) {
				const sortedPayers = sortObject(data.payers) as { [x: string]: number }
				receipts[d.id] = { name: data.name, items: data.items, payers: sortedPayers, timestamp: data.timestamp?.toDate() }
			}
		})
		onChange(
			sortObject(receipts, (a, b) => {
				const aTime = receipts[a].timestamp
				const bTime = receipts[b].timestamp
				return aTime < bTime ? 1 : -1
			})
		)
	})
	return () => {
		fbLog(`Unsubscribe /DutchPay/{${groupId}}/Receipt`)
		unsubscribe()
	}
}

export const addTransfer = async (groupId: string, transfer: Transfer): Promise<string> => {
	const docRef = await addDoc(collection(fs, 'DutchPay', groupId, 'Transfers'), transfer)
	return docRef.id
}

export const subscribeTransfers = (groupId: string, onChange: (transfers: { [key in string]: Transfer }) => void) => {
	fbLog(`Subscribe /DutchPay/{${groupId}}/Transfer`)
	const unsubscribe = onSnapshot(collection(fs, 'DutchPay', groupId, 'Transfers'), (snapshot) => {
		const transfers: { [key in string]: Transfer } = {}
		snapshot.forEach((d) => {
			const data = d.data()
			if (data) {
				transfers[d.id] = {
					from: data.from,
					to: data.to,
					amount: data.amount,
					timestamp: data.timestamp?.toDate(),
				}
			}
		})
		onChange(
			sortObject(transfers, (a, b) => {
				const aTime = transfers[a].timestamp
				const bTime = transfers[b].timestamp
				return aTime < bTime ? 1 : -1
			})
		)
	})
	return () => {
		fbLog(`Unsubscribe /DutchPay/{${groupId}}/Transfer`)
		unsubscribe()
	}
}
