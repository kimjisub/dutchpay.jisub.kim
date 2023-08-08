export type MembersType = { [key in string]: string }

export interface Group {
	name: string
	admins: string[]
	timestamp: Date
	members: MembersType
}
