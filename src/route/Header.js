import React, { useState, useEffect } from 'react'
import firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import './Header.scss'

let auth
let fbui

export default function () {
	const [user, setUser] = useState(null)
	useEffect(() => {
		auth = firebase.auth()
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
									provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
									requireDisplayName: false,
								},
								firebase.auth.GoogleAuthProvider.PROVIDER_ID,
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
