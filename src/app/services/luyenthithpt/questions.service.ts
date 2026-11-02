import { Injectable } from '@angular/core';
import { IctuBaseServiceClass } from "@model/ictu-base-service";
import { BankQuestion } from "@model/bank-question";
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { Observable } from "rxjs";
import { ThemeSettingsService } from "@service/core/theme-settings.service";

@Injectable( {
	providedIn : 'any'
} )
export class QuestionsService extends IctuBaseServiceClass<BankQuestion> {

	constructor ( private themeSettingsService : ThemeSettingsService ) {
		super( 'questions' );
	}

	get limit () : number {
		return this.themeSettingsService.settings.rows;
	}

	load ( search : string , bankId : number , _queryParams? : Partial<IctuQueryParams> ) : Observable<DtoObject<BankQuestion[]>> {
		const queryParams : IctuQueryParams     = Object.assign<IctuQueryParams , IctuQueryParams>( {
			orderby : "id" ,
			order   : "DESC" ,
			limit   : this.limit ,
			paged   : 1
		} , _queryParams );
		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'bank_id' ,
				condition     : IctuQueryCondition.equal ,
				value         : bankId.toString( 10 )
			}
		];
		if ( search ) {
			conditions.push(
				{
					conditionName : 'content' ,
					value         : `%${ search }%` ,
					condition     : IctuQueryCondition.like ,
					orWhere       : "and"
				}
			)
		}
		return this.query( conditions , queryParams );
	}
}
