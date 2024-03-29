import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

import 'firebase/auth'
import 'firebase/firestore'
let firebaseConfig = {
	apiKey: 'AIzaSyD3hlx9Awv5tfpt1PfANj6VIfcZDkbKw1o',
	authDomain: 'dutchpay-f08a8.firebaseapp.com',
	databaseURL: 'https://dutchpay-f08a8.firebaseio.com',
	projectId: 'dutchpay-f08a8',
	storageBucket: 'dutchpay-f08a8.appspot.com',
	messagingSenderId: '642004610065',
	appId: '1:642004610065:web:7d0db593ddccb9101355b0',
	measurementId: 'G-0Y9XGCYDRR',
}

// Test Project
// firebaseConfig = {
// 	apiKey: "AIzaSyDnwtmJRjv9whKJFnYR9bg7IDlghrmGmOY",
// 	authDomain: "dutchpay-test-21f61.firebaseapp.com",
// 	databaseURL: "https://dutchpay-test-21f61.firebaseio.com",
// 	projectId: "dutchpay-test-21f61",
// 	storageBucket: "dutchpay-test-21f61.appspot.com",
// 	messagingSenderId: "813042392657",
// 	appId: "1:813042392657:web:bde39eecebf75a8c0e2270",
// 	measurementId: "G-B4TD3C97CH"
// }

export const app = initializeApp(firebaseConfig)

export const fs = getFirestore(app)
export const auth = getAuth(app)
