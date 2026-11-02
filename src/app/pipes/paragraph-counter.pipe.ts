import { Pipe , PipeTransform } from '@angular/core';

@Pipe( {
	name       : 'paragraphCounter' ,
	standalone : true
} )
export class ParagraphCounterPipe implements PipeTransform {

	transform ( text : string ) : number {
		return text ? text.split( /\n+/ ).map( ( p : string ) : string => p.trim() ).filter( ( p : string ) : boolean => p.length > 0 ).length : 0;
	}

}
