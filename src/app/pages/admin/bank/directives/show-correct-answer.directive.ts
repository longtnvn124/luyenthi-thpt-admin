import { Directive } from '@angular/core';

@Directive( {
	selector   : '[appShowCorrectAnswer]' ,
	standalone : true
} )
export class ShowCorrectAnswerDirective {

	constructor () {
	}

}
