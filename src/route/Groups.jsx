import React, { useState, useEffect, useReducer } from 'react'
import { useNavigateSearch } from '../hooks/useNavigationSearch'
import { format } from 'date-fns'
import './Groups.scss'

// Backend
import { firestore, firebaseAuth } from '../firebase'
import { calcExpenditure, calcSettlement, sortObject } from '../algorithm'
import { fbLog } from '../logger'

// Components
import { Button, Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const auth = firebaseAuth()
const fs = firestore()

export default function Groups(props) {
	const navigateSearch = useNavigateSearch()
	const [user, setUser] = useState(null)
	const [errMsg, setErrMsg] = useState(null)

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
		return sortObject(_state, (a, b) => {
			const Atarget = _state[a].timestamp
			const Btarget = _state[b].timestamp
			return Atarget < Btarget ? 1 : -1
		})
	}, {})

	useEffect(() => {
		fbLog(`Subscribe /DutchPay/`)
		if (!user) return () => {}

		const unsubscribeGroups = fs
			.collection('DutchPay')
			.where('owner', '==', user.uid)
			.onSnapshot((querySnapshot) => {
				const actions = []
				querySnapshot.docChanges().forEach((change) => {
					const id = change.doc.id
					const data = change.doc.data()

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
			<Snackbar
				open={errMsg != null && !errMsg.includes('CLOSE')}
				autoHideDuration={5000}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				onClose={() => {
					setErrMsg(errMsg + 'CLOSE')
				}}>
				<Alert elevation={6} variant="filled" severity="error">
					{errMsg?.replace('CLOSE', '')}
				</Alert>
			</Snackbar>
			<Button
				onClick={() => {
					fbLog('Add /DutchPay')
					fs.collection('DutchPay')
						.add({
							name: '',
							members: [],
							owner: auth?.currentUser?.uid ?? '',
							timestamp: new Date(),
						})
						.then((docRef) => {
							navigateSearch(`/groups/${docRef.id}`, { edit: true }) // history.push({ pathname: `/groups/${docRef.id}`, search: '?edit=true' })
						})
						.catch((err) => {
							setErrMsg('로그인이 필요합니다')
						})
				}}>
				새로 만들기
			</Button>
			<table>
				<thead>
					<tr>
						<td>이름</td>
						<td>날짜</td>
					</tr>
				</thead>
				<tbody>
					{Object.keys(groups).map((key) => {
						const group = groups[key]
						return (
							<tr
								key={key}
								onClick={() => {
									navigateSearch(`/groups/${key}`)
								}}>
								<td>{group.name}</td>
								<td>{format(group.timestamp.toDate(), 'yyyy/MM/dd')}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
