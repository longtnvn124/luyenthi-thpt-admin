import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { getApiRouteLink } from "@env";
import { map } from "rxjs/operators";
import {
  Dto,
  IctuConditionParam,
  IctuQueryCondition,
  IctuQueryParams,
} from "@model/dto";
import { TnTestForm } from "@model/tn-test-form";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { ThemeSettingsService } from "@service/core/theme-settings.service";

@Injectable({
  providedIn: "root",
})
export class TnTestFormService {
  private readonly api = getApiRouteLink("forms/");

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService
  ) {}

  getAll(): Observable<{ recordsTotal: number; data: TnTestForm[] }> {
    const fromObject = {
      orderby: "id",
      order: "DESC",
      limit: -1,
    };
    const conditions: IctuConditionParam[] = [
      // {
      //   conditionName: "type_bank",
      //   condition: IctuQueryCondition.equal,
      //   value: "THI",
      // },
      {
        conditionName: "scoring_method",
        condition: IctuQueryCondition.equal,
        value: "normal",
        orWhere: "and",
      },
      {
        conditionName: "status",
        condition: IctuQueryCondition.equal,
        value: "1",
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

  addTnTestForm(data: any): Observable<any> {
    return this.http.post<Dto>(this.api, data).pipe(map((res) => res.data));
  }

  updateTnTestForm(deXuatId: number, data: any): Observable<any> {
    return this.http
      .put<Dto>(this.api.concat(deXuatId.toString()), data)
      .pipe(map((res) => res.data));
  }
  getAllTnTestForm(): Observable<TnTestForm[]> {
    //const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
    return this.http.get<Dto>(this.api).pipe(map((res) => res.data));
  }

  deleteTnTestForm(id: number): Observable<any> {
    return this.http
      .delete<Dto>(this.api.concat(id.toString()))
      .pipe(map((res) => res.data));
  }

  getTnTestFormByCol(col: string, item: any): Observable<TnTestForm[]> {
    const filter = new HttpParams().set("condition", col.concat(",=,", item));
    return this.http
      .get<Dto>(this.api, { params: filter })
      .pipe(map((res) => res.data));
  }
  getTnTestFormByCols(condition: HttpParams): Observable<TnTestForm[]> {
    return this.http
      .get<Dto>(this.api, { params: condition })
      .pipe(map((res) => res.data));
  }
  getTnTestFormItem(email: string, col: string): Observable<any> {
    const by = new HttpParams().set("by", col);
    return this.http
      .get<Dto>(this.api.concat(email), { params: by })
      .pipe(map((res) => res.data));
  }

  getLimit(
    page: number,
    search: string,
    limit?: number
  ): Observable<{ recordsTotal: number; data: TnTestForm[] }> {
    const fromObject: IctuQueryParams = {
      paged: page,
      include_by: "id",
      limit: limit ? limit : this.themeSettingsService.settings.rows,
      order: "desc",
      orderby: "id",
    };

    const conditions: IctuConditionParam[] = [
      {
        conditionName: "status",
        condition: IctuQueryCondition.notEqual,
        value: "-1",
        orWhere: "and",
      },

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
      map((res) => ({
        recordsTotal: res.recordsFiltered,
        data: res.data,
      }))
    );
  }
}
