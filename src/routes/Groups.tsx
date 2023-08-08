import React, { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// Components
import { Alert, Button, Snackbar } from '@mui/material'
import { format } from 'date-fns'
// Backend
import { User } from 'firebase/auth'

import './Groups.scss'

import { sortObject } from '../algorithm'
import * as db from '../db/firestore'
import { auth } from '../firebase'
import { GroupType } from '../types/GroupType'

export type GroupsProps = {}

const Groups: FC<GroupsProps> = () => {
	const navigate = useNavigate()
	const [user, setUser] = useState<User | null>(null)
	const [errMsg, setErrMsg] = useState<string | null>(null)

	const [groups, setGroups] = useState<{ [name in string]: GroupType }>({})

	useEffect(() => {
		auth.onAuthStateChanged(setUser)
	}, [])

	useEffect(() => {
		if (!user) return () => {}

		const unsubscribeGroups = db.subscribeGroups(user.uid, (g) => {
			setGroups(
				sortObject(g, (a, b) => {
					const Atarget = g[a].timestamp
					const Btarget = g[b].timestamp
					return Atarget < Btarget ? 1 : -1
				})
			)
		})
		return () => {
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
					db.addGroup(auth?.currentUser?.uid ?? '')
						.then((docId) => navigate(`/groups/${docId}`))
						.catch((err) => setErrMsg(err))
				}}>
				새로 만들기
			</Button>
			<div className="table-wrapper">
				<table>
					<thead>
						<tr>
							<td>이름</td>
							<td>날짜</td>
							<td>인원</td>
						</tr>
					</thead>
					<tbody>
						{Object.keys(groups).map((key) => {
							const group = groups[key]
							return (
								<tr
									key={key}
									onClick={() => {
										navigate(`/groups/${key}`)
									}}>
									<td>{group.name}</td>
									<td>{format(group.timestamp, 'yyyy/MM/dd')}</td>
									<td>{Object.values(group.members).join(', ')}</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default Groups
