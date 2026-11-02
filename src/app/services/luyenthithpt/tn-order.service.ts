import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getApiRouteLink } from '@env';
import { Dto, IctuConditionParam, IctuQueryCondition, IctuQueryParams } from '@model/dto';
import { Order } from '@model/order';
import { HttpParamsHeplerService } from '@service/core/http-params-hepler.service';
import { ThemeSettingsService } from '@service/core/theme-settings.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TnOrderService {
  private readonly api = getApiRouteLink('orders/');

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService
  ) {
  }

  create(data: Partial<Order>): Observable<any> {
    return this.http.post<Dto>(this.api, data).pipe(map(res => res.data));
  }

  update(deXuatId: number, data: Partial<Order>): Observable<any> {
    return this.http.put<Dto>(this.api.concat(deXuatId.toString()), data).pipe(
      map(res => res.data)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<Dto>(this.api.concat(id.toString())).pipe(
      map(res => res.data)
    );
  }

  getLimit(
    page: number,
    searchUserIds:number[] | null = null ,
    status: number | null = null,
    limit: number
  ): Observable<{ recordsTotal: number; data: Order[] }> {
    const fromObject: IctuQueryParams = {
      paged: page,
      limit : limit ? limit: this.themeSettingsService.settings.rows,
      include_by: "user_id",
      include: searchUserIds && searchUserIds.length > 0 ? searchUserIds.join(",") : '',
      order: "desc",
      orderby: "id",
    };

    const conditions: IctuConditionParam[] = [
      // {
      //   conditionName: "status",
      //   condition: IctuQueryCondition.equal,
      //   value: '15',
      //   orWhere: "and",
      // },
    ];

    
    if(status !== null){
      conditions.push(
        {
          conditionName: "status",
          condition: IctuQueryCondition.equal,
          value: status.toString(),
          orWhere: "and",
        },
      )
    }
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

  countOrder(): Observable<number>{
    return this.http.get<Dto>(this.api.concat('count-order/')).pipe(map((res) => res.data));
  }

  statRevenue(): Observable<number>{
    return this.http.get<Dto>(this.api.concat('stat-revenue/')).pipe(map((res) => res.data));
  }
}
