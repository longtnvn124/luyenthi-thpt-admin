import { AfterViewInit , Component , ElementRef , HostListener , ViewChild } from '@angular/core';
import { CommonModule } from "@angular/common";

@Component( {
	selector    : 'app-question-connector' ,
	templateUrl : './question-connector.component.html' ,
	styleUrls   : [ './question-connector.component.css' ] ,
	imports     : [
		CommonModule
	] ,
	standalone  : true
} )
export class QuestionConnectorComponent implements AfterViewInit {
	questions : string[]                           = [ 'Thủ đô của Việt Nam?' , 'Trái đất quay quanh?' , 'Nước sôi ở nhiệt độ?' ];
	answers : string[]                             = [ 'Hà Nội' , 'Mặt trời' , '100°C' ];
	connections : { from : number, to : number }[] = [];
	selectedQuestionIndex : number | null          = null;
	svgPaths : string[]                            = [];

	@ViewChild( 'container' , { static : false } ) containerRef! : ElementRef;

	ngAfterViewInit () : void {
		this.drawConnections();
	}

	connect ( index : number ) : void {
		if ( this.selectedQuestionIndex === null ) {
			this.selectedQuestionIndex = index;
		}
		else {
			const from : number        = this.selectedQuestionIndex;
			const to : number          = index;
			this.selectedQuestionIndex = null;
			const existing             = this.connections.find( c => c.from === from || c.to === to );
			if ( ! existing ) {
				this.connections.push( { from , to } );
				this.drawConnections();
			}
		}
	}

	drawConnections () : void {
		if ( ! this.containerRef ) return;
		const containerRect : DOMRect = this.containerRef.nativeElement.getBoundingClientRect();
		this.svgPaths                 = this.connections.map( ( { from , to } ) : string => {
			const qEl : HTMLElement = document.getElementById( 'q-' + from );
			const aEl : HTMLElement = document.getElementById( 'a-' + to );
			if ( ! qEl || ! aEl ) return '';
			const qBox : DOMRect = qEl.getBoundingClientRect();
			const aBox : DOMRect = aEl.getBoundingClientRect();
			const x1 : number    = qBox.right - containerRect.left;
			const y1 : number    = qBox.top + qBox.height / 2 - containerRect.top;
			const x2 : number    = aBox.left - containerRect.left;
			const y2 : number    = aBox.top + aBox.height / 2 - containerRect.top;
			const mx : number    = ( x1 + x2 ) / 2;
			return `M${ x1 },${ y1 } C${ mx },${ y1 } ${ mx },${ y2 } ${ x2 },${ y2 }`;
		} );
	}

	@HostListener( 'window:resize' ) onResize () : void {
		this.drawConnections();
	}
}