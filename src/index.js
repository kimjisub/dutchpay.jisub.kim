import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import * as serviceWorker from './serviceWorker'
import './firebase'

import './index.scss'
import App from './routes/App'
import MainPage from './routes/MainPage'
import Groups from './routes/Groups'
import Group from './routes/Group'
import Receipt from './routes/Receipt'
import Member from './routes/Member'

const root = ReactDOM.createRoot(document.getElementById('root'))

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
