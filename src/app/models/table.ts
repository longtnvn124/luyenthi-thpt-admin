export interface Table {
}

export interface Column<T> {
	field : T;
	header : string;
	innerHTML? : boolean;
	styleClass? : string;
	styleClassHead? : string;
	styleClassCell? : string;
}
