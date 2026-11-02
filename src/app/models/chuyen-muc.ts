export interface ChuyenMuc {
	id : number,
	title : string,
	icon : string,
	slug : string,
	desc : string,
	parent_id : number,
	ordering : number,
	status : -1 | 0 | 1,// -1. Delete; 0: inactive; 1. active		Change Change	Drop Drop
	deleted_by : number,
	created_by : number,
	updated_by : number,
	is_deleted : 0 | 1,
	created_at : string,
	updated_at : string
}
