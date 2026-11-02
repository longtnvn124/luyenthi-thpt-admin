import { Injectable } from '@angular/core';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dto , DtoObject } from '@model/dto';
import { TnShiftTestControl } from '@model/tn-shift-test-control';
import { AppSocketEventControlName } from '@service/socket/app-socket.service';
import { getApiRouteLink } from "@env";

@Injectable( {
	providedIn : 'root'
} )
export class TnShiftTestControlService {
	
	private readonly api : string = getApiRouteLink( 'shift-test-controls/' );
	
	constructor (
		private http : HttpClient ,
	) {
	}
	
	controlShiftStudentTest ( user_id : number , data : {
		title : string,
		shift_student_test_id : number
	} , event : AppSocketEventControlName ) : Observable<any> {
		return this.http.post<Dto>( this.api.concat( 'control-shift-student-test' ) , { user_id , data , event } );
	}
	
	addTnShiftTestControl ( data : any ) : Observable<number> {
		return this.http.post<Dto>( this.api , data ).pipe( map( ( res : DtoObject<number> ) : number => res.data ) );
	}
	
	updateTnShiftTestControl ( deXuatId : number , data : any ) : Observable<any> {
		return this.http.put<Dto>( this.api.concat( deXuatId.toString() ) , data ).pipe(
			map( res => res.data )
		);
	}
	
	getTnShiftTestControlByCols ( condition : HttpParams ) : Observable<TnShiftTestControl[]> {
		return this.http.get<Dto>( this.api , { params : condition } ).pipe(
			map( res => res.data )
		);
	}
}
