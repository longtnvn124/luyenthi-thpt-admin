import { Pipe , PipeTransform } from '@angular/core';
import { BankQuestionEditorNode } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { BankQuestionAnswerOption } from "@model/bank-question";

@Pipe( {
	name       : 'matchCorrectAnswers' ,
	standalone : true
} )
export class MatchCorrectAnswersPipe implements PipeTransform {

	transform ( child : BankQuestionEditorNode , parent : BankQuestionEditorNode ) : string[] {
		if ( parent.options.length && child.correct_answer ) {
			const _keys : string[] = child.correct_answer.replace( /\|/g , ';' ).split( ';' ).filter( Boolean );
			return parent.options.reduce( ( reducer : string[] , option : BankQuestionAnswerOption ) : string[] => {
				if ( _keys.includes( option.value ) ) {
					reducer.push( option.label );
				}
				return reducer;
			} , [] );
		}
		else {
			// return child.correct_answer;
			return [];
		}
	}

}
