import { Injectable } from '@angular/core';
import { IctuDropdownOption } from '@model/commons';
import {
  DtoObject,
  IctuConditionParam,
  IctuQueryCondition,
  IctuQueryParams,
} from '@model/dto';
import { IctuBaseServiceClass } from '@model/ictu-base-service';

import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'any',
})
export class FormsService extends IctuBaseServiceClass<any> {
  constructor() {
    super('forms');
  }

  load(
    ids: string,
    _queryParams?: Partial<IctuQueryParams>
  ): Observable<DtoObject<any[]>> {
    const queryParams: IctuQueryParams = Object.assign<
      IctuQueryParams,
      IctuQueryParams
    >(
      {
        limit: -1,
        paged: 1,
        include: ids,
        include_by: 'id',
        order: 'ASC',
        orderby: 'name',
        select: 'id,name',
      },
      _queryParams
    );

    const conditions: IctuConditionParam[] = [];

    return this.query(conditions, queryParams);
  }
}
