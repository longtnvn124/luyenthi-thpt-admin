import { Pipe , PipeTransform } from '@angular/core';

@Pipe( {
	name       : 'presentCorrectAnswer' ,
	standalone : true
} )
export class PresentCorrectAnswerPipe implements PipeTransform {

	transform ( correctAnswer : string ) : string {
		return correctAnswer.split( '|' ).map( t => t ? t.trim() : '' ).filter( Boolean ).join( ';' )
	}

}
