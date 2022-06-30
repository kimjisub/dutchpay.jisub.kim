import { MembersType } from './MembersType'
export type GroupType = {
	name: string
	owner: string
	timestamp: Date
	members: MembersType
}
