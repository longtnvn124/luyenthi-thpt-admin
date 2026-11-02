import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { getApiRouteLink } from '@env';
import { Dto, IctuConditionParam, IctuQueryCondition } from '@model/dto';
import { TnFormDetail } from '@model/tn-test-form';
import { HttpParamsHeplerService } from '@service/core/http-params-hepler.service';

@Injectable( {
	providedIn : 'root'
} )
export class TnFormDetailService {
	
	private readonly api = getApiRouteLink('form-details/');
	
	constructor (
		private http : HttpClient,
		private httpParamsHelper: HttpParamsHeplerService,
	) {
	}
	
	addTnFormDetail ( data : any ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe(
			map( res => res.data )
		);
	}
	
	updateTnFormDetail ( deXuatId : number , data : any ) : Observable<any> {
		return this.http.put<Dto>( this.api.concat( deXuatId.toString() ) , data ).pipe(
			map( res => res.data )
		);
	}		
	getAllTnFormDetail () : Observable<TnFormDetail[]> {
		//const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
		return this.http.get<Dto>( this.api).pipe(
			map( res => res.data )
		);
	}
	

	getAllTnFormDetailFormId (form_id : number) : Observable<TnFormDetail[]> {
		const conditions: IctuConditionParam[] = [
			{
			  conditionName: 'form_id',
			  condition: IctuQueryCondition.equal,
			  value: form_id.toString()
			},
		  ];
		  const params = this.httpParamsHelper.paramsConditionBuilder(conditions);
		  return this.http.get<Dto>(this.api, {params}).pipe(map((res) => res.data ));
	}

	deleteTnFormDetail ( id : any ) : Observable<any> {
		return this.http.delete<Dto>( this.api.concat( id.toString() ) ).pipe(
			map( res => res.data )
		);
	}

	getTnFormDetailByCol ( col:string, item:any ) : Observable<TnFormDetail[]> {
		const filter = new HttpParams().set( 'condition', col.concat(',=,',item) ); 
		return this.http.get<Dto>( this.api, { params : filter } ).pipe(
			map( res => res.data )
		);
	}
	getTnFormDetailByCols( condition: HttpParams ):Observable<TnFormDetail[]> {		
		return this.http.get<Dto>( this.api, { params : condition } ).pipe(
			map( res => res.data )
		);
    }
    
    deleteTnFormDetailByFormId(id: number): Observable<any> {
        const by = new HttpParams().set('by', 'form_id');
        return this.http.delete<Dto>(this.api.concat(id.toString()), { params: by });
    }
}
