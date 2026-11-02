import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getApiRouteLink } from '@env';
import { Dto, DtoObject, IctuConditionParam, IctuPaginator, IctuQueryCondition, IctuQueryParams } from '@model/dto';
import { Pack } from '@model/order';
import { HttpParamsHeplerService } from '@service/core/http-params-hepler.service';
import { ThemeSettingsService } from '@service/core/theme-settings.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TnPackService {

  private readonly api = getApiRouteLink('packs/');

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService
  ) {
  }

  create(data: Partial<Pack>): Observable<any> {
    return this.http.post<Dto>(this.api, data).pipe(map(res => res.data));
  }

  update(deXuatId: number, data: Partial<Pack>): Observable<any> {
    return this.http.put<Dto>(this.api.concat(deXuatId.toString()), data).pipe(
      map(res => res.data)
    );
  }

  updateFeatured(id: number): Observable<any> {
    return this.http.put<Dto>(this.api.concat('update-featured/').concat(id.toString()),{}).pipe(
      map(res => res.data)

    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<Dto>(this.api.concat(id.toString())).pipe(
      map(res => res.data)
    );
  }

  getLimit(page: number, search: string, limit?: number): Observable<IctuPaginator<Pack>> {
    const fromObject: IctuQueryParams = {
      paged: page,
      include_by: "id",
      limit : limit ? limit: this.themeSettingsService.settings.rows,
      order: "desc",
      orderby: "id",
    };

    const conditions: IctuConditionParam[] = [
      {
        conditionName: "name",
        condition: IctuQueryCondition.like,
        value: `%${search}%`,
        orWhere: "and",
      },
    ];
    const params = this.httpParamsHelper.paramsConditionBuilder(
      conditions,
      new HttpParams({ fromObject })
    );

    return this.http.get<Dto>(this.api, { params }).pipe(
      map((res) => {
        return {
          totalRecords: res.recordsFiltered,
          data: res.data,
          rows: res.recordsTotal
        }
      }
    )
    );
  }

  getByIds(ids: number[]): Observable<Pack[]> {
    const fromObject: IctuQueryParams = {
      include: ids.join(","),
      include_by: "id",
      limit: "-1",
    };
    const params = new HttpParams({ fromObject });

    return this.http
      .get<Dto>(this.api, { params })
      .pipe(map((res) => res.data));
  }
}
