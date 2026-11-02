import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getApiRouteLink } from "@env";
import { Dto } from '@model/dto';
import { TnChamThi } from '@model/tn-cham-thi';

@Injectable({
	providedIn: 'root'
})
export class TnChamThiService {

	// api = ''.concat( environment.server.api , 'shift-chamthi/' );
	private readonly api = getApiRouteLink('shift-chamthi/');

	constructor(
		private http: HttpClient
	) {
	}

	addTnChamThi(data: any): Observable<any> {
		return this.http.post<Dto>(this.api, data).pipe(
			map(res => res.data)
		);
	}

	updateTnChamThi(deXuatId: number, data: any): Observable<any> {
		return this.http.put<Dto>(this.api.concat(deXuatId.toString()), data).pipe(
			map(res => res.data)
		);
	}

	getAllTnChamThi(): Observable<TnChamThi[]> {
		//const filter = new HttpParams().set( 'khcn_id' , khcn_id.toString() ); { params : filter }
		return this.http.get<Dto>(this.api).pipe(
			map(res => res.data)
		);
	}

	deleteTnChamThi(id: string): Observable<any> {
		return this.http.delete<Dto>(this.api.concat(id.toString())).pipe(
			map(res => res.data)
		);
	}

	deleteTnChamThiByShiftId(id: number): Observable<any> {
		const by = new HttpParams().set('by', 'shift_id');
		return this.http.delete<Dto>(this.api.concat(id.toString()), { params: by });
	}

	getTnChamThiByCol(col: string, item: any): Observable<TnChamThi[]> {
		const filter = new HttpParams().set('condition', col.concat(',=,', item));
		return this.http.get<Dto>(this.api, { params: filter }).pipe(
			map(res => res.data)
		);
	}

	getTnChamThiByCols(condition: HttpParams): Observable<TnChamThi[]> {
		return this.http.get<Dto>(this.api, { params: condition }).pipe(
			map(res => res.data)
		);
	}

	getTnChamThiPluck(cols: string): Observable<TnChamThi[]> {
		const filter = new HttpParams().set('pluck', cols);
		return this.http.get<Dto>(this.api, { params: filter }).pipe(
			map(res => res.data)
		);
	}
}
