import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getApiRouteLink } from "@env";
import { Dto } from '@model/dto';
import { TnShiftTestState } from '@model/tn-shift-test-state';

@Injectable({
    providedIn: 'root'
})
export class TnShiftTestStateService {

    // api = ''.concat(environment.server.api, 'shift-test-states/');
    private readonly api = getApiRouteLink('shift-test-states/');
    constructor(
        private http: HttpClient,
    ) {
    }

    addTnShiftTestState(data: any): Observable<any> {
        return this.http.post<Dto>(this.api, data).pipe(
            map(res => res.data)
        );
    }

    updateTnShiftTestState(deXuatId: number, data: any): Observable<any> {
        return this.http.put<Dto>(this.api.concat(deXuatId.toString()), data).pipe(
            map(res => res.data)
        );
    }

    getAllTnShiftTestState(): Observable<TnShiftTestState[]> {
        //const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
        return this.http.get<Dto>(this.api).pipe(
            map(res => res.data)
        );
    }

    // getTnShiftTestStateByShiftTestIds( col : string , item : string , condition : HttpParams ) {
    // 	// include_by? : string; // tên cột
    // 	// include? : string; // ids 12,13,45,67,9,96,69
    // 	return this.http.get<Dto>( this.api.concat( item.toString() ) ).pipe(
    // 		map( res => res.data )
    // 	);
    //
    // }

    countAllTnShiftTestState(): Observable<TnShiftTestState[]> {
        const filter = new HttpParams().set('pluck', 'shift_id');
        return this.http.get<Dto>(this.api, { params: filter }).pipe(
            map(res => res.data)
        );
    }

    deleteTnShiftTestState(id: number): Observable<any> {
        return this.http.delete<Dto>(this.api.concat(id.toString())).pipe(
            map(res => res.data)
        );
    }

    deleteTnShiftTestStateByShiftTestId(id: number): Observable<any> {
        const by = new HttpParams().set('by', 'shift_test_id');
        return this.http.delete<Dto>(this.api.concat(id.toString()), { params: by });
    }

    getTnShiftTestStateByCol(col: string, item: any): Observable<TnShiftTestState[]> {
        const filter = new HttpParams().set('condition', col.concat(',=,', item));
        return this.http.get<Dto>(this.api, { params: filter }).pipe(
            map(res => res.data)
        );
    }

    getTnShiftTestStateByCols(condition: HttpParams): Observable<TnShiftTestState[]> {
        return this.http.get<Dto>(this.api, { params: condition }).pipe(
            map(res => res.data)
        );
    }
    getTnShiftTestStateByItem(item: string, col: string): Observable<any> {
        const by = new HttpParams().set('by', col);
        return this.http.get<Dto>(this.api.concat(item), { params: by }).pipe(
            map(res => res.data)
        );
    }
}
