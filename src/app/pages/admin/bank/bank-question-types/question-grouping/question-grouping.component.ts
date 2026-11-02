import { Component , EventEmitter , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , BankQuestionNodeModel , questionCreator } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { Subject , takeUntil } from "rxjs";
import { BankQuestionAnswerOption , BankQuestionType } from "@model/bank-question";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { Helper } from "@utilities/helper";
import { debounceTime } from "rxjs/operators";

export interface GroupCollector {
	text : string;
	options : BankQuestionAnswerOption[];
}

@Component( {
	selector    : 'app-question-grouping' ,
	standalone  : true ,
	imports     : [ CommonModule , FormsModule , InputTextModule , InputTextareaModule ] ,
	templateUrl : './question-grouping.component.html' ,
	styleUrls   : [ './question-grouping.component.css' ]
} )
export class QuestionGroupingComponent implements OnInit , OnDestroy , BankQuestionNodeModel {

	@Input( { required : true } ) question : WritableSignal<BankQuestionEditorNode>;

	@Input( { required : true } ) mode : BankQuestionChildComponentMode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	onDestroy$ : Subject<string> = new Subject();

	private observeAnswerOptionChanged$ : Subject<string> = new Subject<string>();

	readonly group1 : GroupCollector = {
		text    : '' ,
		options : []
	}

	readonly group2 : GroupCollector = {
		text    : '' ,
		options : []
	}

	readonly distractorGroup : GroupCollector = {
		text    : '' ,
		options : []
	}

	ngOnInit () : void {
		if ( this.question().children && Array.isArray( this.question().children ) && this.question().children.length ) {
			if ( this.question().children.length === 1 ) {
				const child2 : BankQuestionEditorNode = questionCreator[ this.question().type ]( this.question() , { question_number : 2 , ordering : 200 } );
				this.question().children.push( child2 );
				this.question().children[ 0 ].question_number = 1;
			}
		}
		else {
			const child1 : BankQuestionEditorNode = questionCreator[ this.question().type ]( this.question() , { question_number : 1 , ordering : 100 } );
			const child2 : BankQuestionEditorNode = questionCreator[ this.question().type ]( this.question() , { question_number : 2 , ordering : 200 } );
			this.question().children              = [ child1 , child2 ];
		}

		this.group1.options             = [];
		this.group2.options             = [];
		this.distractorGroup.options    = [];
		const groupOneValues : string[] = this.question().children[ 0 ].correct_answer ? this.question().children[ 0 ].correct_answer.replace( /\|/g , '' ).split( ';' ).map( ( t : string ) : string => t ? t.trim() : '' ).filter( Boolean ) : [];
		const groupTwoValues : string[] = this.question().children[ 1 ].correct_answer ? this.question().children[ 1 ].correct_answer.replace( /\|/g , '' ).split( ';' ).map( ( t : string ) : string => t ? t.trim() : '' ).filter( Boolean ) : [];
		this.question().options.forEach( ( a : BankQuestionAnswerOption ) : void => {
			if ( groupOneValues.includes( a.value ) ) {
				this.group1.options.push( a );
			}
			else if ( groupTwoValues.includes( a.value ) ) {
				this.group2.options.push( a );
			}
			else {
				this.distractorGroup.options.push( a );
			}
		} );

		this.group1.text          = this.group1.options.map( ( a : BankQuestionAnswerOption ) : string => a.label ).join( '; ' );
		this.group2.text          = this.group2.options.map( ( a : BankQuestionAnswerOption ) : string => a.label ).join( '; ' );
		this.distractorGroup.text = this.distractorGroup.options.map( ( a : BankQuestionAnswerOption ) : string => a.label ).join( '; ' );

		this.observeAnswerOptionChanged$.pipe(
			debounceTime( 1000 ) ,
			takeUntil( this.onDestroy$ )
		).subscribe( () : void => this._convertAnswersToOptions() );
	}

	private _convertAnswersToOptions () : void {
		this.question().options                      = Helper.arrayShuffle<BankQuestionAnswerOption>( [ this.group1 , this.group2 , this.distractorGroup ].reduce( ( reducer : BankQuestionAnswerOption[] , group : GroupCollector ) : BankQuestionAnswerOption[] => {
			const groupAnswers : string[] = group.text.split( ';' ).map( ( t : string ) : string => t ? t.trim() : '' ).filter( Boolean );
			if ( groupAnswers.length ) {
				group.options = groupAnswers.map( ( str : string ) : BankQuestionAnswerOption => {
					return { value : '' , label : str };
				} );
				reducer.push( ... group.options );
			}
			else {
				group.options = [];
			}
			return reducer;
		} , [] ) ).map( ( answer : BankQuestionAnswerOption , index : number ) : BankQuestionAnswerOption => {
			answer.value = ( 1 + index ).toString( 10 );
			return answer;
		} )
		this.question().children[ 0 ].correct_answer = '|' + this.group1.options.sort( ( a : BankQuestionAnswerOption , b : BankQuestionAnswerOption ) : number => parseInt( a.value ) - parseInt( b.value ) ).map( ( o : BankQuestionAnswerOption ) : string => o.value ).join( ';' ) + '|';
		this.question().children[ 1 ].correct_answer = '|' + this.group2.options.sort( ( a : BankQuestionAnswerOption , b : BankQuestionAnswerOption ) : number => parseInt( a.value ) - parseInt( b.value ) ).map( ( o : BankQuestionAnswerOption ) : string => o.value ).join( ';' ) + '|';
		this.markAsDirty.emit( this.question().type );
	}

	triggerChange () : void {
		this.observeAnswerOptionChanged$.next( 'changed' );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroyed' );
		this.onDestroy$.complete();
	}

}
