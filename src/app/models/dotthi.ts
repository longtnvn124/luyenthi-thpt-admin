import { IctuBaseModel } from '@model/commons';

export interface DotThi extends IctuBaseModel {
	id : number;
	name : string;
	date_start : string; // sql Date YYYY-MM-DD
	date_end : string; // sql Date YYYY-MM-DD
	status : number;
	ngaythi_dukien : string; // sql Date YYYY-MM-DD
}

export type DotThiOption = Pick<DotThi , 'id' | 'name' | 'ngaythi_dukien' | 'date_start' | 'date_end' | 'status'>
