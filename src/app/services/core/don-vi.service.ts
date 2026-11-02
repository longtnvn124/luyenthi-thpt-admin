
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getApiRouteLink } from '@env';
import { DonVi } from '@model/danh-muc';
import { Dto, IctuConditionParam, IctuQueryCondition } from '@model/dto';
import { AuthService } from '@service/core/auth.service';
import { HelperService } from '@service/core/helper.service';
import { HttpParamsHeplerService } from '@service/core/http-params-hepler.service';
import { ThemeSettingsService } from '@service/core/theme-settings.service';
import { Observable, map } from 'rxjs';


export interface QueryChildrenParam {
  limit?: number,
  orderby?: string,
  order?: string,
  select?: string,
  include?: string,
  include_by?: string,
  exclude?: string,
  exclude_by?: string,
  paged?: number
}

@Injectable({
  providedIn: 'root'
})
export class DonViService {


  // private readonly api = getRoute( 'dm-donvi/' );
  private readonly api = getApiRouteLink('donvi/');

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private helperService: HelperService,
    private themeSettingsService: ThemeSettingsService,
    private auth: AuthService
  ) { }

  createDonVi(data: any): Observable<number> {
    return this.http.post<Dto>(this.api, data).pipe(map(res => res.data));
  }

  updateDonVi(id: number, data: any): Observable<any> {
    return this.http.put<Dto>(''.concat(this.api, id.toString(10)), data);
  }

  deleteDonVi(id: number): Observable<any> {
    const is_deleted = 1;
    const deleted_by = this.auth.user.id;
    return this.updateDonVi(id, { is_deleted, deleted_by });
  }

  getParentList(): Observable<{ id: number; title: string; status: number; }[]> {
    const fromObject = {
      orderby: 'title',
      order: 'ASC',
      select: 'id,title,status',
      limit: '-1'
    };
    const conditions = [
      {
      conditionName: 'parent_id',
      condition: IctuQueryCondition.equal,
      value: '0'
    }
    ];
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({ fromObject }));
    return this.http.get<Dto>(this.api, { params }).pipe(map(res => res.data));
  }

  getParentListLimit(page: number, ten: string): Observable<{ recordsFiltered: number; data: any[]; }> {
    const fromObject = {
      orderby: 'title',
      order: 'ASC',
      select: 'id,title,status,code',
      limit: this.themeSettingsService.settings.rows,
      paged: page,
    };
    const conditions: IctuConditionParam[] = [{
      conditionName: 'parent_id',
      condition: IctuQueryCondition.equal,
      value: '0'
    }
    ];
    if (ten) {
      conditions.push({
        conditionName: 'title',
        condition: IctuQueryCondition.like,
        value: `%${ten}%`,
        orWhere: 'and'
      });
    }

    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({ fromObject }));
    return this.http.get<Dto>(this.api, { params }).pipe(map(res => ({
      recordsFiltered: res.recordsFiltered,
      data: res.data
    })));
  }

  getDanhSachDonVi(paged: number, itemPerPage: number = null, hierarchy = 1): Observable<{ recordsTotal: number; data: DonVi[]; }> {
    const fromObject = {
      hierarchy: hierarchy,
      paged: paged,
      limit: itemPerPage || this.themeSettingsService.settings.rows,
      orderby: 'title',
      order: 'ASC'
    };
    const params = new HttpParams({ fromObject });
    return this.http.get<Dto>(this.api, { params }).pipe(map(res => ({ recordsTotal: res.recordsFiltered, data: this._preSetData(res.data) })));
  }

  private _preSetData(data: DonVi[]): DonVi[] {
    return data && data.length ? data.map(d => {
      d['__status'] = d.status === 0 ? '<span class="badge badge--size-normal badge-danger w-100">Inactive</span>' : '<span class="badge badge--size-normal badge-success w-100">Active</span>';
      return d;
    }) : [];
  }

  getDonViByIds(ids: string, select: string = null): Observable<DonVi[]> {
    const fromObject = { orderby: 'title', order: 'ASC' };
    if (select) {
      fromObject['select'] = select;
    }
    const params = new HttpParams({ fromObject });
    return this.http.get<Dto>(''.concat(this.api, ids), { params }).pipe(map(res => res.data));
  }

  getDsDonVi(): Observable<any> {
    const fromObject = {
      limit: -1,
      select: 'description,id,status,title',
      orderby: 'id',
      order: 'ASC'
    };
    const params = new HttpParams({ fromObject });
    return this.http.get<Dto>(this.api, { params }).pipe(map(res => res.data));
  }

  getDonViById(id: number, select = ''): Observable<DonVi> {
    const fromObject = { limit: 1 };
    if (select) {
      Object.assign(fromObject, { select });
    }
    const params = new HttpParams({ fromObject });
    return this.http.get<Dto>(''.concat(this.api, id.toString(10)), { params }).pipe(map(res => res.data));
  }

  // getChildren(parent_id: number, select = '', isPer = false): Observable<DonVi[]> {
  //   const fromObject = { limit: -1, orderby: 'title', order: 'ASC' };
  //   if (select) {
  //     Object.assign(fromObject, { select });
  //   }
  //   const conditions = [{
  //     conditionName: 'parent_id',
  //     condition: IctuQueryCondition.equal,
  //     value: parent_id.toString(10)
  //   }, {
  //     conditionName: 'id',
  //     condition: IctuQueryCondition.equal,
  //     value: parent_id.toString(10),
  //     orWhere: 'or'
  //   }
  //   ];
  //   const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({ fromObject }));
  //   return this.http.get<Dto>(this.api, { params }).pipe(map(res => res.data));
  // }

  getChildrenFromListParent(parentIds: number[], select = ''): Observable<DonVi[]> {
    const fromObject = { limit: -1, orderby: 'title', order: 'ASC', include: parentIds.join(','), include_by: 'parent_id' };
    if (select) {
      Object.assign(fromObject, { select });
    }
    const params = new HttpParams({ fromObject });
    return this.http.get<Dto>(this.api, { params }).pipe(map(res => res.data));
  }

  queryChildren(parent_id: number, options?: QueryChildrenParam): Observable<{ recordsTotal: number; data: DonVi[]; }> {
    const fromObject = { limit: '10', orderby: 'title', order: 'ASC' };
    if (options) {
      Object.assign(fromObject, options);
    }
    const conditions = [{
      conditionName: 'parent_id',
      condition: IctuQueryCondition.equal,
      value: parent_id.toString(10)
    }];
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({ fromObject }));
    return this.http.get<Dto>(this.api, { params }).pipe(map(res => ({ recordsTotal: res.recordsFiltered, data: res.data })));
  }

  search(page: number, ten: string): Observable<{ recordsTotal: number; data: DonVi[]; }> {
    const conditions: IctuConditionParam[] = [];
    const fromObject = {
      paged: page,
      limit: this.themeSettingsService.settings.rows,
      orderby: 'ten',
      order: 'ASC'
    };
    if (ten) {
      conditions.push({
        conditionName: 'ten',
        condition: IctuQueryCondition.like,
        value: `%${ten}%`,
        orWhere: 'and'
      });
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({ fromObject }));
    return this.http.get<Dto>(this.api, { params }).pipe(map(res => ({
      recordsTotal: res.recordsFiltered,
      data: res.data
    })));
  }

  getDonViByCols(condition: HttpParams): Observable<DonVi[]> {
    return this.http.get<Dto>(this.api, { params: condition }).pipe(
      map(res => res.data)
    );
  }
}
