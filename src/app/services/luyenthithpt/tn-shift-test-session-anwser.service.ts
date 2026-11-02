import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { getApiRouteLink } from "@env";
import { IctuQueryParams, IctuConditionParam, Dto, IctuQueryCondition } from "@model/dto";
import { TnShiftTest } from "@model/tn-shift-test";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { Observable, map } from "rxjs";

@Injectable( {
	providedIn : 'root'
} )
export class TnShiftTestSessionAnwserService {

	private readonly api = getApiRouteLink('shift-test-session-answer/');

	
	constructor(
		private http : HttpClient,
        private httpParamsHelper: HttpParamsHeplerService,
	) {
	}


    geUlitimited(shiftTestId: number): Observable<{ recordsTotal: number; data: any[] }> {
        const fromObject: IctuQueryParams = {
          limit:  "-1",
          order: "asc",
          orderby: "id",
        };
    
        const conditions: IctuConditionParam[] = [
          {
            conditionName:"shift_test_session_id",
            condition: IctuQueryCondition.equal,
            value: shiftTestId.toString(),
            orWhere: "and",
          },
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

    getUnlimitedByIds(
		ids: number[]
	  ): Observable<{ recordsTotal: number; data: TnShiftTest[] }> {
		const fromObject: IctuQueryParams = {
		  include: ids.join(","),
		  include_by: "id",
		  limit:  "-1",
          order: "asc",
          orderby: "id",
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