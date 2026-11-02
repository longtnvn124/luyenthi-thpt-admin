import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getApiRouteLink } from '@env';
import {Dto, IctuConditionParam, IctuQueryCondition, IctuQueryParams} from '@model/dto';
import { TnBankQuestion } from '@model/tn-bank-question';
import {TnBank} from "@model/tn-bank";
import {HttpParamsHeplerService} from "@service/core/http-params-hepler.service";

@Injectable( {
  providedIn : 'root'
} )
export class TnBankQuestionService {

  private readonly api = getApiRouteLink('bank-questions/');
  constructor (
    private http : HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
  ) {
  }

  addTnBankQuestion ( data : any ) : Observable<any> {
    return this.http.post<Dto>(this.api,data).pipe(map(res=>res.data));
  }

  updateTnBankQuestion ( deXuatId : any , data : any ) : Observable<any> {
    return this.http.put<Dto>( this.api.concat( deXuatId.toString() ) , data ).pipe(map( res => res.data ));
  }
  getAllTnBankQuestion () : Observable<TnBankQuestion[]> {
    //const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
    return this.http.get<Dto>( this.api).pipe(
      map( res => res.data )
    );
  }

  deleteTnBankQuestion ( id : string ) : Observable<any> {
    return this.http.delete<Dto>(this.api.concat(id.toString())).pipe(map(res=>res.data));
  }

  deleteTnQuestionsBy(col: string, item: string): Observable<any> {
    const by = new HttpParams().set('by', col);
    return this.http.delete<Dto>(this.api.concat(item.toString()), { params: by });
  }

  getTnBankQuestionByCol (col:string,item:any) : Observable<TnBankQuestion[]> {
    const filter = new HttpParams().set( 'condition', col.concat(',=,',item));
    return this.http.get<Dto>(this.api,{params:filter}).pipe(map(res=>res.data));
  }
  getTnBankQuestionByCols( condition: HttpParams ):Observable<TnBankQuestion[]> {
    return this.http.get<Dto>( this.api, { params : condition } ).pipe(
      map( res => res.data )
    );
  }
  getFileLocal( path : string ):Observable<any> {
    return this.http.get(path,{ responseType: 'blob'}).pipe(map(res=>URL.createObjectURL(res)));
  }
  getTnBankQuestionById(col: string, item: any): Observable<TnBankQuestion[]> {
    const filter = new HttpParams().set(col,item);
    return this.http.get<Dto>(this.api,{params: filter}).pipe(
      map(res =>res.data)
    );
  }

  getTnBankQuestionByItem(col: string, item: any): Observable<TnBankQuestion[]> {
    const filter = new HttpParams().set("by", col);
    return this.http.get<Dto>(this.api.concat(item.toString()), {params:filter}).pipe(map(res=>res.data));
  }

  //getQuestionBy by bank id
  getAllQuestionByBankId(bank_id: number): Observable<TnBankQuestion[]> {
    const conditions: IctuConditionParam[] = [
      {conditionName: 'bank_id',
        condition: IctuQueryCondition.equal,
        value: bank_id.toString()}
    ];

    const fromObject = {
      orderby: 'id',
      order: 'ASC',
      limit: -1
    };
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res=> res.data));
  }
  //--------------------------------deleted question ids-------------------
  deleteQuestionByIds(ids: any): Observable<any> {
    return this.http.delete<Dto>(this.api.concat(ids)).pipe(
      map(res => res.data)
    );
  }


  getByIds(ids: number[]): Observable<TnBankQuestion[]>{
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


  getAllByBankIdAndLevel(bank_id: number, level: number): Observable<TnBankQuestion[]>{
    const fromObject: IctuQueryParams = {
      limit: "-1",
    };
    const conditions: IctuConditionParam[] = [
      {
        conditionName: 'bank_id',
        condition: IctuQueryCondition.equal,
        value: bank_id.toString()
      },
      {
        conditionName: 'level',
        condition: IctuQueryCondition.equal,
        value: level.toString()
      }
    ];
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map((res) => res.data ));
  }

  
}
