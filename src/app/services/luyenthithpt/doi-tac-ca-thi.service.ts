import { Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';


import {
  DtoObject,
  IctuConditionParam,
  IctuQueryCondition,
  IctuQueryParams,
} from '@model/dto';
import { IctuBaseServiceClass } from '@model/ictu-base-service';
import { TnShiftRoom } from '@model/tn-shift-room';
import { TnQLCathi } from '@model/tn-ql-ca-thi';

export interface DoitacCaThiInfo {
  search: string;
}

@Injectable({
  providedIn: 'any',
})
export class DoitacCaThiService extends IctuBaseServiceClass<TnQLCathi> {
  constructor() {
    super('shifts');
  }

  load(
    info: DoitacCaThiInfo,
    donvi_id: number,
    _queryParams?: Partial<IctuQueryParams>
  ): Observable<DtoObject<TnQLCathi[]>> {
    const queryParams: IctuQueryParams = Object.assign<
      IctuQueryParams,
      IctuQueryParams
    >(
      {
        limit: 20,
        paged: 1,
        include: donvi_id,
        include_by:'donvi_id'
      },
      _queryParams
    );

    const conditions: IctuConditionParam[] = [];
   
    if (info.search) {
      conditions.push({
        conditionName: 'name',
        condition: IctuQueryCondition.like,
        value: `%${info.search}%`,
      });
    }
    return this.query(conditions, queryParams);
  }
}
