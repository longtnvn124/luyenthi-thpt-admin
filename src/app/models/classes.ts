import { OvicFileStore } from "./file-store";

export interface Classes {
	id? : number;
	name : string;
	slug : string;
	course_id : number;
	course_info : string;
	user_id : number;
	manager_ids : any;
	manager_info : string;
    status: number;
    image: OvicFileStore[];
    time_start: string;
    time_end: string;
    hocky: string;
    namhoc: string;
    kyhieu: string;
    sotinchi: string;
    category_id: number;
    khoa: string;
    dothoc: number;
    sosv_dangky: number;
    link_googlemeet: LinkGoogleMeet[];
}

export interface LinkGoogleMeet {
    link: string;
    created: string; // thơi gian tạo, cái này get date từ server về, KHÔNG lẤY DATE CỦA CLIENT vì có thể sai khác múi giờ
    creator_id: number
}

export interface OvicDateTime {
    date: string;
    timestamps: number;
}