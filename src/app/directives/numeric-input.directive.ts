import { Directive , HostListener } from '@angular/core';

@Directive( {
	selector   : '[numericInput]' ,
	standalone : true
} )
export class NumericInputDirective {
	@HostListener( 'beforeinput' , [ '$event' ] )
	onBeforeInput ( event : InputEvent ) : void {
		if ( event.data && ! /[\d.,]/.test( event.data ) ) {
			event.preventDefault(); // Ngăn không cho nhập ký tự lạ
		}
	}

	@HostListener( 'input' , [ '$event' ] )
	onInput ( event : Event ) : void {
		const input = event.target as HTMLInputElement;
		input.value = input.value.replace( /[^0-9.,]/g , '' );
	}
}
