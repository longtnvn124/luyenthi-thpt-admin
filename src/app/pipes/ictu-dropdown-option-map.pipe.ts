import { Pipe , PipeTransform } from '@angular/core';
import { IctuDropdownOption } from "@model/commons";

@Pipe( {
	name       : 'ictuDropdownOptionMap' ,
	standalone : true
} )
export class IctuDropdownOptionMapPipe implements PipeTransform {
	
	transform<T> ( value : T , options : IctuDropdownOption<T>[] , emptyMessage : string = '' ) : string {
		return options.reduce( ( reducer : string , o : IctuDropdownOption<T> ) : string => ( o.value === value ? o.label : reducer ) , emptyMessage );
	}
}
