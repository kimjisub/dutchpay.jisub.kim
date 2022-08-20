import { MembersType } from './MembersType'
export type GroupType = {
	name: string
	admins: string[]
	timestamp: Date
	members: MembersType
}
