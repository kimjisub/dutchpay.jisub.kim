import React, { Component } from 'react'
import queryString from 'query-string'
import { OverlayTrigger, Popover, Card, ListGroup, Spinner } from 'react-bootstrap'
import { firestore } from '../firebase'
import { Button, Tabs, Tab, IconButton, Menu, MenuItem, Checkbox, Icon } from 'react-mdl'
import './Member.scss'
import EditableTextView from '../components/EditableTextView'

class App extends Component {
	constructor({ match, location }) {
		super()
		this.info = {
			groupId: match.params.groupId,
			memberId: match.params.memberId
		}
		this.location = location
		this.query = queryString.parse(location.search)
		this.state = {
			group: null,
			receipts: {}
		}

		this.fs = firestore()

		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.onSnapshot(doc => {
				let data = (window.$data = doc.data())
				//console.log("Group Data Changed: ", data);
				this.setState({ group: data })
			})

		this.fs
			.collection('DutchPay')
			.doc(this.info.groupId)
			.collection('Receipts')
			.orderBy('timestamp', 'desc')
			.onSnapshot(querySnapshot => {
				querySnapshot.docChanges().forEach(change => {
					let id = change.doc.id
					let data = change.doc.data()
					//console.log("Receipts", change.type, id);

					let s = Object.assign({}, this.state)
					switch (change.type) {
						case 'added':
							s.receipts[id] = data
							break
						case 'modified':
							s.receipts[id] = data
							break
						case 'removed':
							delete s.receipts[id]
							break
						default:
					}
					this.setState(s)
				})
			})
	}

	updateToFB(receipt) {
		if (this.info.receiptId !== 'new')
			this.fs
				.collection('DutchPay')
				.doc(this.info.groupId)
				.collection('Receipts')
				.doc(this.info.receiptId)
				.set(receipt)
				.then(() => {
					this.props.history.push({ pathname: `/${this.info.groupId}`, search: this.state.editMode ? '?edit=true' : '' })
				})
		else
			this.fs
				.collection('DutchPay')
				.doc(this.info.groupId)
				.collection('Receipts')
				.add(receipt)
				.then(() => {
					this.close()
				})
	}

	delete() {
		if (this.info.receiptId !== 'new')
			this.fs
				.collection('DutchPay')
				.doc(this.info.groupId)
				.collection('Receipts')
				.doc(this.info.receiptId)
				.delete()
				.then(() => {
					this.close()
				})
	}

	close() {
		this.props.history.push({ pathname: `/${this.info.groupId}`, search: this.state.editMode ? '?edit=true' : '' })
	}

	render() {
		if (!this.state.group)
			return (
				<div className="Member">
					<div>
						<Spinner animation="border" />
					</div>
				</div>
			)

		return <div></div>
	}
}

export default App
