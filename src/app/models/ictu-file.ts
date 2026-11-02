import { IctuBaseModel } from "@model/commons";

export interface IctuFile extends IctuBaseModel {
	name : string,
	title : string,
	tag : string,
	url : string,
	ext : string,
	type : string,
	size : number,
	user_id : number,
	public : number,
	status : number,
}

export type IctuFileSource = 'local' | 'aws' | 'ftp';

export type IctuDocumentType = 'pdf' | 'video' | 'audio' | 'text' | 'image';