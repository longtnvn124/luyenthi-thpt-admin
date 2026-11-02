import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getApiRouteLink } from "@env";
import { Dto, IctuConditionParam, IctuPaginator, IctuQueryCondition, IctuQueryParams } from '@model/dto';
import { TnShiftTest } from '@model/tn-shift-test';
import { HttpParamsHeplerService } from '@service/core/http-params-hepler.service';
import { ThemeSettingsService } from '@service/core/theme-settings.service';

@Injectable({
	providedIn: 'root'
})
export class TnShiftTestService {
	
	private readonly api = getApiRouteLink('shift-tests/');

	constructor(
		private http: HttpClient,
		private httpParamsHelper: HttpParamsHeplerService,
		private themeSettingsService: ThemeSettingsService
	) {
	}

	addTnShiftTest(data: any): Observable<any> {
		return this.http.post<Dto>(this.api, data).pipe(
			map(res => res.data)
		);
	}

	updateTnShiftTest(deXuatId: number, data: any): Observable<any> {
		return this.http.put<Dto>(this.api.concat(deXuatId.toString()), data).pipe(
			map(res => res.data)
		);
	}

	getAllTnShiftTest(): Observable<TnShiftTest[]> {
		//const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
		return this.http.get<Dto>(this.api).pipe(
			map(res => res.data)
		);
	}

	countAllTnShiftTest() : Observable<TnShiftTest[]> {
		const fromObject = {
			orderby: 'shift_id',
			order: 'ASC',
			select: 'shift_id',
			limit: '-1'
		  };
		  const conditions: IctuConditionParam[] = [
		];
		  const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({ fromObject }));
    	return this.http.get<Dto>(this.api, { params }).pipe(map(res => res.data));
		// const filter = new HttpParams().set( 'pluck' , 'shift_id,student_id' );
		// return this.http.get<Dto>( this.api , { params : filter } ).pipe(
		// 	map( res => res.data )
		// );
	}

	getTnShiftTestRoom(col: string, item: any): Observable<TnShiftTest[]> {
		const filter = new HttpParams().set('condition', col.concat(',=,', item)).set('pluck', 'room');
		return this.http.get<Dto>(this.api, { params: filter }).pipe(
			map(res => res.data)
		);
	}

	deleteTnShiftTest(id: number): Observable<any> {
		return this.http.delete<Dto>(this.api.concat(id.toString())).pipe(
			map(res => res.data)
		);
	}

	deleteTnShiftTestByShiftId(id: number): Observable<any> {
		const by = new HttpParams().set('by', 'shift_id');
		return this.http.delete<Dto>(this.api.concat(id.toString()), { params: by });
	}

	getTnShiftTestByCol( col : string , item : any ) : Observable<TnShiftTest[]> {
		const filter = new HttpParams().set( 'condition' , col.concat( ',=,' , item ) );
		return this.http.get<Dto>( this.api , { params : filter } ).pipe(
			map( res => res.data )
		);
	}

	getTnShiftTestById( id: number): Observable<TnShiftTest[]> {
		const fromObject = {
			orderby: 'id',
			order: 'ASC',
			limit: -1,
		  };
		  const conditions: IctuConditionParam[] = [
			{
			conditionName: 'shift_id',
			condition: IctuQueryCondition.equal,
			value: id.toString()
		  }
		];

		const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({ fromObject }));
		return this.http.get<Dto>(this.api, { params }).pipe(map(res => res.data));
		// const filter = new HttpParams().set('condition', col.concat(',=,', item));
		// return this.http.get<Dto>(this.api, { params: filter }).pipe(
		// 	map(res => res.data)
		// );
	}

	getTnShiftTestByCols(condition: HttpParams): Observable<TnShiftTest[]> {
		return this.http.get<Dto>(this.api, { params: condition }).pipe(
			map(res => res.data)
		);
	}

	getUnlimitedByIds(
		ids: number[]
	  ): Observable<{ recordsTotal: number; data: TnShiftTest[] }> {
		const fromObject: IctuQueryParams = {
		  include: ids.join(","),
		  include_by: "id",
		  limit:  "-1"
		};
		const conditions: IctuConditionParam[] = [
			
		];
	
		const params = this.httpParamsHelper.paramsConditionBuilder(
		  conditions,
		  new HttpParams({ fromObject })
		);
	
		return this.http.get<Dto>(this.api, { params }).pipe(
		  map((res) => ({
			recordsTotal: res.recordsFiltered,
			data: res.data,
		  }))
		);
	  }

	getLimitedByIds(
		ids: number[]
	  ): Observable<{ recordsTotal: number; data: TnShiftTest[] }> {
		const fromObject: IctuQueryParams = {
		  include: ids.join(","),
		  include_by: "id",
		  limit:  this.themeSettingsService.settings.rows
		};
		const conditions: IctuConditionParam[] = [
		  
		];
	
		const params = this.httpParamsHelper.paramsConditionBuilder(
		  conditions,
		  new HttpParams({ fromObject })
		);
	
		return this.http.get<Dto>(this.api, { params }).pipe(
		  map((res) => ({
			recordsTotal: res.recordsFiltered,
			data: res.data,
		  }))
		);
	  }


	  

	  
}
