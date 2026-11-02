import { AfterViewInit , Component , ElementRef , HostListener , Input , OnChanges , OnDestroy , OnInit , Renderer2 , SimpleChanges , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionEditorNode } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { SafeHtmlPipe } from "../../../../../pipes/safe-html.pipe";
import { QuestionPrefixPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/question-prefix.pipe";
import { BankQuestionAnswerOption } from '@model/bank-question';
import { IctuMediaLoaderDirective } from "../../../../../directives/ictu-media-loader.directive";
import { debounceTime , Subject , takeUntil } from "rxjs";

@Component( {
	selector    : 'app-preview-question-matching' ,
	standalone  : true ,
	imports     : [ CommonModule , SafeHtmlPipe , QuestionPrefixPipe , IctuMediaLoaderDirective ] ,
	templateUrl : './preview-question-matching.component.html' ,
	styleUrls   : [ './preview-question-matching.component.css' ]
} )
export class PreviewQuestionMatchingComponent implements AfterViewInit , OnChanges , OnDestroy , OnInit {
	@Input( { required : true } ) question : BankQuestionEditorNode;

	@ViewChild( 'svg' , { static : true } ) svgRef! : ElementRef;

	@ViewChild( 'container' , { static : true } ) containerRef! : ElementRef;

	@HostListener( 'window:resize' ) onResize () : void {
		this.rerender();
	}

	private readonly changed$ : Subject<string> = new Subject();

	private readonly destroy$ : Subject<string> = new Subject();

	constructor ( private renderer : Renderer2 ) {
	}

	ngAfterViewInit () : void {
		this.drawLines();
	}

	drawLines () : void {
		if ( this.question ) {
			const svg = this.svgRef.nativeElement as SVGSVGElement;
			while ( svg.firstChild ) svg.removeChild( svg.firstChild );
			const containerRect : DOMRect = this.containerRef.nativeElement.getBoundingClientRect();
			this.question.options.forEach( ( option : BankQuestionAnswerOption ) : void => {
				const qEl : HTMLElement = document.getElementById( `left-${ this.question.id }-|${ option.value }|` );
				const aEl : HTMLElement = document.getElementById( `right-${ this.question.id }-|${ option.value }|` );
				if ( ! qEl || ! aEl ) return;

				const qRect : DOMRect = qEl.getBoundingClientRect();
				const aRect : DOMRect = aEl.getBoundingClientRect();

				const x1 : number = qRect.right - containerRect.left;
				const y1 : number = qRect.top + qRect.height / 2 - containerRect.top;
				const x2 : number = aRect.left - containerRect.left;
				const y2 : number = aRect.top + aRect.height / 2 - containerRect.top;

				const path : SVGPathElement = this.renderer.createElement( 'path' , 'svg' );
				path.setAttribute( 'd' , `M ${ x1 },${ y1 } C ${ ( x1 + x2 ) / 2 },${ y1 } ${ ( x1 + x2 ) / 2 },${ y2 } ${ x2 },${ y2 }` );
				path.setAttribute( 'stroke' , '#333333' );
				path.setAttribute( 'fill' , 'none' );
				path.setAttribute( 'stroke-width' , '2' );
				path.style.cursor = 'pointer';
				this.renderer.appendChild( svg , path );
			} );
		}
	}

	rerender () : void {
		this.changed$.next( 'changed' );
	}

	ngOnInit () : void {
		this.changed$.asObservable().pipe(
			takeUntil( this.destroy$ ) ,
			debounceTime( 1000 )
		).subscribe( () : void => {
			this.drawLines();
		} )
	}

	ngOnChanges ( changes : SimpleChanges ) : void {
		if ( changes[ 'question' ] ) {
			setTimeout( () : void => this.drawLines() , 1000 );
		}
	}

	ngOnDestroy () : void {
		this.destroy$.next( 'destroy' );
		this.destroy$.complete();
	}
}
