import React, { useState } from 'react'
import './MainPage.scss'

// Backend
import { firestore, firebaseAuth } from '../firebase'
import { fbLog } from '../logger'

// Components
import { Snackbar, Button } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const auth = firebaseAuth()
const fs = firestore()

export default function (props) {
	const [errMsg, setErrMsg] = useState(null)

	return (
		<div className="MainPage">
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
							props.history.push({ pathname: `/${docRef.id}`, search: '?edit=true' })
						})
						.catch((err) => {
							console.log(err)
							setErrMsg('로그인이 필요합니다')
						})
				}}>
				새로 만들기
			</Button>
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
		</div>
	)
}
