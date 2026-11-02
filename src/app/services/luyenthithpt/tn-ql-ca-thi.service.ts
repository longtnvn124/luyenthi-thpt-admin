import { Injectable } from "@angular/core";
import { HttpClient , HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Dto , IctuConditionParam , IctuQueryCondition , IctuQueryParams , } from "@model/dto";
import { TnQLCathi } from "@model/tn-ql-ca-thi";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import { getApiRouteLink } from "@env";

@Injectable( {
	providedIn : "root" ,
} )
export class TnQLCathiService {
	private readonly api : string = getApiRouteLink( "shifts/" );
	
	constructor (
		private http : HttpClient ,
		private httpParamsHelper : HttpParamsHeplerService ,
		private themeSettingsService : ThemeSettingsService
	) {
	}
	
	addTnQLCathi ( data : any ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe( map( ( res ) => res.data ) );
	}
	
	updateTnQLCathi ( deXuatId : number , data : any ) : Observable<any> {
		return this.http
		.put<Dto>( this.api.concat( deXuatId.toString() ) , data )
		.pipe( map( ( res ) => res.data ) );
	}
	
	deleteTnQLCathi ( id : number ) : Observable<any> {
		return this.http
		.delete<Dto>( this.api.concat( id.toString() ) )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getTnQLCathiByCol ( col : string , item : any ) : Observable<TnQLCathi[]> {
		const filter = new HttpParams().set( "condition" , col.concat( ",=," , item ) );
		return this.http
		.get<Dto>( this.api , { params : filter } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getTnQLCathiLimit (
		page : number ,
		search : string ,
		limit? : number
	) : Observable<{ recordsTotal : number; data : TnQLCathi[] }> {
		const fromObject : IctuQueryParams = {
			paged      : page ,
			include_by : "id" ,
			limit      : limit ? limit : this.themeSettingsService.settings.rows ,
			order      : "desc" ,
			orderby    : "id" ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "name" ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ search }%` ,
				orWhere       : "and" ,
			} ,
		];
		const params                            = this.httpParamsHelper.paramsConditionBuilder(
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
	
	getTnQLCathiLimitByStatus (
		page : number ,
		search : string ,
		status? : number ,
		limit? : number ,
	) : Observable<{ recordsTotal : number; data : TnQLCathi[] }> {
		const fromObject : IctuQueryParams = {
			paged : page ,
			
			limit      : limit ? limit : this.themeSettingsService.settings.rows ,
			order      : "desc" ,
			orderby    : "id" ,
			include    : ! status ? '1,2' : status ,
			include_by : 'status'
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "name" ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ search }%` ,
				orWhere       : "and" ,
			} ,
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
	
	getTnQLCathi_fromKetQuaThiLimit (
		page : number ,
		search : string ,
		status : string
	) : Observable<{ recordsTotal : number; data : TnQLCathi[] }> {
		const fromObject : IctuQueryParams = {
			paged      : page ,
			include_by : "id" ,
			limit      : this.themeSettingsService.settings.rows ,
			order      : "desc" ,
			orderby    : "id" ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "name" ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ search }%` ,
				orWhere       : "and" ,
			} ,
		];
		
		if ( status == "2" ) {
			conditions.push( {
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : status ,
				orWhere       : "and" ,
			} );
		}
		else {
			conditions.push(
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.notEqual ,
					value         : "4" ,
					orWhere       : "and" ,
				} ,
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.notEqual ,
					value         : "0" ,
					orWhere       : "and" ,
				} ,
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.notEqual ,
					value         : "-1" ,
					orWhere       : "and" ,
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
	
	getTnQLCathi_fromKetQuaThiUnLimit (
		search : string ,
		status : string
	) : Observable<{ recordsTotal : number; data : TnQLCathi[] }> {
		const fromObject : IctuQueryParams = {
			include_by : "id" ,
			limit      : '-1' ,
			order      : "desc" ,
			orderby    : "id" ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "name" ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ search }%` ,
				orWhere       : "and" ,
			} ,
		];
		
		if ( status == "3" ) {
			conditions.push( {
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : status ,
				orWhere       : "and" ,
			} );
		}
		else {
			conditions.push(
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.notEqual ,
					value         : "4" ,
					orWhere       : "and" ,
				} ,
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.notEqual ,
					value         : "0" ,
					orWhere       : "and" ,
				} ,
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.notEqual ,
					value         : "-1" ,
					orWhere       : "and" ,
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
	
	importTest ( data , test_num : number , limit : string ) : Observable<any> {
		const params = new HttpParams()
		.set( "sinhde" , limit )
		.set( "test_num" , test_num.toString() )
		.set( "status" , "0" );
		return this.http
		.put<Dto>( this.api.concat( data.id.toString() ) , data , { params : params } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	importTestNormal ( data , test_num : number ) : Observable<any> {
		const params = new HttpParams()
		.set( "normal" , "true" )
		.set( "test_num" , test_num.toString() )
		.set( "status" , "0" );
		return this.http
		.post<Dto>( this.api.concat( "sinhde/" ).concat( data.id.toString() ) , data , {
			params : params ,
		} )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getTnQLCathiById ( id : number ) : Observable<TnQLCathi> {
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "id" ,
				condition     : IctuQueryCondition.equal ,
				value         : id.toString() ,
			} ,
		];
		
		const params = this.httpParamsHelper.paramsConditionBuilder( conditions );
		return this.http
		.get<Dto>( this.api , { params } )
		.pipe( map( ( res ) => res.data[ 0 ] ) );
	}
	
	
	//  ========================================= stat point================================
	getShiftByOptionDashborad (
		option : 'all' | 'active' | 'complete' | 'new' = 'new'
	) : Observable<{ recordsTotal : number; data : TnQLCathi[] }> {
		
		const fromObject : IctuQueryParams = {
			include_by : "id" ,
			limit      : option == 'all' ? '-1' : '6' ,
			order      : "desc" ,
			orderby    : "id" ,
		};
		
		const conditions : IctuConditionParam[] = [];
		
		if ( option == "active" ) {
			conditions.push( {
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : '1' , //active status
				orWhere       : "and" ,
			} );
		}
		else if ( option == 'complete' ) {
			conditions.push( {
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : '2' , //complete status
				orWhere       : "and" ,
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
}
