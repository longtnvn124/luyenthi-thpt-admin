import { Injectable } from '@angular/core';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dto , IctuQueryParams } from '@model/dto';
import { TnShiftTestQuestion } from '@model/tn-shift-test-question';
import { TnStudent } from '@model/tn-student';
import { getApiRouteLink } from "@env";


@Injectable( {
	providedIn : 'root'
} )
export class TnShiftTestQuestionService {
	
	private readonly api : string = getApiRouteLink( 'shift-test-questions/' );
	
	constructor (
		private http : HttpClient
	) {
	}
	
	getUserByIds ( ids : number[] ) : Observable<TnStudent[]> {
		const fromObject : IctuQueryParams = {
			include    : ids.join( ',' ) ,
			include_by : 'id' ,
			limit      : '-1'
		};
		const params                       = new HttpParams( { fromObject } );
		
		return this.http.get<Dto>( this.api , { params } ).pipe( map( res => res.data ) );
	}
	
	addTnShiftTestQuestion ( data : any ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe(
			map( res => res.data )
		);
	}
	
	updateTnShiftTestQuestion ( deXuatId : string , data : any ) : Observable<any> {
		return this.http.put<Dto>( this.api.concat( deXuatId.toString() ) , data ).pipe(
			map( res => res.data )
		);
	}
	
	getAllTnShiftTestQuestion () : Observable<TnShiftTestQuestion[]> {
		//const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
		return this.http.get<Dto>( this.api ).pipe(
			map( res => res.data )
		);
	}
	
	
	countAllTnShiftTestQuestion () : Observable<TnShiftTestQuestion[]> {
		const filter = new HttpParams().set( 'pluck' , 'shift_id' );
		return this.http.get<Dto>( this.api , { params : filter } ).pipe(
			map( res => res.data )
		);
	}
	
	deleteTnShiftTestQuestion ( id : number ) : Observable<any> {
		return this.http.delete<Dto>( this.api.concat( id.toString() ) ).pipe(
			map( res => res.data )
		);
	}
	
	deleteTnShiftTestQuestionByShiftTestId ( id : any ) : Observable<any> {
		const by = new HttpParams().set( 'by' , 'shift_test_id' );
		return this.http.delete<Dto>( this.api.concat( id.toString() ) , { params : by } );
	}
	
	getTnShiftTestQuestionByCol ( col : string , item : any ) : Observable<TnShiftTestQuestion[]> {
		const filter = new HttpParams().set( 'condition' , col.concat( ',=,' , item ) );
		return this.http.get<Dto>( this.api , { params : filter } ).pipe(
			map( res => res.data )
		);
	}
	
	getTnShiftTestQuestionByCols ( condition : HttpParams ) : Observable<TnShiftTestQuestion[]> {
		return this.http.get<Dto>( this.api , { params : condition } ).pipe(
			map( res => res.data )
		);
	}
	
	getTnShiftTestQuestionByItem ( item : string , col : string ) : Observable<any> {
		const by = new HttpParams().set( 'by' , col );
		return this.http.get<Dto>( this.api.concat( item ) , { params : by } ).pipe(
			map( res => res.data )
		);
	}
	
	tinhDiem ( id : number ) : Observable<any> {
		const params = new HttpParams().set( 'tinhdiem' , id.toString() );
		return this.http.post<Dto>( this.api.concat( "tinhdiem/" , id.toString() ) , {} ).pipe(
			map( res => res.data )
		);
	}
	
	
}
