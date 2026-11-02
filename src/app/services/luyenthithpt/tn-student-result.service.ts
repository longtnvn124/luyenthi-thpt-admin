import { Injectable } from '@angular/core';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dto , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from '@model/dto';
import { TnStudentResult } from '@model/tn-student-result';
import { HttpParamsHeplerService } from '@service/core/http-params-hepler.service';
import { getApiRouteLink } from "@env";

@Injectable( {
	providedIn : 'root'
} )
export class TnStudentResultService {
	
	private readonly api : string = getApiRouteLink( 'student-test-result/' );
	
	constructor (
		private http : HttpClient ,
		private httpParamsHelper : HttpParamsHeplerService
	) {
	}
	
	getLimitStudentAndSession ( shift_test_session_id : number , student_id : number ) : Observable<{
		recordsTotal : number;
		data : TnStudentResult[]
	}> {
		const fromObject : IctuQueryParams = {
			limit   : '-1' ,
			orderby : 'id' ,
			order   : 'desc'
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_test_session_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : shift_test_session_id.toString() ,
				orWhere       : "and" ,
			} ,
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
	
	getUnlimitedBySesstionIds (
		ids : number[] ,
		student_id? : number
	) : Observable<{ recordsTotal : number; data : TnStudentResult[] }> {
		const fromObject : IctuQueryParams      = {
			include    : ids.join( "," ) ,
			include_by : "shift_test_session_id" ,
			limit      : "-1" ,
			order      : "asc"
		};
		const conditions : IctuConditionParam[] = [];
		if ( student_id ) {
			conditions.push( {
					conditionName : "student_id" ,
					condition     : IctuQueryCondition.equal ,
					value         : student_id.toString() ,
					orWhere       : "and" ,
				} ,
			)
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
	
	addTnStudentResult ( data : any ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe(
			map( res => res.data )
		);
	}
	
	updateTnStudentResult ( deXuatId : number , data : any ) : Observable<any> {
		return this.http.put<Dto>( this.api.concat( deXuatId.toString() ) , data ).pipe(
			map( res => res.data )
		);
	}
	
	getAllTnStudentResult () : Observable<TnStudentResult[]> {
		//const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
		return this.http.get<Dto>( this.api ).pipe(
			map( res => res.data )
		);
	}
	
	deleteTnStudentResult ( id : number ) : Observable<any> {
		return this.http.delete<Dto>( this.api.concat( id.toString() ) ).pipe(
			map( res => res.data )
		);
	}
	
	getTnStudentResultByCol ( col : string , item : any ) : Observable<TnStudentResult[]> {
		const filter = new HttpParams().set( 'condition' , col.concat( ',=,' , item ) );
		return this.http.get<Dto>( this.api , { params : filter } ).pipe(
			map( res => res.data )
		);
	}
	
	getTnStudentResultByCols ( condition : HttpParams ) : Observable<TnStudentResult[]> {
		return this.http.get<Dto>( this.api , { params : condition } ).pipe(
			map( res => res.data )
		);
	}
	
	getTTnStudentResultByItem ( email : string , col : string ) : Observable<any> {
		const by = new HttpParams().set( 'by' , col );
		return this.http.get<Dto>( this.api.concat( email ) , { params : by } ).pipe(
			map( res => res.data )
		);
	}
	
	getTTnStudentResultByShiftTest_ids ( ids : number[] ) : Observable<any[]> {
		const fromObject : IctuQueryParams = {
			include    : ids.join( ',' ) ,
			include_by : 'shift_test_id' ,
			limit      : '-1'
		};
		const params                       = new HttpParams( { fromObject } );
		
		return this.http.get<Dto>( this.api , { params } ).pipe( map( res => res.data ) );
	}
}
