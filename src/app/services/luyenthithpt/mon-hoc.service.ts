import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Dto , DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams , } from "@model/dto";
import { MonHoc } from "@model/mon-hoc";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import {
	BehaviorSubject ,
	catchError ,
	debounceTime ,
	distinctUntilChanged ,
	map ,
	Observable ,
	of ,
	switchMap ,
	take
} from "rxjs";
import { IctuBaseServiceClass } from "@model/ictu-base-service";
import { AbstractControl , AsyncValidatorFn } from "@angular/forms";
import { IctuDropdownOption } from "@model/commons";
import { Bank } from "@model/tn-bank";

type SlugAsyncValidatorResponse = { slugExists : boolean } | null;

@Injectable( {
	providedIn : "root" ,
} )
export class MonHocService extends IctuBaseServiceClass<MonHoc> {
	
	constructor (
		private themeSettingsService : ThemeSettingsService
	) {
		super( 'dm-subjects' );
	}
	
	load ( search : string , _queryParams? : Partial<IctuQueryParams> ) : Observable<DtoObject<MonHoc[]>> {
		const queryParams : IctuQueryParams = Object.assign<IctuQueryParams , IctuQueryParams>( {
			orderby : "name" ,
			order   : "ASC" ,
			limit   : this.themeSettingsService.settings.rows ,
			paged   : 1 ,
		} , _queryParams );
		
		const conditions : IctuConditionParam[] = [];
		if ( search ) {
			conditions.push(
				{
					conditionName : 'name' ,
					value         : `%${ search }%` ,
					condition     : IctuQueryCondition.like
				}
			)
		}
		return this.query( conditions , queryParams );
	}
	
	listSubjectsAsOptions () : Observable<IctuDropdownOption<number>[]> {
		const queryParams : IctuQueryParams     = {
			orderby : "name" ,
			order   : "ASC" ,
			limit   : -1 ,
			paged   : 1 ,
			select  : 'id,name,status'
		};
		const conditions : IctuConditionParam[] = [];
		return this.query( conditions , queryParams ).pipe( map(
			( res : DtoObject<MonHoc[]> ) : IctuDropdownOption<number>[] => {
				return res.data.map( ( s : MonHoc ) : IctuDropdownOption<number> => ( {
					value    : s.id ,
					label    : s.name ,
					disabled : ! s.status
				} ) )
			}
		) )
	}
	
	getSubjectById  ( id : number , select? : string ) : Observable<MonHoc> {
		const fromObject : IctuQueryParams = select ? { select } : {};
		const params : HttpParams          = new HttpParams( { fromObject } );
		return this.http.get<DtoObject<MonHoc>>( ''.concat( this.api , id.toString( 10 ) ) , { params } ).pipe(
			map( ( res : DtoObject<MonHoc> ) : MonHoc => res.data )
		);
	}
	
	getSubjectByIds ( ids : number[] ) : Observable<MonHoc[]> {
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
	
	addMonHoc ( data : any ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe( map( ( res ) => res.data ) );
	}
	
	updateMonHoc ( deXuatId : number , data : any ) : Observable<any> {
		return this.http
		.put<Dto>( this.api.concat( deXuatId.toString() ) , data )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getAllMonHoc () : Observable<MonHoc[]> {
		//const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
		return this.http.get<Dto>( this.api ).pipe( map( ( res ) => res.data ) );
	}
	
	deleteMonHoc ( id : number ) : Observable<any> {
		return this.http
		.delete<Dto>( this.api.concat( id.toString() ) )
		.pipe( map( ( res ) => res.data ) );
	}
	
	getMonHocByCol ( col : string , item : any ) : Observable<MonHoc[]> {
		const filter = new HttpParams().set( "condition" , col.concat( ",=," , item ) );
		return this.http
		.get<Dto>( this.api , { params : filter } )
		.pipe( map( ( res ) => res.data ) );
	}
	
	checkSlugExists () : AsyncValidatorFn {
		const subject                                                  = new BehaviorSubject<string>( '' );
		const queryParams : IctuQueryParams                            = { limit : 1 , paged : 1 , select : 'id' }
		const debouncedInput$ : Observable<SlugAsyncValidatorResponse> = subject.asObservable().pipe(
			distinctUntilChanged() ,
			debounceTime( 1000 ) ,
			switchMap( ( slug : string ) : Observable<DtoObject<MonHoc[]>> => {
				const conditions : IctuConditionParam[] = [
					{
						conditionName : 'slug' ,
						condition     : IctuQueryCondition.like ,
						value         : slug ,
					}
				];
				return this.query( conditions , queryParams )
			} ) ,
			map( ( response : DtoObject<MonHoc[]> ) : SlugAsyncValidatorResponse => ( response.data.length ? { slugExists : true } : null ) ) ,
			take( 1 ) ,
			catchError( () : Observable<null> => of( null ) )
		);
		return ( control : AbstractControl ) : Observable<SlugAsyncValidatorResponse> => {
			if ( ! control.value || control.parent.get( 'id' )?.value ) {
				return of( null );
			}
			subject.next( control.value );
			return debouncedInput$;
		};
	}
}
