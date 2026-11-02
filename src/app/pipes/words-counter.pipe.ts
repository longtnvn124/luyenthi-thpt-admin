import { Pipe , PipeTransform } from '@angular/core';

@Pipe( {
	name       : 'wordsCounter' ,
	standalone : true
} )
export class WordsCounterPipe implements PipeTransform {

	transform ( text : string ) : number {
		return text ? text.trim().split( /\s+/ ).filter( ( word : string ) : boolean => word.length > 0 ).length : 0;
	}

}
