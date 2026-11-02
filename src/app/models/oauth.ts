import { User } from '@model/user';
import { Ucase } from '@model/ucase';
import { PickRole } from '@model/role';

export interface Oauth {
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
		roles : PickRole[]; // list role name
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
