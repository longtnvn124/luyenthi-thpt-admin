import { Injectable } from '@angular/core';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dto , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from '@model/dto';
import { TnShiftRoom } from '@model/tn-shift-room';
import { HttpParamsHeplerService } from '@service/core/http-params-hepler.service';
import { getApiRouteLink } from "@env";

@Injectable( {
	providedIn : 'root'
} )
export class TnShiftRoomService {
	
	private readonly api : string = getApiRouteLink( 'shift-rooms/' );
	
	constructor (
		private http : HttpClient ,
		private httpParamsHelper : HttpParamsHeplerService ,
	) {
	}
	
	addTnShiftRoom ( data : any ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe(
			map( res => res.data )
		);
	}
	
	updateTnShiftRoom ( deXuatId : number , data : any ) : Observable<any> {
		return this.http.put<Dto>( this.api.concat( deXuatId.toString() ) , data ).pipe(
			map( res => res.data )
		);
	}
	
	getAllTnShiftRoomByShiftId ( shift_id : number ) : Observable<TnShiftRoom[]> {
		const fromObject                        = {}
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "shift_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : shift_id.toString() ,
				orWhere       : "and" ,
			} ,
		]
		const params                            = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( res => res.data )
		);
	}
	
	getbyId ( id : number ) : Observable<TnShiftRoom> {
		const fromObject                        = {}
		const conditions : IctuConditionParam[] = [
			{
				conditionName : "id" ,
				condition     : IctuQueryCondition.equal ,
				value         : id.toString() ,
				orWhere       : "and" ,
			} ,
		]
		const params                            = this.httpParamsHelper.paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject } )
		);
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( res => res.data[ 0 ] )
		);
	}
	
	getAllByShiftIds ( shiftids : number[] ) : Observable<TnShiftRoom[]> {
		const fromObject : IctuQueryParams = {
			include    : shiftids.join( "," ) ,
			include_by : "shift_id" ,
			limit      : "-1" ,
		};
		const params                       = new HttpParams( { fromObject } );
		return this.http
		.get<Dto>( this.api , { params } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	deleteTnShiftRoom ( id : number ) : Observable<any> {
		return this.http.delete<Dto>( this.api.concat( id.toString() ) ).pipe(
			map( res => res.data )
		);
	}
}
