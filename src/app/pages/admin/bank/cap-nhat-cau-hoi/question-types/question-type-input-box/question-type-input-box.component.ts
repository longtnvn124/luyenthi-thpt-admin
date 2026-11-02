import { Component , Input , OnInit } from '@angular/core';
import {Question} from "@model/question";
import {formatAnswerCorrect} from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import {NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
// import { Question } from '@shared/models/question';
// import { formatAnswerCorrect } from '@modules/admin/features/nganhang-cauhoi/models/bank-questions';

@Component({
	standalone: true,
	selector: 'question-type-input-box',
	templateUrl: './question-type-input-box.component.html',
	imports: [
		NgIf,
		FormsModule
	],
	styleUrls: ['./question-type-input-box.component.css']
})
export class QuestionTypeInputBoxComponent implements OnInit {

	@Input() set question( question : Question ) {
		if ( question ) {
			this._question  = question;
			this.raw_answer = question.answer_correct ? question.answer_correct.split( '|' ).map( t => t ? t.trim() : '' ).filter( Boolean ).join( ';' ) : '';
		} else {
			this._question  = null;
			this.raw_answer = '';
		}
	}

	raw_answer : string;

	@Input() confirmOnDelete : boolean = false;

	private _question : Question;

	get question() : Question {
		return this._question;
	}

	constructor() { }

	ngOnInit() : void {
	}

	updateAnswer() : void {
		if ( this.raw_answer ) {
			this.question.answer_correct = '|' + this.raw_answer.split( ';' ).map( t => t ? formatAnswerCorrect( t ).toLowerCase() : '' ).filter( Boolean ).join( '|' ) + '|';
		} else {
			this.question.answer_correct = '';
		}
	}
}
