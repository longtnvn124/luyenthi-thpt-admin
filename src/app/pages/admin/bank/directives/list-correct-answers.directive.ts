import { Directive , ElementRef , Input } from '@angular/core';
import { BankQuestionEditorNode } from "@pages/admin/bank/bank-question-types/bank-question-node.model";

@Directive( {
	selector   : '[listCorrectAnswers]' ,
	standalone : true
} )
export class ListCorrectAnswersDirective {

	@Input( { required : true , alias : 'listCorrectAnswers' } ) set data ( question : BankQuestionEditorNode ) {
		this.element.nativeElement.innerHTML = '';
		this.element.nativeElement.appendChild( Object.assign( document.createElement( 'b' ) , { classList : 'lbl-correct-answer' , innerText : 'Đáp án' } ) )
		question.correct_answer.split( '|' ).filter( Boolean ).forEach( ( s : string ) : void => {
			this.element.nativeElement.appendChild( Object.assign( document.createElement( 'span' ) , { classList : 'alert alert-success' , innerText : s.trim() } ) );
		} );
	}

	constructor (
		private element : ElementRef
	) {
	}

}
