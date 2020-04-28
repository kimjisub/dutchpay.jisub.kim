import React, { useState, useEffect } from 'react'
import * as firebaseui from 'firebaseui'
import './Header.scss'

// Backend
import { firebaseAuth } from '../firebase'

const auth = firebaseAuth()
let fbui

export default function () {
	const [user, setUser] = useState(null)
	useEffect(() => {
		fbui = new firebaseui.auth.AuthUI(auth)
		auth.onAuthStateChanged((user) => {
			setUser(user)
		})
	}, [])

	return (
		<header>
			<a href="https://dutchpay.kimjisub.me" id="brand">
				dutchpay
			</a>
			{user == null ? (
				<p
					id="signin"
					onClick={() => {
						fbui.start('#firebaseui-auth-container', {
							signInOptions: [
								{
									provider: auth.EmailAuthProvider.PROVIDER_ID,
									requireDisplayName: false,
								},
								auth.GoogleAuthProvider.PROVIDER_ID,
							],
						})
					}}>
					로그인
				</p>
			) : (
				`${user.displayName}님 안녕하세요`
			)}

			<div id="firebaseui-auth-container"></div>
		</header>
	)
}
