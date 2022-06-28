import React, { useState, useEffect } from 'react'
import { useNavigateSearch } from '../hooks/useNavigationSearch'
import './MainPage.scss'

// Backend
import 'firebase/auth'
import { firestore, firebaseAuth } from '../firebase'
import { fbLog } from '../logger'

// Components
import { Button, Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const auth = firebaseAuth()
const fs = firestore()

export default function MainPage(props) {
	const navigateSearch = useNavigateSearch()
	const [user, setUser] = useState(null)
	const [errMsg, setErrMsg] = useState(null)

	return (
		<div className="MainPage">
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
			<Button
				onClick={() => {
					if (auth?.currentUser) {
						navigateSearch(`/groups`)
					}
				}}>
				목록 보기
			</Button>
		</div>
	)
}
