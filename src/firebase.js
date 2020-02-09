import * as firebase from 'firebase'
let config = {
	apiKey: 'AIzaSyD3hlx9Awv5tfpt1PfANj6VIfcZDkbKw1o',
	authDomain: 'dutchpay-f08a8.firebaseapp.com',
	databaseURL: 'https://dutchpay-f08a8.firebaseio.com',
	projectId: 'dutchpay-f08a8',
	storageBucket: 'dutchpay-f08a8.appspot.com',
	messagingSenderId: '642004610065',
	appId: '1:642004610065:web:7d0db593ddccb9101355b0',
	measurementId: 'G-0Y9XGCYDRR'
}

export const firestore = () => {
	if (!firebase.apps.length) firebase.initializeApp(config)
	return firebase.firestore()
}
