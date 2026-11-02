import { Pipe , PipeTransform } from '@angular/core';
import { BankQuestion , BankQuestionAnswerOption } from "@model/bank-question";
import { BankQuestionEditorNode } from "@pages/admin/bank/bank-question-types/bank-question-node.model";

@Pipe( {
	name       : 'isAnswerCorrect' ,
	standalone : true
} )
export class IsAnswerCorrectPipe implements PipeTransform {

	transform ( answer : BankQuestionAnswerOption , question : BankQuestion | BankQuestionEditorNode ) : boolean {
		return question.correct_answer.split( '|' ).filter( Boolean ).reduce( ( reducer : boolean , srcAnswer : string ) : boolean => ( reducer || srcAnswer === answer.value ) , false );
	}

}
