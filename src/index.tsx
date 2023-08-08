import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './firebase'
import './index.scss'

import GroupPage from './routes/GroupPage'
import GroupsPage from './routes/GroupsPage'
import IndexPage from './routes/IndexPage'
import MainPage from './routes/MainPage'
import MemberPage from './routes/MemberPage'
import ReceiptPage from './routes/ReceiptPage'
import * as serviceWorker from './serviceWorker'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<IndexPage />}>
				<Route index element={<MainPage />} />
				<Route path="groups">
					<Route index element={<GroupsPage />} />
					<Route path=":groupId" element={<GroupPage />}>
						<Route path="receipts/:receiptId" element={<ReceiptPage />} />
						<Route path="members/:memberId" element={<MemberPage />} />
					</Route>
				</Route>
			</Route>
		</Routes>
	</BrowserRouter>
)

serviceWorker.unregister()
