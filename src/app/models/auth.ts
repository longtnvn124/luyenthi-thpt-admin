import { Ucase } from "./ucase";
import { User } from "./user";

export interface SimpleRole {
	id : number;
	description : string,
	name : string,
	ordering : string,
	title : string
}

export interface Auth {
	expires : string;
	session_id : string;
	data : User;
}

export interface Token {
	access_token : string;
	refresh_token : string;
}

export interface Permission {
	data : {
		menus : Ucase[];
		roles : SimpleRole[]; // list role name
	};
}

export interface UserSignIn {
	username : string,
	password : string,
}

export interface GoogleSignIn {
	clientId : string;
	client_id : string;
	credential : string;
	select_by : string;
}

export interface IctuPermissionInfo {
	canView : boolean;
	canUpdate : boolean;
	canDelete : boolean;
	canCreate : boolean;
}

export type UserPermissionName = 'view' | 'update' | 'delete' | 'create';

export type UserPermission = Record<UserPermissionName , boolean>

export type IctuNavigationItemPms = [ number , number , number , number ];