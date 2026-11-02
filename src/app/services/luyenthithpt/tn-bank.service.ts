import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dto , DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from '@model/dto';
import { Bank , TnBank } from '@model/tn-bank';
import { HttpParamsHeplerService } from '@service/core/http-params-hepler.service';
import { ThemeSettingsService } from '@service/core/theme-settings.service';
import { IctuBaseServiceClass } from "@model/ictu-base-service";

@Injectable( {
	providedIn : 'any'
} )
export class TnBankService extends IctuBaseServiceClass<Bank> {

	// private readonly api = getApiRouteLink('banks/');
	constructor (
		private httpParamsHelper : HttpParamsHeplerService ,
		private themeSettingsService : ThemeSettingsService
	) {
		super( 'banks' );
	}

	load ( search : string , _queryParams? : Partial<IctuQueryParams> ) : Observable<DtoObject<Bank[]>> {
		const queryParams : IctuQueryParams     = Object.assign<IctuQueryParams , IctuQueryParams>( {
			orderby : "id" ,
			order   : "DESC" ,
			limit   : this.themeSettingsService.settings.rows ,
			paged   : 1
		} , _queryParams );
		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'parent_id' ,
				condition     : IctuQueryCondition.equal ,
				value         : '0'
			}
		];
		if ( search ) {
			conditions.push(
				{
					conditionName : 'name' ,
					value         : `%${ search }%` ,
					condition     : IctuQueryCondition.like ,
					orWhere       : "and"
				}
			)
		}
		return this.query( conditions , queryParams );
	}

	loadChild ( parent_id : number[] , _queryParams? : Partial<IctuQueryParams> ) : Observable<Bank[]> {
		const queryParams : IctuQueryParams     = Object.assign<IctuQueryParams , IctuQueryParams>( {
			limit      : -1 ,
			paged      : 1 ,
			include    : parent_id.join( ',' ) ,
			include_by : 'parent_id'
		} , _queryParams );
		const conditions : IctuConditionParam[] = [];
		return this.query( conditions , queryParams ).pipe( map( ( res : DtoObject<Bank[]> ) : Bank[] => res.data ) )
	}

	getBankById ( id : number , select? : string ) : Observable<Bank> {
		const fromObject : IctuQueryParams = select ? { select } : {};
		const params : HttpParams          = new HttpParams( { fromObject } );
		return this.http.get<DtoObject<Bank>>( ''.concat( this.api , id.toString( 10 ) ) , { params } ).pipe(
			map( ( res : DtoObject<Bank> ) : Bank => res.data )
		);
	}

	getListLimit ( page : number , ten : string ) : Observable<{ recordsTotal : number; data : TnBank[] }> {

		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'parent_id' ,
				condition     : IctuQueryCondition.equal ,
				value         : '0'
			}
		];

		if ( ten ) {
			conditions.push( {
				conditionName : 'name' ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ ten }%`
			} );
		}
		const fromObject          = {
			orderby : 'id' ,
			order   : 'DESC' ,
			limit   : 4 ,
			paged   : page
		};
		const params : HttpParams = this.httpParamsHelper.paramsConditionBuilder( conditions , new HttpParams( { fromObject } ) );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( ( res ) =>
			( { recordsTotal : res.recordsFiltered , data : res.data } ) )
		);
	}

	addTnBank ( data : TnBank ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe( map( res => res.data ) );
	}

	updateTnBank ( deXuatId : number , data : any ) : Observable<any> {
		return this.http.put<Dto>( this.api.concat( deXuatId.toString() ) , data ).pipe(
			map( res => res.data )
		);
	}

	getAllTnBank () : Observable<TnBank[]> {
		//const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
		return this.http.get<Dto>( this.api ).pipe(
			map( res => res.data )
		);
	}

	deleteTnBank ( id : number ) : Observable<any> {
		return this.http.delete<Dto>( this.api.concat( id.toString() ) ).pipe(
			map( res => res.data )
		);
	}

	getTnBankByCol ( col : string , item : any ) : Observable<TnBank[]> {
		const filter = new HttpParams().set( col , item );
		return this.http.get<Dto>( this.api , { params : filter } ).pipe(
			map( res => res.data )
		);
	}

	getTnBankByCol2 ( col : string , item : any ) : Observable<TnBank[]> {
		const filter = new HttpParams().set( 'condition' , col.concat( ',=,' , item ) );
		return this.http.get<Dto>( this.api , { params : filter } ).pipe(
			map( res => res.data )
		);
	}

	getTnBankByCols ( condition : HttpParams ) : Observable<TnBank[]> {
		return this.http.get<Dto>( this.api , { params : condition } ).pipe(
			map( res => res.data )
		);
	}

	getTnBankByItem ( col : string , item : any ) : Observable<TnBank[]> {
		const filter = new HttpParams().set( "by" , col );
		return this.http.get<Dto>( this.api.concat( item.toString() ) , { params : filter } ).pipe(
			map( res => res.data )
		);
	}

	getTnBankByType ( page : number ) : Observable<{ recordsFiltered : any, data : TnBank[] }> {
		const conditions : IctuConditionParam[] = [
			{ conditionName : 'type' , condition : IctuQueryCondition.equal , value : 'THI' } ,
			{ conditionName : 'status' , condition : IctuQueryCondition.equal , value : '1' , orWhere : 'and' } ,
			{ conditionName : 'parent_id' , condition : IctuQueryCondition.equal , value : '0' , orWhere : 'and' }
		];
		const fromObject                        = {
			limit   : '-1' ,
			orderby : 'id' ,
			order   : 'DESC'
		};
		const params                            = this.httpParamsHelper.paramsConditionBuilder( conditions , new HttpParams( { fromObject } ) );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( res => ( {
			recordsFiltered : res.recordsFiltered ,
			data            : res.data
		} ) ) );


	}

	// child
	getAllChildFromParentId ( parent_id : number , ten? : string ) : Observable<{
		recordsTotal : number;
		data : TnBank[]
	}> {
		const fromObject = {
			orderby : 'id' ,
			order   : 'ASC' ,
			limit   : this.themeSettingsService.settings.rows
		};

		const conditions : IctuConditionParam[] = [
			{ conditionName : 'parent_id' , condition : IctuQueryCondition.equal , value : parent_id.toString() }
		];

		if ( ten ) {
			conditions.push( {
				conditionName : 'name' ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ ten }%`
			} );
		}

		const params = this.httpParamsHelper.paramsConditionBuilder( conditions , new HttpParams( { fromObject } ) );
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( ( res ) => ( {
				recordsTotal : res.recordsFiltered ,
				data         : res.data
			} ) )
		);
	}

	// -----------------long viết---------------------------------------------------------
	getallChildByParentId ( parent_id : number ) : Observable<TnBank[]> {
		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'parent_id' ,
				condition     : IctuQueryCondition.equal ,
				value         : parent_id.toString()
			}
		];
		const fromObject                        = {
			orderby : 'id' ,
			order   : 'ASC' ,
			limit   : -1
		};
		const params                            = this.httpParamsHelper.paramsConditionBuilder( conditions , new HttpParams( { fromObject } ) );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( ( res ) => res.data ) );
	}


	getByParentId ( parent_id : number ) : Observable<TnBank[]> {
		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'parent_id' ,
				condition     : IctuQueryCondition.equal ,
				value         : parent_id.toString()
			}
		];
		const params                            = this.httpParamsHelper.paramsConditionBuilder( conditions );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( ( res ) => res.data ) );
	}


	getByIds ( ids : number[] ) : Observable<TnBank[]> {
		const fromObject : IctuQueryParams = {
			include    : ids.join( "," ) ,
			include_by : "id" ,
			limit      : "-1"
		};
		const params                       = new HttpParams( { fromObject } );
		return this.http.get<DtoObject<TnBank[]>>( this.api , { params } ).pipe( map( ( res : DtoObject<TnBank[]> ) : TnBank[] => res.data ) );
	}

	getByParentIds ( ids : number[] ) : Observable<TnBank[]> {
		const fromObject : IctuQueryParams = {
			include    : ids.join( "," ) ,
			include_by : "parent_id" ,
			limit      : "-1"
		};
		const params                       = new HttpParams( { fromObject } );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( ( res ) => res.data ) );
	}

}
