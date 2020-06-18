import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import * as serviceWorker from './serviceWorker'
import { firestore } from './firebase'

import './index.scss'
import Header from './route/Header'
import MainPage from './route/MainPage'
import Group from './route/Group'
import Receipt from './route/Receipt'
import Member from './route/Member'

window.$fs = firestore()

ReactDOM.render(
	<Router>
		<Route path="/:groupId/receipt/:receiptId" component={Receipt} />
		<Route path="/:groupId/member/:memberId" component={Member} />

		<Route component={Header} />
		<Switch>
			<Route path="/:groupId" component={Group} />
			<Route exact path="/" component={MainPage} />
		</Switch>
	</Router>,
	document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
