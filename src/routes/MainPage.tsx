import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Snackbar } from '@mui/material'

import './MainPage.scss'
import 'firebase/auth'

import * as db from '../db/firestore'
import { auth } from '../firebase'

export type MainPageProps = {}

const MainPage: FC<MainPageProps> = () => {
	const navigate = useNavigate()
	const [errMsg, setErrMsg] = useState<string | null>(null)

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
					} else {
						setErrMsg('로그인이 필요합니다.')
					}
				}}>
				목록 보기
			</Button>
		</div>
	)
}

export default MainPage
