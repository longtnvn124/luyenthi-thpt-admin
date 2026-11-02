export interface Role {
	id : number,
	description : string,
	name : string,
	ordering : number,
	title : string
	realm : string,
	ucase_ids : UseCasePermission[],
	provider : RolePermission[],
	is_default : number,
	status : number,
	created_at? : string,
	updated_at? : string,
}

export type PickRole = Pick<Role , 'id' | 'description' | 'name' | 'ordering' | 'title'>;

export interface UseCasePermission {
	id : string, // UseCase name : 'he-thong/thong-tin-tai-khoan'
	pms : string // 1.1.1.1 = access.read.update.delete
}

export interface RolePermission {
	id : string, // router : 'users'
	pms : string // 1.1.1.1 = access.read.update.delete
}
