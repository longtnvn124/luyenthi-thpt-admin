import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { getApiRouteLink } from "@env";
import { Dto, IctuConditionParam, IctuQueryCondition, IctuQueryParams } from "@model/dto";
import { TnShiftTestSession } from "@model/tn-shift-test-session";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TnShiftTestSessionService {
  private readonly api = getApiRouteLink("shift-test-session/");

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService
  ) {}

  getLimited(page: number,search: string): Observable<{ recordsTotal: number; data: any[] }> {
    const fromObject: IctuQueryParams = {
      paged: page,
      include_by: "id",
      limit: this.themeSettingsService.settings.rows,
      order: "desc",
      orderby: "id",
      groupby: 'student_id'
    };

    const conditions: IctuConditionParam[] = [
      // {
      //   conditionName: "name",
      //   condition: IctuQueryCondition.like,
      //   value: `%${search}%`,
      //   orWhere: "and",
      // },
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

  getLimitedByCaThiId(page: number, caThiId: number, rows?: number): Observable<{ recordsTotal: number; data: TnShiftTestSession[] }> {
    const fromObject: IctuQueryParams = {
      paged: page,
      include_by: "id",
      limit: rows ? rows : this.themeSettingsService.settings.rows,
      order: "desc",
      orderby: "id",
      groupby: 'student_id',
    };

    const conditions: IctuConditionParam[] = [
      {
        conditionName: "shift_id",
        condition: IctuQueryCondition.equal,
        value: caThiId.toString(),
        orWhere: "and",
      },
      {
        conditionName: "status",
        condition: IctuQueryCondition.equal,
        value: "2",
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

  getCountByCathiId(caThiId: number): Observable<{ recordsTotal: number}> {
    
    const fromObject: IctuQueryParams = {
      select: 'id',
      limit: '-1'
    };

    const conditions: IctuConditionParam[] = [
      {
        conditionName: "shift_id",
        condition: IctuQueryCondition.equal,
        value: caThiId.toString(),
        orWhere: "and",
      }
    ];
    const params = this.httpParamsHelper.paramsConditionBuilder(
      conditions,
      new HttpParams({ fromObject })
    );

    return this.http.get<Dto>(this.api, { params }).pipe(
      map((res) => ({
        recordsTotal:res.recordsFiltered
      }
      ))
    );
  }


  getLimitedByCaThiIdV2(page: number, caThiId: number,sort: 'asc' | 'desc', rows?: number, status?: number): Observable<{ recordsTotal: number; data: TnShiftTestSession[] }> {
    const fromObject: IctuQueryParams = {
      paged: page,
      limit: rows ? rows : this.themeSettingsService.settings.rows,
      order: sort,
      orderby: "id",
    };

    const conditions: IctuConditionParam[] = [
      {
        conditionName: "shift_id",
        condition: IctuQueryCondition.equal,
        value: caThiId.toString(),
        orWhere: "and",
      }
    ];
    if (status !== null && status !== 3) { // 3 là tất cả nên không cần thêm điều kiện
      conditions.push({
        conditionName: "status",
        condition: IctuQueryCondition.equal,
        value: status.toString(),
        orWhere: "and",
      });
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

  getUnLimitedByCaThiId( caThiId: number, status?: number): Observable<{ recordsTotal: number; data: TnShiftTestSession[] }> {
    const fromObject: IctuQueryParams = {
      include_by: "id",
      limit: '-1',
      order: "desc",
      orderby: "id",
      groupby: 'student_id',
    };

    const conditions: IctuConditionParam[] = [
      {
        conditionName: "shift_id",
        condition: IctuQueryCondition.equal,
        value: caThiId.toString(),
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

  update(deXuatId: number, data: any): Observable<any> {
    return this.http.put<Dto>(this.api.concat(deXuatId.toString()), data).pipe(
      map(res => res.data)
    );
  }

  getLimitedByCaThiIdAndStudentIds(page: number, caThiId: number, student_ids: number[]): Observable<{ recordsTotal: number; data: TnShiftTestSession[] }> {
    const fromObject: IctuQueryParams = {
      paged: page,
      include_by: "student_id",
      limit: this.themeSettingsService.settings.rows,
      order: "desc",
      orderby: "id",
      groupby: 'student_id',
      include: student_ids.join(','),
    };

    const conditions: IctuConditionParam[] = [
      {
        conditionName: "shift_id",
        condition: IctuQueryCondition.equal,
        value: caThiId.toString(),
        orWhere: "and",
      },
      {
        conditionName: "status",
        condition: IctuQueryCondition.equal,
        value: "2",
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


  getLimitedByIdAndShift(caThiId: number,student_id: number): Observable<{ recordsTotal: number; data: TnShiftTestSession[] }> {
    const fromObject: IctuQueryParams = {
      limit: '-1',
      orderby: 'id',
      order: 'desc'
    };

    const conditions: IctuConditionParam[] = [
      {
        conditionName: "shift_id",
        condition: IctuQueryCondition.equal,
        value: caThiId.toString(),
        orWhere: "and",
      },
      {
        conditionName: "student_id",
        condition: IctuQueryCondition.equal,
        value: student_id.toString(),
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

  getLimitedByIdsAndShift(
    ids: number[],
    shift_id: number,
    page?: number,
  ): Observable<{ recordsTotal: number; data: TnShiftTestSession[] }> {
    const fromObject: IctuQueryParams = {
      paged: page ?? null,
      include: ids.join(","),
      include_by: "student_id",
      limit: page ? this.themeSettingsService.settings.rows : "-1",
      groupby: 'student_id'
    };
    const conditions: IctuConditionParam[] = [
      {
        conditionName: "shift_id",
        condition: IctuQueryCondition.equal,
        value: shift_id.toString(),
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

  getAllByStudentIdsAndShiftId(ids : number[], caThiId: number): Observable<TnShiftTestSession[]> {
		const fromObject : IctuQueryParams = {
			include: ids.join(','),
			include_by: 'student_id',
			limit: '-1',
		  };

      const conditions: IctuConditionParam[] = [
        {
          conditionName: "shift_id",
          condition: IctuQueryCondition.equal,
          value: caThiId.toString(),
          orWhere: "and",
        },
      ];
		  // const params = new HttpParams({ fromObject });
      const params = this.httpParamsHelper.paramsConditionBuilder(
        conditions,
        new HttpParams({ fromObject })
      );
		
		return this.http.get<Dto>(this.api,{ params }).pipe(map(res => res.data));
	}

  getAllByStudentIds(ids : number[]): Observable<any[]> {
		const fromObject : IctuQueryParams = {
			include: ids.join(','),
			include_by: 'student_id',
			limit: '-1',
		  };

      const conditions: IctuConditionParam[] = [
        
      ];
		  // const params = new HttpParams({ fromObject });
      const params = this.httpParamsHelper.paramsConditionBuilder(
        conditions,
        new HttpParams({ fromObject })
      );
		
		return this.http.get<Dto>(this.api,{ params }).pipe(map(res => res.data));
	}
}
