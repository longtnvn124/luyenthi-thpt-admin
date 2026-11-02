export interface SystemConfig {
	id : number;
	config_key : string;
	title : string;
	icon: string | null;
	value : number; // 0 : off | 1 : on
	params: string;
	created_by : number;
	updated_by : number;
	created_at : string;
	updated_at : string;
}
