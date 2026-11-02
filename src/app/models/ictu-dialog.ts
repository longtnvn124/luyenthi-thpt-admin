export interface IctuDialogButon {
	label : string;
	name : string;
	icon : string;
	class : string;
}

export interface IctuDialog {
	visible : boolean;
	content : string; // html content
	heading : string;
	type : IctuDialogType;
	cssClass : string;
	buttons? : IctuDialogButon[];
}

export type IctuDialogType = 'primary' | 'danger' | 'success'
