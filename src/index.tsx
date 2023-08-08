import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './firebase'
import './index.scss'

import App from './routes/App'
import Group from './routes/Group'
import Groups from './routes/Groups'
import MainPage from './routes/MainPage'
import Member from './routes/Member'
import Receipt from './routes/Receipt'
import * as serviceWorker from './serviceWorker'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
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
)

serviceWorker.unregister()
