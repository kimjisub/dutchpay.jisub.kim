import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import * as serviceWorker from './serviceWorker'
import './firebase'

import './index.scss'
import App from './route/App'
import MainPage from './route/MainPage'
import Groups from './route/Groups'
import Group from './route/Group'
import Receipt from './route/Receipt'
import Member from './route/Member'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />}>
					<Route index element={<MainPage />} />
					<Route path="groups">
						<Route index element={<Groups />} />
						<Route path=":groupId" element={<Group />}>
							<Route path="receipts/:receiptId" element={<Receipt />} />
							<Route path="members/:memberId" element={<Member />} />
						</Route>
					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
)

serviceWorker.unregister()
