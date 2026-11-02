import { Pipe , PipeTransform } from '@angular/core';
import {questionPrefix} from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";


@Pipe( {
	name       : 'questionPrefix' ,
	standalone : true
} )
export class QuestionPrefixPipe implements PipeTransform {

	transform( index : number ) : string {
		return questionPrefix( index );
	}
}
