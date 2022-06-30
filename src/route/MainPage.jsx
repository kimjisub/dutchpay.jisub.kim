import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MainPage.scss'

// Backend
import 'firebase/auth'
import { firebaseAuth } from '../firebase'
import * as db from '../db/firestore'

// Components
import { Button, Snackbar, Alert } from '@mui/material'

const auth = firebaseAuth()

export default function MainPage(props) {
	const navigate = useNavigate()
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
					db.addGroup(auth?.currentUser?.uid ?? '')
						.then((docId) => navigate(`/groups/${docId}`))
						.catch((err) => setErrMsg(err))
				}}>
				새로 만들기
			</Button>
			<Button
				onClick={() => {
					if (auth?.currentUser) {
						navigate(`/groups`)
					}
				}}>
				목록 보기
			</Button>
		</div>
	)
}
