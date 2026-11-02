import { Component , Input , OnInit } from '@angular/core';

import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {Question} from "@model/question";
import {arrayShuffle} from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";

@Component({
	standalone: true,
	selector: 'question-type-reorder-words',
	templateUrl: './question-type-reorder-words.component.html',
	imports: [
		FormsModule,
		NgIf
	],
	styleUrls: ['./question-type-reorder-words.component.css']
})
export class QuestionTypeReorderWordsComponent implements OnInit {

	@Input() set question( question : Question ) {
		if ( question ) {
			this._question      = question;
			question.raw_answer = question.raw_answer ? question.raw_answer : '';
		} else {
			this._question = null;
		}
	}

	@Input() confirmOnDelete : boolean = false;

	private _question : Question;

	get question() : Question {
		return this._question;
	}

	constructor() { }

	ngOnInit(): void {
		
	}

	updateAnswer() : void {
		this.question.question_direction = arrayShuffle<string>( this.question.raw_answer.split( '/' ) ).join( '/' );
		this.question.answer_correct     = '|' + this.question.raw_answer.split( '/' ).map( t => t ? t.trim() : null ).filter( Boolean ).join( ' ' ) + '|';
	}
}
