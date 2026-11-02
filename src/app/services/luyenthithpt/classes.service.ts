import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getApiRouteLink } from 'src/environments/environment.prod';
import { Classes } from '@model/classes';
import { Dto } from '@model/dto';

@Injectable( {
	providedIn : 'root'
} )
export class ClassesService {
    private readonly api = getApiRouteLink('class/');
	
	constructor (
		private http : HttpClient
	) {
	}
	
	getAllDataClasses () : Observable<Classes[]> {
		return this.http.get<Dto>( this.api ).pipe(
			map( res => res.data )
		);
	}
	
	getAllDataClassesByUserTeach (user_id : number) : Observable<Classes[]> {
		return this.http.get<Dto>( this.api.concat( '?condition=manager_ids,like,' , user_id.toString() ) ).pipe(
			map( res => res.data )
		);
	}
	
	createDataClasses ( data : any ) : Observable<any> {
		return this.http.post<Dto>( this.api , data ).pipe(
			map( res => res.data )
		);
	}
	
	updateDataClasses ( id : number , data : any ) : Observable<any> {
		return this.http.put<Dto>( this.api.concat( id.toString() ) , data ).pipe(
			map( res => res.data )
		);
	}
	
	deleteDataClasses ( id : number ) : Observable<any> {
		return this.http.delete<Dto>( this.api.concat( id.toString() ) ).pipe(
			map( res => res.data )
		);
    }
    
	getDataClassesByCol ( col:string, item:any ) : Observable<Classes[]> {
		const filter = new HttpParams().set( col , item ); 
		return this.http.get<Dto>( this.api, { params : filter } ).pipe(
			map( res => res.data )
		);
    }
    
    getDataClassesByColAndLimit(col: string, item: any, limit : number): Observable<Classes[]> {
        const filter = new HttpParams().set(col, item).set('orderby', 'id').set('order', 'DESC').set('limit',limit.toString());
        return this.http.get<Dto>(this.api, { params: filter }).pipe(
            map(res => res.data)
        );
    }
    
    getDataClassesByLimit( limit: number): Observable<Classes[]> {
        const filter = new HttpParams().set('orderby', 'id').set('order', 'DESC').set('limit', limit.toString());
        return this.http.get<Dto>(this.api, { params: filter }).pipe(
            map(res => res.data)
        );
    }
    
    getPluckClassesByCol(): Observable<Classes[]> {
        const filter = new HttpParams().set('pluck','hocky,namhoc');
        return this.http.get<Dto>(this.api, { params: filter }).pipe(
            map(res => res.data)
        );
    }
    
    getTnClassesByItem(item: string, col: string): Observable<Classes[]> {
        const by = new HttpParams().set('by', col);
        return this.http.get<Dto>(this.api.concat(item), { params: by }).pipe(
            map(res => res.data)
        );
    }
    
    getClassesByCols(condition: HttpParams): Observable<Classes[]> {
        return this.http.get<Dto>(this.api, { params: condition }).pipe(
            map(res => res.data)
        );
    }
    
    getClassPage(start: number, limit: number): Observable<Classes[]> {
        const filter = new HttpParams().set('condition', 'status,<>,-1,and').set('orderby', 'id').set('order', 'DESC').set('limit', limit.toString()).set("offset", start.toString());
        return this.http.get<Dto>(this.api, { params: filter }).pipe(
            map(res => res.data)
        );
    }
    
    getClassPageByCol(start: number, limit: number, col: string, item: any, ): Observable<Classes[]> {
        const filter = new HttpParams().set('condition', 'status,<>,-1,and').set(col, item).set('orderby', 'id').set('order', 'DESC').set('limit', limit.toString()).set("offset", start.toString());
        return this.http.get<Dto>(this.api, { params: filter }).pipe(
            map(res => res.data)
        );
    }
    
    getClassGroupBy(col: string): Observable<Classes[]> {
        const filter = new HttpParams().set('groupby', col).set('pluck', col );
        return this.http.get<Dto>(this.api, { params: filter }).pipe(
            map(res => res.data)
        );
    }
}
