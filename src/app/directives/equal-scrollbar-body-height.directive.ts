import { Directive , ElementRef , Input , numberAttribute , OnDestroy , OnInit } from '@angular/core';
import { debounceTime , Subject } from 'rxjs';

@Directive( {
	selector   : '[appEqualScrollbarBodyHeight]' ,
	standalone : true
} )
export class EqualScrollbarBodyHeightDirective implements OnInit , OnDestroy {

	@Input( { required : true , alias : 'appEqualScrollbarBodyHeight' , transform : numberAttribute } ) maxHeight : number = 100;

	private observeResize : Subject<void> = new Subject<void>();

	constructor( private element : ElementRef ) {
		new ResizeObserver( () => this.observeResize.next() ).observe( this.element.nativeElement );
		this.observeResize.asObservable().pipe( debounceTime( 300 ) ).subscribe( () => {
			let closestParent = this.element.nativeElement.parentNode.closest( '.catch-equal-scrollbar-body-height-value' );
			if ( closestParent ) {
				closestParent.style.setProperty( '--max-element-height' , ( Math.min( this.element.nativeElement.getBoundingClientRect().height , this.maxHeight ) ) + 'px' );
				closestParent.set;
			}
		} );
	}

	ngOnInit() : void {
		this.observeResize.next( this.element.nativeElement.getBoundingClientRect().height );
	}

	ngOnDestroy() : void {
		this.observeResize.complete();
	}
}
