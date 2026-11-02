import { Component , Input , OnInit } from '@angular/core';
import { Answers , Question } from "@model/question";
import { maxAnswerOptionId , questionPrefix , SelectOptions } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import { OpenFileManagerService } from "@service/core/open-file-manager.service";
import { InputQuestionDirectionComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/input-question-direction.component";
import { NgClass , NgForOf , NgIf } from "@angular/common";
import { CheckboxModule } from "primeng/checkbox";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { FormsModule } from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { LoadMediaOnTextDirective } from "../../../../../../directives/load-media-on-text.directive";
import { SafeHtmlSinglePipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";

interface RadioAnswerOption {
	answer : Answers,
	prefix : string
}

@Component( {
	standalone  : true ,
	selector    : 'question-type-radio-editor' ,
	templateUrl : './question-type-radio-editor.component.html' ,
	imports     : [
		InputQuestionDirectionComponent ,
		NgClass ,
		NgIf ,
		CheckboxModule ,
		ButtonModule ,
		RippleModule ,
		FormsModule ,
		DropdownModule ,
		LoadMediaOnTextDirective ,
		SafeHtmlSinglePipe ,
		NgForOf
	] ,
	styleUrls   : [ './question-type-radio-editor.component.css' ]
} )
export class QuestionTypeRadioEditorComponent implements OnInit {

	@Input() set question ( question : Question ) {

		if ( question ) {
			this._question = question;
			this.options   = question.answer_option.reduce( ( reducer : RadioAnswerOption[] , answer : Answers , index : number ) : RadioAnswerOption[] => {
				reducer.push( { answer , prefix : questionPrefix( index ) } );
				return reducer;
			} , new Array<RadioAnswerOption>() );

			this.change++;
			this.isPresent = false;
		}
	}

	@Input() multiple : boolean = false; // checkbox if = true;

	@Input() set present ( question : Question | any ) {
		if ( question ) {
			this._question = question;
			this.options   = question.answer_option.reduce( ( reducer : RadioAnswerOption[] , answer : Answers , index : number ) : RadioAnswerOption[] => {
				reducer.push( { answer , prefix : questionPrefix( index ) } );
				return reducer;
			} , new Array<RadioAnswerOption>() );
			this.change++;
			this.isPresent = true;
		}
	}

	isPresent : boolean = false;

	private _question : Question;

	get question () : Question {
		return this._question;
	}

	options : RadioAnswerOption[];

	colOptions : SelectOptions<number>[] = [
		{ value : 1 , label : 'Hiển thị 1 phương án / dòng' , disable : false } ,
		{ value : 2 , label : 'Hiển thị 2 phương án / dòng' , disable : false } ,
		{ value : 3 , label : 'Hiển thị 3 phương án / dòng' , disable : false } ,
		{ value : 4 , label : 'Hiển thị 4 phương án / dòng' , disable : false }
	];

	change : number = 0;

	constructor ( private openFileManagerService : OpenFileManagerService ) {
	}

	ngOnInit () : void {
	}

	addMoreAnswerOption () : void {
		if ( this.question ) {
			if ( ! this.question.answer_option || ! Array.isArray( this.question.answer_option ) ) {
				this.question.answer_option = [];
			}
			const maxId : number   = maxAnswerOptionId( this.question );
			const answer : Answers = { id : ( 1 + maxId ).toString( 10 ) , value : '' };
			this.question.answer_option.push( answer );
			this.options.push( { answer , prefix : questionPrefix( this.options.length ) } );
		}
	}

	isCorrectAnswer ( a : Answers ) : boolean {
		return this.question.answer_correct ? this.question.answer_correct.replace( /\|/gmi , '' ).split( ',' ).filter( Boolean ).map( ( t : string ) : string => t.trim() ).includes( a.id ) : false;
	}

	markCorrectAnswer ( a : Answers ) : void {
		if ( this.multiple ) {
			const arrCorrect : string[]     = this.question.answer_correct.replace( /\|/gmi , '' ).split( ',' ).filter( Boolean ).map( ( t : string ) : string => t.trim() );
			const _newArrCorrect : string[] = arrCorrect.includes( a.id ) ? arrCorrect.filter( ( o : string ) : boolean => o !== a.id ) : [ ... arrCorrect , a.id ];
			if ( _newArrCorrect.length ) {
				this.question.answer_correct = '|' + _newArrCorrect.sort().join( ',' ) + '|';
			}
			else {
				this.question.answer_correct = '';
			}
		}
		else {
			this.question.answer_correct = '|' + a.id + '|';
		}
	}

	deleteAnswer ( option : RadioAnswerOption ) : void {
		this.options                 = this.options.filter( ( o : RadioAnswerOption ) : boolean => o.answer.id !== option.answer.id ).map( ( o : RadioAnswerOption , index : number ) : RadioAnswerOption => {
			o.prefix = questionPrefix( index );
			return o;
		} );
		this.question.answer_option  = this.question.answer_option.filter( ( q : Answers ) : boolean => q.id !== option.answer.id );
		const arrCorrect : string[]  = this.question.answer_correct.replace( /\|/gmi , '' ).split( ',' ).filter( Boolean ).map( ( t : string ) : string => t.trim() ).filter( ( a : string ) : boolean => a !== option.answer.id );
		this.question.answer_correct = arrCorrect.length ? '|' + arrCorrect.join( ';' ) + '|' : '';
	}
}
