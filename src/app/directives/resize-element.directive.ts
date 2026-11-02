import { Directive , ElementRef , Input , numberAttribute , OnDestroy , OnInit } from '@angular/core';
import { debounceTime , Subject , takeUntil } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Directive( {
	selector   : '[appResizeElement]' ,
	standalone : true
} )
export class ResizeElementDirective implements OnInit , OnDestroy {

	@Input( { required : true , alias : 'appResizeElement' , transform : numberAttribute } ) base : number = 370;

	@Input( { required : true , alias : 'rows' , transform : numberAttribute } ) rows : number = 5;

	private observeResize : Subject<number> = new Subject<number>();

	constructor( private tagElement : ElementRef ) {
		new ResizeObserver( () => this.observeResize.next( this.tagElement.nativeElement.getBoundingClientRect().width ) ).observe( this.tagElement.nativeElement );
		this.observeResize.asObservable().pipe( distinctUntilChanged() ).subscribe( ( width ) => {
			let rows : number   = this.rows;
			let size : number   = 100;
			let match : boolean = false;
			while ( !match && rows > 1 ) {
				if ( Math.ceil( this.base * rows ) <= width ) {
					match = true;
					size  = width / rows;
				}
				rows -= 1;
			}
			this.tagElement.nativeElement.style.setProperty( '--element-size' , size + 'px' );
		} );
	}

	ngOnInit() : void {
		this.observeResize.next( this.tagElement.nativeElement.getBoundingClientRect().width );
	}


	ngOnDestroy() : void {
		this.observeResize.complete();
	}

}
