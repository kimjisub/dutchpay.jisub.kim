import * as firebase from 'firebase'
let config = {
	apiKey: 'AIzaSyAYR9LYnb-vqVTkN6QgqVvV1hg2qf6CWe4',
	authDomain: 'kimjisub-5d9ac.firebaseapp.com',
	databaseURL: 'https://kimjisub-5d9ac.firebaseio.com',
	projectId: 'kimjisub-5d9ac',
	storageBucket: 'kimjisub-5d9ac.appspot.com',
	messagingSenderId: '351624661410',
	appId: '1:351624661410:web:aec9f6be502499b2248afb'
}

export const firestore = () => {
	if (!firebase.apps.length) firebase.initializeApp(config)
	return firebase.firestore()
}
