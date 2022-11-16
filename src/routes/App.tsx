import React, { FC, useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import './App.scss'

// Backend
import firebase from 'firebase/app'
import 'firebase/auth'
import { firebaseAuth } from '../firebase'

// Components
import { Button, Popover, Snackbar, Alert } from '@mui/material'
import LogoSVG from '../logo.svg'

// Assets
import GoogleLogo from '../assets/googleLogo.svg'

const auth = firebaseAuth()
const fbAuthProvider = new firebase.auth.GoogleAuthProvider()

export type AppProps = {}

const App: FC<AppProps> = () => {
	const navigate = useNavigate()
	const [user, setUser] = useState<firebase.User | null>(null)
	const [openProfile, setOpenProfile] = useState<Element | null>(null)
	const [errMsg, setErrMsg] = useState<string | null>(null)
	useEffect(() => {
		auth.onAuthStateChanged((user) => {
			setUser(user)
		})
	}, [])

	return (
		<div className="App">
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
					<div className="user-info">
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
							<img src={GoogleLogo} alt="google logo" height="15px" />
							구글로 로그인
						</Button>
					</div>
				) : (
					<div className="user-info">
						<ul>
							<li>
								<Button
									onClick={() => {
										if (auth?.currentUser) {
											navigate('/groups')
											setOpenProfile(null)
										} else {
											setErrMsg('로그인이 필요합니다.')
										}
									}}>
									목록 보기
								</Button>
							</li>
							<li>
								<Button
									onClick={() => {
										auth.signOut()
										setOpenProfile(null)
									}}>
									로그아웃
								</Button>
							</li>
						</ul>
					</div>
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
			<header>
				<p
					className="brand"
					onClick={() => {
						navigate('/')
					}}>
					<img src={LogoSVG} alt="dutchpay logo" height="30px" />
					<span>dutchpay</span>
				</p>

				<div className="center"></div>
				<div className="right">
					<Button
						className="profileBtn"
						onClick={(event) => {
							setOpenProfile(event.currentTarget)
						}}>
						{user == null ? '로그인' : user.displayName}
					</Button>
				</div>
			</header>
			<Outlet />

			<footer>Copyright 2022. 김지섭, 손채린. all rights reserved.</footer>
		</div>
	)
}

export default App