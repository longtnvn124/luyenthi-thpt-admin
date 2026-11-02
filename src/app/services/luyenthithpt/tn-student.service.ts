import { Injectable } from "@angular/core";
import { HttpClient , HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Dto , DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams , } from "@model/dto";
import { TnStudent } from "@model/tn-student";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { getApiRouteLink } from "@env";

@Injectable( {
	providedIn : "root" ,
} )
export class TnStudentService {
	
	private readonly api : string = getApiRouteLink( "students/" );
	
	constructor (
		private http : HttpClient ,
		private themeSettingsService : ThemeSettingsService ,
		private httpParamsHelper : HttpParamsHeplerService
	) {
	}
	
	getLimit (
		page : number ,
		filter : { search : string; statusStudent : number } ,
		limit? : number
	) : Observable<{ recordsTotal : number; data : TnStudent[] }> {
		
		const fromObject = {
			search     : filter.search ? filter.search : "" ,
			paged      : page ,
			include_by : "id" ,
			limit      : limit ? limit : this.themeSettingsService.settings.rows ,
			order      : "desc" ,
			orderby    : "id" ,
		};
		
		const conditions : IctuConditionParam[] = [];
		if ( filter.statusStudent !== null ) {
			conditions.push(
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.equal ,
					value         : filter.statusStudent.toString() ,
					orWhere       : 'and'
				} ,
			);
		}
		
		const params : HttpParams = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<DtoObject<TnStudent[]>>( this.api , { params } ).pipe(
			map( ( { recordsFiltered , data } : Dto ) : {
				recordsTotal : number;
				data : TnStudent[]
			} => ( { recordsTotal : recordsFiltered , data } ) )
		);
	}
	
	getUnlimited () : Observable<{ recordsTotal : number; data : TnStudent[] }> {
		const fromObject = {
			include_by : "id" ,
			limit      : -1 ,
			order      : "desc" ,
			orderby    : "id" ,
		};
		
		const params = this.httpParamsHelper.paramsConditionBuilder(
			[] ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( ( res ) => ( {
				recordsTotal : res.recordsFiltered ,
				data         : res.data ,
			} ) )
		);
	}
	
	getUserByIds ( ids : number[] , page? : number ) : Observable<TnStudent[]> {
		const fromObject : IctuQueryParams = {
			include    : ids.join( "," ) ,
			include_by : "id" ,
			limit      : "-1" ,
		};
		const params                       = new HttpParams( { fromObject } );
		
		return this.http
		.get<Dto>( this.api , { params } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getByUserIds ( ids : number[] , page? : number ) : Observable<TnStudent[]> {
		const fromObject : IctuQueryParams = {
			include    : ids.join( "," ) ,
			include_by : "user_id" ,
			limit      : "-1" ,
		};
		const params                       = new HttpParams( { fromObject } );
		
		return this.http
		.get<Dto>( this.api , { params } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getStudentByIds (
		ids : number[] ,
		page? : number ,
		search? : string
	) : Observable<{ recordsTotal : number; data : TnStudent[] }> {
		const fromObject : IctuQueryParams      = {
			paged      : page ?? null ,
			include    : ids.join( "," ) ,
			include_by : "id" ,
			limit      : page ? this.themeSettingsService.settings.rows : "-1" ,
		};
		const conditions : IctuConditionParam[] = [];
		if ( search ) {
			conditions.push(
				{
					conditionName : "hoten" ,
					condition     : IctuQueryCondition.like ,
					value         : `%${ search }%` ,
				} ,
				{
					conditionName : "id" ,
					condition     : IctuQueryCondition.like ,
					value         : `%${ search }%` ,
					orWhere       : "or" ,
				}
			);
		}
		
		const params = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( ( res ) => ( {
				recordsTotal : res.recordsFiltered ,
				data         : res.data ,
			} ) )
		);
	}
	
	getLimitedStudentByName (
		name : string ,
		page : number
	) : Observable<{ recordsTotal : number; data : TnStudent[] }> {
		const fromObject : IctuQueryParams      = {
			paged      : page ?? null ,
			include_by : "id" ,
			limit      : page ? this.themeSettingsService.settings.rows : "-1" ,
		};
		const conditions : IctuConditionParam[] = [];
		if ( name ) {
			conditions.push( {
				conditionName : "hoten" ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ name }%` ,
			} );
		}
		
		const params = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( ( res ) => ( {
				recordsTotal : res.recordsFiltered ,
				data         : res.data ,
			} ) )
		);
	}
	
	getUnLimitedStudentByNameOrCode (
		search : string
	) : Observable<{ recordsTotal : number; data : TnStudent[] }> {
		const fromObject : IctuQueryParams      = {
			limit : "-1" ,
			order : 'ASC'
		};
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "hoten" ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ search }%` ,
			} ,
			{
				conditionName : "id" ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ search }%` ,
				orWhere       : "or" ,
			}
		];
		
		
		const params = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( ( res ) => ( {
				recordsTotal : res.recordsFiltered ,
				data         : res.data ,
			} ) )
		);
	}
	
	getUnlimitedStudentByName (
		name : string
	) : Observable<{ recordsTotal : number; data : TnStudent[] }> {
		const fromObject : IctuQueryParams      = {
			include_by : "id" ,
			limit      : "-1" ,
		};
		const conditions : IctuConditionParam[] = [];
		if ( name ) {
			conditions.push( {
				conditionName : "hoten" ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ name }%` ,
			} );
		}
		
		const params = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( ( res ) => ( {
				recordsTotal : res.recordsFiltered ,
				data         : res.data ,
			} ) )
		);
	}
	
	
	addTnStudent ( data : any ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe( map( ( res ) => res.data ) );
	}
	
	updateTnStudent ( deXuatId : number , data : any ) : Observable<any> {
		return this.http
		.put<Dto>( this.api.concat( deXuatId.toString() ) , data )
		.pipe( map( ( res ) => res.data ) );
	}
	
	
	getAllTnStudent () : Observable<TnStudent[]> {
		//const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
		return this.http.get<Dto>( this.api ).pipe( map( ( res ) => res.data ) );
	}
	
	deleteTnStudent ( id : number ) : Observable<any> {
		return this.http
		.delete<Dto>( this.api.concat( id.toString() ) )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getTnStudentByCol ( col : string , item : any ) : Observable<TnStudent[]> {
		const filter = new HttpParams().set( "condition" , col.concat( ",=," , item ) );
		return this.http
		.get<Dto>( this.api , { params : filter } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getTnStudentByCols ( condition : HttpParams ) : Observable<TnStudent[]> {
		return this.http
		.get<Dto>( this.api , { params : condition } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getTnStudentByItem ( email : string , col : string ) : Observable<any> {
		
		const by = new HttpParams().set( "by" , col );
		return this.http
		.get<Dto>( this.api.concat( email ) , { params : by } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	deleteTnStudentByEmail ( email : string ) : Observable<any> {
		const by = new HttpParams().set( "by" , "email" );
		return this.http
		.delete<Dto>( this.api.concat( email ) , { params : by } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getAllLcmsProfile () : Observable<TnStudent[]> {
		//const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
		return this.http.get<Dto>( this.api ).pipe( map( ( res ) => res.data ) );
	}
	
	countStudent () : Observable<number> {
		return this.http.get<Dto>( this.api.concat( 'count-student/' ) ).pipe( map( ( res ) => res.data ) );
	}
	
	
}
