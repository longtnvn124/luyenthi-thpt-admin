interface BaseDto {
	draw : number;
	recordsTotal : number;
	recordsFiltered : number;
	data : any;
	count? : number;
	code? : string;
	message? : string;
}

export interface DriveDto extends BaseDto {
	next? : string;
}

export interface Dto extends BaseDto {
	next? : number;
	data : any;
}

export interface DtoObject<T> extends Dto {
	data : T;
}

export interface IctuPaginator<T> {
	totalRecords : number;
	rows : number; //Data count to display per page.
	data : Array<T>;
}

export enum IctuQueryCondition {
	like                  = 'LIKE' , // https://www.w3schools.com/sql/sql_like.asp
	equal                 = '=' ,
	greaterThan           = '>' ,
	greaterThanToEqualsTo = '>=' ,
	lessThan              = '<' ,
	lessThanOrEqualsTo    = '<=' ,
	notEqual              = '<>' ,
	notEqualTo            = '!=' ,
	notLike               = 'NOT LIKE' ,
}

// export interface IctuConditionParam<T> {
// 	conditionName : keyof T;
// 	condition? : IctuQueryCondition;
// 	value : string;
// 	orWhere? : IctuOrWhereCondition;
// }

export interface IctuConditionParam {
	conditionName : string | any;
	condition? : IctuQueryCondition;
	value : string;
	orWhere? : IctuOrWhereCondition;
}

export interface IctuConditionParamObject<T> extends IctuConditionParam {
	conditionName : keyof T;
}

export type IctuOrWhereCondition = 'like' | 'andlike' | 'orlike' | 'in' | 'orin' | 'notin' | 'ornotin' | 'and' | 'or';

export type IctuQueryParamName = 'include' | 'include_by' | 'exclude' | 'exclude_by' | 'condition' | 'max' | 'min' | 'sum' | 'avg' | 'limit' | 'offset' | 'paged' | 'orderby' | 'order' | 'groupby' | 'pluck' | 'select' | 'first' | 'with';

export type IctuQueryParams = { [T in IctuQueryParamName]? : string | number }

export const dtoToIctuPaginator : <T>( res : Dto , rows? : number ) => IctuPaginator<T> = <T> ( res : Dto , rows : number = 0 ) : IctuPaginator<T> => ( { totalRecords : res.recordsFiltered , rows , data : res.data as Array<T> } );

