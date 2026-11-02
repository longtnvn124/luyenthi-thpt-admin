import { Injectable } from "@angular/core";
import { HttpClient , HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
	Dto ,
	DtoObject ,
	IctuConditionParam ,
	IctuPaginator ,
	IctuQueryCondition ,
	IctuQueryParams ,
} from "@model/dto";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { TnShiftStudentTest } from "@model/tn-shift-student-test";
import { TnShiftTestSession } from "@model/tn-shift-test-session";
import { getApiRouteLink } from "@env";

@Injectable( {
	providedIn : "root" ,
} )
export class TnShiftStudentTestService {
	
	private readonly api : string = getApiRouteLink( "shift-student-tests/" );
	
	constructor (
		private http : HttpClient ,
		private themeSettingsService : ThemeSettingsService ,
		private httpParamsHelper : HttpParamsHeplerService
	) {
	}
	
	create ( data : Partial<TnShiftStudentTest> ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe(
			map( res => res.data )
		);
	}
	
	update ( deXuatId : number , data : any ) : Observable<any> {
		return this.http
		.put<Dto>( this.api.concat( deXuatId.toString() ) , data )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getByStudentId ( student_id : number ) : Observable<{ recordsTotal : number, data : TnShiftStudentTest[] }> {
		const fromObject : IctuQueryParams = {
			order   : "desc" ,
			orderby : "id" ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "student_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : student_id.toString() ,
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
	
	getByStudentIds ( studentIds : number[] , caThiId : number ) : Observable<TnShiftStudentTest[]> {
		const fromObject : IctuQueryParams = {
			include    : studentIds.join( ',' ) ,
			include_by : 'student_id' ,
			limit      : '-1' ,
			order      : 'desc' ,
			select     : 'id ,student_id, total_point' ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : caThiId.toString() ,
				orWhere       : "and" ,
			} ,
			{
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : '2' ,
				orWhere       : "and" ,
			} ,
		];
		// const params = new HttpParams({ fromObject });
		const params                            = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( res => {
				return res.data
			} )
		);
		
	}
	
	getByStudentIdsV2 ( studentIds : number[] ) : Observable<TnShiftStudentTest[]> {
		const fromObject : IctuQueryParams = {
			include    : studentIds.join( ',' ) ,
			include_by : 'student_id' ,
			limit      : '-1' ,
			order      : 'desc' ,
			select     : 'student_id, total_point, status' ,
		};
		const params : HttpParams          = new HttpParams( { fromObject } );
		return this.http.get<DtoObject<TnShiftStudentTest[]>>( this.api , { params } ).pipe(
			map( ( { data } : DtoObject<TnShiftStudentTest[]> ) : TnShiftStudentTest[] => data )
		);
	}
	
	getLimitByStudentIdsV2 ( page : number , rows : number , studentIds : number[] , shift_id : number , status : number , sort : 'asc' | 'desc' ) : Observable<IctuPaginator<TnShiftStudentTest>> {
		const fromObject : IctuQueryParams = {
			include    : studentIds.join( ',' ) ,
			include_by : 'student_id' ,
			limit      : rows ,
			paged      : page ,
			order      : sort ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : shift_id.toString() ,
				orWhere       : "and" ,
			} ,
		
		];
		
		if ( status && status !== 3 ) {
			conditions.push(
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.equal ,
					value         : status.toString() ,
					orWhere       : "and" ,
				} ,
			)
		}
		
		
		// const params = new HttpParams({ fromObject });
		const params = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( res => {
				return {
					data         : res.data ,
					rows         : res.count ,
					totalRecords : res.recordsFiltered
				}
			} )
		);
		
	}
	
	getLimitedByCaThiId ( page : number , caThiId : number , rows? : number ) : Observable<{
		recordsTotal : number;
		data : TnShiftStudentTest[]
	}> {
		const fromObject : IctuQueryParams = {
			paged      : page ,
			include_by : "id" ,
			limit      : rows ? rows : this.themeSettingsService.settings.rows ,
			order      : "desc" ,
			orderby    : "id" ,
			groupby    : 'student_id' ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : caThiId.toString() ,
				orWhere       : "and" ,
			} ,
			{
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : "2" ,
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
	
	getUnLimitedByCaThiId ( page : number , caThiId : number , rows? : number ) : Observable<{
		recordsTotal : number;
		data : TnShiftStudentTest[]
	}> {
		const fromObject : IctuQueryParams = {
			limit   : '-1' ,
			order   : "desc" ,
			orderby : "id" ,
			groupby : 'student_id' ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : caThiId.toString() ,
				orWhere       : "and" ,
			} ,
			{
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : "2" ,
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
	
	getLimitedByCaThiIdV2 ( page : number , caThiId : number , sort : 'asc' | 'desc' , rows? : number , status? : number , student_ids? : number[] ) : Observable<{
		recordsTotal : number;
		data : TnShiftStudentTest[]
	}> {
		let fromObject : IctuQueryParams = {
			paged   : page ,
			limit   : rows ? rows : this.themeSettingsService.settings.rows ,
			order   : sort ,
			orderby : "id" ,
			
		};
		
		if ( student_ids && student_ids.length > 0 ) {
			fromObject = {
				... fromObject ,
				include    : student_ids.join( "," ) ,
				include_by : 'student_id'
			}
		}
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : caThiId.toString() ,
				orWhere       : "and" ,
			}
		];
		if ( status !== null && status !== 3 ) { // 3 là tất cả nên không cần thêm điều kiện
			conditions.push( {
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : status.toString() ,
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
	
	getAllByStudentIdsAndShiftId ( ids : number[] , caThiId : number , status? : number ) : Observable<TnShiftStudentTest[]> {
		const fromObject : IctuQueryParams = {
			include    : ids.join( ',' ) ,
			include_by : 'student_id' ,
			limit      : '-1' ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : caThiId.toString() ,
				orWhere       : "and" ,
			} ,
		];
		
		
		if ( status ) {
			conditions.push(
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.equal ,
					value         : status.toString() ,
					orWhere       : "and" ,
				} ,
			)
		}
		// const params = new HttpParams({ fromObject });
		const params = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<Dto>( this.api , { params } ).pipe( map( res => res.data ) );
	}
	
	getUnLimitedByIdAndShift ( caThiId : number , student_id : number ) : Observable<{
		recordsTotal : number;
		data : TnShiftTestSession[]
	}> {
		const fromObject : IctuQueryParams = {
			limit   : '-1' ,
			orderby : 'id' ,
			order   : 'desc'
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : caThiId.toString() ,
				orWhere       : "and" ,
			} ,
			{
				conditionName : "student_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : student_id.toString() ,
				orWhere       : "and" ,
			} ,
			{
				conditionName : 'status' ,
				condition     : IctuQueryCondition.equal ,
				value         : '2'
			}
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
	
	getSesstionAndShiftTest ( id : number ) : Observable<{
		recordsTotal : number,
		data : TnShiftStudentTest[]
	}> {
		const fromObject : IctuQueryParams      = {
			order   : "desc" ,
			orderby : "id" ,
			with    : 'test' ,
		};
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "id" ,
				condition     : IctuQueryCondition.equal ,
				value         : id.toString() ,
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
	
	getCountByCathiId ( caThiId : number ) : Observable<{ recordsTotal : number }> {
		
		const fromObject : IctuQueryParams = {
			select : 'id' ,
			limit  : '-1'
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : caThiId.toString() ,
				orWhere       : "and" ,
			} ,
			// {
			//   conditionName: "status",
			//   condition: IctuQueryCondition.equal,
			//   value: caThiId.toString(),
			//   orWhere: "and",
			// }
		];
		const params                            = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( ( res ) => ( {
					recordsTotal : res.recordsFiltered
				}
			) )
		);
	}
	
	getLimitedByIdsAndShift (
		ids : number[] ,
		shift_id : number ,
		page? : number ,
	) : Observable<{ recordsTotal : number; data : TnShiftStudentTest[] }> {
		const fromObject : IctuQueryParams      = {
			paged      : page ?? null ,
			include    : ids.join( "," ) ,
			include_by : "student_id" ,
			limit      : page ? this.themeSettingsService.settings.rows : "-1" ,
			groupby    : 'student_id'
		};
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : shift_id.toString() ,
				orWhere       : "and" ,
			} ,
			{
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : '2' ,
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
	
	
	getCountTest ( shift_ids : number[] ) : Observable<any> {
		// Tạo query parameters
		const params = new HttpParams().set( 'shift_ids' , shift_ids.join( ',' ) ); // Convert array to comma-separated
	                                                                                // string
		
		// Gửi request HTTP GET
		return this.http.get<Dto>( this.api.concat( 'count-test/' ) , { params } ).pipe(
			map( ( res ) => res ) // Xử lý response nếu cần
		);
	}
	
	
	getLimitedByCaThiIdAndStudentIds ( page : number , caThiId : number , student_ids : number[] ) : Observable<{
		recordsTotal : number;
		data : TnShiftStudentTest[]
	}> {
		const fromObject : IctuQueryParams = {
			paged      : page ,
			include_by : "student_id" ,
			limit      : this.themeSettingsService.settings.rows ,
			order      : "desc" ,
			orderby    : "id" ,
			groupby    : 'student_id' ,
			include    : student_ids.join( ',' ) ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : caThiId.toString() ,
				orWhere       : "and" ,
			} ,
			{
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : "2" ,
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
	
	countTestPoint ( shift_id : number ) : Observable<any> {
		const params = new HttpParams().set( 'shift_id' , shift_id.toString() ); // Convert array to comma-separated
	                                                                             // string
		
		// Gửi request HTTP GET
		return this.http.get<Dto>( this.api.concat( 'count-test-point/' ) , { params } ).pipe(
			map( ( res ) => res ) // Xử lý response nếu cần
		);
	}
	
	countPercentStudentTest () : Observable<{ completed : number, remaining : number }> {
		return this.http.get<Dto>( this.api.concat( 'count-percent-student-test/' ) ).pipe( map( ( res ) => res.data ) );
	}
	
}
