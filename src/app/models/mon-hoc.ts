import { IctuBaseModel } from "@model/commons";

export interface MonHoc extends IctuBaseModel {
	name : string,
	slug : string,
	desc : string,
	ordering : number,
	status : number,
}
