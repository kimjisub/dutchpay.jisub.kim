import React, { useState, useEffect } from 'react'
import { Button } from 'react-mdl'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import firebase from 'firebase'

import './MainPage.scss'
import { firestore } from '../firebase'

let auth
const fs = firestore()

export default function (props) {
	const [errMsg, setErrMsg] = useState(null)
	useEffect(() => {
		auth = firebase.auth()
	}, [])

	return (
		<div className="MainPage">
			<Button
				raised
				ripple
				onClick={() => {
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
