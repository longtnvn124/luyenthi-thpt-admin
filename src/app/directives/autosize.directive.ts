import { Directive , ElementRef , HostListener , Input } from '@angular/core';

@Directive( {
	selector   : 'textarea[autosize]' ,
	standalone : true
} )
export class AutosizeDirective {

	constructor ( private el : ElementRef<HTMLTextAreaElement> ) {
	}

	@Input() elementEquationTo : HTMLElement;

	@HostListener( 'input' ) onInput () : void {
		const textarea : HTMLTextAreaElement = this.el.nativeElement;
		textarea.style.height                = 'auto';
		setTimeout( () : void => {
			let maxHeight : number = textarea.scrollHeight;
			if ( this.elementEquationTo ) {
				maxHeight                           = Math.max( maxHeight , this.elementEquationTo.clientHeight );
				this.elementEquationTo.style.height = maxHeight + 'px';
			}
			textarea.style.height = maxHeight + 'px';
		} , 1000 )
	}

	ngAfterViewInit () : void {
		this.onInput(); // Resize khi khởi tạo
	}

}
