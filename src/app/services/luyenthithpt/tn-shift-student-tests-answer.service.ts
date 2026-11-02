import { Injectable } from "@angular/core";
import { HttpClient , HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Dto , IctuConditionParam , IctuQueryCondition , IctuQueryParams , } from "@model/dto";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { TnShiftStudentTestAnswer } from "@model/tn-shift-student-tests-answer";
import { getApiRouteLink } from "@env";

@Injectable( {
	providedIn : "root" ,
} )
export class TnShiftStudentTestsAnswerService {
	private readonly api : string = getApiRouteLink( "shift-student-tests-answer/" );
	
	constructor (
		private http : HttpClient ,
		private httpParamsHelper : HttpParamsHeplerService
	) {
	}
	
	geUlitimited ( shiftTestId : number ) : Observable<{ recordsTotal : number; data : TnShiftStudentTestAnswer[] }> {
		const fromObject : IctuQueryParams = {
			limit   : "-1" ,
			order   : "asc" ,
			orderby : "id" ,
		};
		
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_student_test_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : shiftTestId.toString() ,
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
	
	create ( data : any ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe(
			map( res => res.data )
		);
	}
	
	update ( deXuatId : number , data : any ) : Observable<any> {
		return this.http
		.put<Dto>( this.api.concat( deXuatId.toString() ) , data )
		.pipe( map( ( res ) => res.data ) );
	}
}
