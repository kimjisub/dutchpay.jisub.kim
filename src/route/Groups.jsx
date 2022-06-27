import React, { useState, useEffect, useReducer } from 'react'
import { useNavigateSearch } from '../hooks/useNavigationSearch'
import './Groups.scss'

// Backend
import { firestore, firebaseAuth } from '../firebase'
import { calcExpenditure, calcSettlement, sortObject } from '../algorithm'
import { fbLog } from '../logger'

const auth = firebaseAuth()
const fs = firestore()

export default function Groups(props) {
	const navigateSearch = useNavigateSearch()
	const [user, setUser] = useState(null)

	useEffect(() => {
		auth.onAuthStateChanged((user) => {
			setUser(user)
		})
	}, [])

	const [groups, groupsDispatch] = useReducer((state, actions) => {
		let _state = { ...state }
		actions.forEach((action) => {
			const { type, id, data } = action
			switch (type) {
				case 'added':
					_state[id] = data
					break
				case 'modified':
					_state[id] = data
					break
				case 'removed':
					delete _state[id]
					break
				default:
			}
		})
		return _state
		// return sortObject(_state, (a, b) => {
		// 	const Atarget = _state[a].timestamp
		// 	const Btarget = _state[b].timestamp
		// 	return Atarget < Btarget ? 1 : -1
		// })
	}, {})

	useEffect(() => {
		fbLog(`Subscribe /DutchPay/`)
		if (!user) return () => {}

		const unsubscribeGroups = fs
			.collection('DutchPay')
			.where('owner', '==', user.uid)
			.onSnapshot((querySnapshot) => {
				let actions = []
				querySnapshot.docChanges().forEach((change) => {
					let id = change.doc.id
					let data = change.doc.data()

					actions.push({ type: change.type, id, data })
				})
				groupsDispatch(actions)
			})

		return () => {
			fbLog(`Unsubscribe /DutchPay`)
			unsubscribeGroups()
		}
	}, [user])

	if (user === null) {
		return <div>로그인이 필요합니다.</div>
	}

	return (
		<div className="Groups">
			{Object.keys(groups).map((key) => {
				const group = groups[key]
				return (
					<p
						key={key}
						onClick={() => {
							navigateSearch(`/groups/${key}`)
						}}>
						<span>{key}</span>
						<span>{group.name}</span>
					</p>
				)
			})}
		</div>
	)
}
