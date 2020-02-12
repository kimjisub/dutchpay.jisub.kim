import React, { Component } from 'react'
import { Button, Snackbar } from 'react-mdl'

import './MainPage.css'
import { firestore } from '../firebase'

class MainPage extends Component {
	constructor() {
		super()
		this.fs = firestore()
		this.state = {
			err: null
		}
	}

	render() {
		return (
			<div>
				<Button
					raised
					ripple
					onClick={() => {
						this.fs
							.collection('DutchPay')
							.add({
								name: '',
								members: [],
								timestamp: new Date()
							})
							.then(docRef => {
								this.props.history.push({ pathname: `/${docRef.id}`, search: '?edit=true' })
							})
							.catch(err => {
								this.setState({ err: err })
							})
					}}>
					새로 만들기
				</Button>
				<Snackbar
					active={this.state.err != null}
					onClick={this.handleClickActionSnackbar}
					onTimeout={() => {
						this.setState({ err: null })
					}}
					action="Undo">
					{this.state.err}
				</Snackbar>
			</div>
		)
	}
}

export default MainPage
