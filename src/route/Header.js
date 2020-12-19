import React, { useState, useEffect } from 'react'
import './Header.scss'

// Backend
import firebase from 'firebase/app'
import 'firebase/auth'
import { firestore, firebaseAuth } from '../firebase'
import { fbLog } from '../logger'

// Components
import { Button, Popover, Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const auth = firebaseAuth()
const fs = firestore()
const fbAuthProvider = new firebase.auth.GoogleAuthProvider()

export default function (props) {
	const [user, setUser] = useState(null)
	const [openProfile, setOpenProfile] = useState(null)
	const [errMsg, setErrMsg] = useState(null)
	useEffect(() => {
		auth.onAuthStateChanged((user) => {
			setUser(user)
		})
	}, [])

	return (
		<header>
			<Popover
				open={openProfile !== null}
				anchorEl={openProfile}
				onClose={() => setOpenProfile(null)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}>
				{user == null ? (
					<Button
						onClick={() => {
							firebase
								.auth()
								.signInWithPopup(fbAuthProvider)
								.then((result) => {
									setOpenProfile(null)
								})
								.catch((error) => {
									setErrMsg(error.message)
								})
						}}>
						구글로 로그인
					</Button>
				) : (
					<Button
						onClick={() => {
							auth.signOut()
							setOpenProfile(null)
						}}>
						로그아웃
					</Button>
				)}
			</Popover>

			<div id="firebaseui-auth-container"></div>

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

			<div className="header">
				<a href="https://dutchpay.kimjisub.me" className="brand">
					dutchpay
				</a>

				<div className="center">
					<ul>
						<li>
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
						</li>
						<li>
							<Button>목록 보기</Button>
						</li>
					</ul>
				</div>
				<div>
					<Button
						className="profileBtn"
						onClick={(event) => {
							setOpenProfile(event.currentTarget)
						}}>
						{user == null ? '로그인' : user.displayName}
					</Button>
				</div>
			</div>
		</header>
	)
}
