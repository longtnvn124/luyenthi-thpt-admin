import { Component , Input , OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Answers , GroupingAnswer , Question } from "@model/question";
import { arrayShuffle } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import { InputTextModule } from "primeng/inputtext";
import { FormsModule } from "@angular/forms";
import { InputTextareaModule } from "primeng/inputtextarea";
import { NgIf } from "@angular/common";

// import { GroupingAnswer } from '@shared/models/question';
// import { arrayShuffle } from '@modules/admin/features/nganhang-cauhoi/models/bank-questions';

@Component( {
	standalone  : true ,
	selector    : 'grouping-question' ,
	templateUrl : './grouping-question.component.html' ,
	imports     : [
		InputTextModule ,
		FormsModule ,
		InputTextareaModule ,
		NgIf
	] ,
	styleUrls   : [ './grouping-question.component.css' ]
} )
export class GroupingQuestionComponent implements OnInit {

	@Input() set question ( question : Question ) {
		if ( question.children && Array.isArray( question.children ) && question.children.length ) {
			if ( question.children.length > 2 ) {
				question.children.length = 2;
			}
			else if ( question.children.length < 2 ) {
				question.children.push( {
					question_direction : '' ,
					question_type      : 'grouping' ,
					answer_option      : [] ,
					answer_correct     : '' ,
					group_id           : 0 ,
					media              : null ,
					part               : 0 ,
					level              : null ,
					question_number    : 0 ,
					code               : '' ,
					config             : {
						cols           : 1 ,
						invertedAnswer : false
					} ,
					children           : []
				} );
			}
		}
		else {
			question.children = [
				{
					question_direction : '' ,
					question_type      : 'grouping' ,
					answer_option      : [] ,
					answer_correct     : '' ,
					group_id           : 0 ,
					media              : null ,
					part               : 0 ,
					level              : null ,
					question_number    : 0 ,
					code               : '' ,
					config             : {
						cols           : 1 ,
						invertedAnswer : false
					} ,
					children           : []
				} ,
				{
					question_direction : '' ,
					question_type      : 'grouping' ,
					answer_option      : [] ,
					answer_correct     : '' ,
					group_id           : 0 ,
					media              : null ,
					part               : 0 ,
					level              : null ,
					question_number    : 0 ,
					code               : '' ,
					config             : {
						cols           : 1 ,
						invertedAnswer : false
					} ,
					children           : []
				}
			];
		}
		this._question                = question;
		const selected_one : string[] = question.children[ 0 ].answer_correct ? question.children[ 0 ].answer_correct.replace( /\|/g , '' ).split( ';' ).map( ( t : string ) : string => t ? t.trim() : '' ).filter( Boolean ) : [];
		const selected_two : string[] = question.children[ 1 ].answer_correct ? question.children[ 1 ].answer_correct.replace( /\|/g , '' ).split( ';' ).map( ( t : string ) : string => t ? t.trim() : '' ).filter( Boolean ) : [];
		question.answer_option.forEach( ( a : Answers ) : void => {
			if ( selected_one.includes( a.id ) ) {
				this.answerFirst.collect.push( a );
			}
			else if ( selected_two.includes( a.id ) ) {
				this.answerSecond.collect.push( a );
			}
			else {
				this.disturbedAnswers.collect.push( a );
			}
		} );

		this.answerFirst.text      = this.answerFirst.collect.map( a => a.value ).join( ';' );
		this.answerSecond.text     = this.answerSecond.collect.map( a => a.value ).join( ';' );
		this.disturbedAnswers.text = this.disturbedAnswers.collect.map( a => a.value ).join( ';' );
	}

	private _question : Question;

	get question () : Question {
		return this._question;
	}

	answerFirst : GroupingAnswer = {
		text    : '' ,
		collect : []
	};

	answerSecond : GroupingAnswer = {
		text    : '' ,
		collect : []
	};

	disturbedAnswers : GroupingAnswer = {
		text    : '' ,
		collect : []
	};

	private observeUpdateAnswerOptions$ : Subject<string> = new Subject<string>();

	ngOnInit () : void {
		this.observeUpdateAnswerOptions$.pipe( debounceTime( 1000 ) ).subscribe( () => this._generateAnswerOptions() );
	}

	private _generateAnswerOptions () : void {
		this.question.answer_option                = arrayShuffle( [ this.answerFirst , this.answerSecond , this.disturbedAnswers ].reduce( ( reducer : Answers[] , group : GroupingAnswer ) : Answers[] => {
			if ( group.text ) {
				group.collect = group.text.split( ';' ).map( ( t : string ) : string => t ? t.trim() : '' ).filter( Boolean ).map( ( value : string ) : Answers => {
					return { id : '' , value };
				} );
				reducer.push( ... group.collect );
			}
			else {
				group.collect = [];
			}
			return reducer;
		} , new Array<Answers>() ) ).map( ( answer : Answers , index : number ) : Answers => {
			answer.id = ( 1 + index ).toString( 10 );
			return answer;
		} );
		this.question.children[ 0 ].answer_correct = '|' + this.answerFirst.collect.sort( ( a , b ) => parseInt( a.id ) - parseInt( b.id ) ).map( ( o ) => o.id ).join( ';' ) + '|';
		this.question.children[ 1 ].answer_correct = '|' + this.answerSecond.collect.sort( ( a , b ) => parseInt( a.id ) - parseInt( b.id ) ).map( ( o ) => o.id ).join( ';' ) + '|';
	}

	changesAnswerOptions () : void {
		this.observeUpdateAnswerOptions$.next( 'changed' );
	}
}
