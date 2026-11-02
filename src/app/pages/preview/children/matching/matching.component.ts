import { Component , ElementRef , HostListener , OnInit , Renderer2 , ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonModule } from "@angular/common";

// Định nghĩa kiểu Match với generic T là MatchingPointPosition của from
// type Match<T extends MatchingPointPosition> = {
// 	from : MatchingPoint & { position : T };
// 	to : MatchingPoint & { position : Exclude<MatchingPointPosition , T> };
// };


type Match = {
	left : MatchingPoint & { position : 'left' };
	right : MatchingPoint & { position : 'right' };
};

type MatchingPointPosition = 'right' | 'left';

interface MatchingPoint {
	position : MatchingPointPosition;
	id : string;
	label : string;
	connected : boolean;
}

// Định nghĩa kiểu MatchingPointList với generic T là MatchingPointPosition
type MatchingPointList<T extends MatchingPointPosition> = Array<MatchingPoint & { position : T }>;

const radius              = 5; // bán kính chấm tròn
const color : string      = '#3B82F6'; // '#6c63ff'
const hoverColor : string = '#FF3D00';

@Component( {
	selector    : 'app-matching' ,
	standalone  : true ,
	imports     : [ CommonModule ] ,
	templateUrl : './matching.component.html' ,
	styleUrls   : [ './matching.component.css' ]
} )
export class MatchingComponent implements OnInit {

	// questions : string[] = [ 'Thủ đô của Việt Nam?' , 'Trái đất quay quanh?' , 'Nước sôi ở nhiệt độ?' ];

	// answers : string[] = [ 'Hà Nội' , 'Mặt trời' , '100°C' ];

	leftColumn : MatchingPointList<'left'> = [
		{ id : 'l-1' , label : 'Thủ đô của Việt Nam?' , position : 'left' , connected : false } ,
		{ id : 'l-2' , label : 'Trái đất quay quanh?' , position : 'left' , connected : false } ,
		{ id : 'l-3' , label : 'Nước sôi ở nhiệt độ?' , position : 'left' , connected : false }
	];

	rightColumn : MatchingPointList<'right'> = [
		{ id : 'r-1' , label : 'Hà Nội' , position : 'right' , connected : false } ,
		{ id : 'r-2' , label : 'Mặt trời' , position : 'right' , connected : false } ,
		{ id : 'r-3' , label : '100°C' , position : 'right' , connected : false }
	];

	connections : Match[] = [];

	@ViewChild( 'svg' , { static : true } ) svgRef! : ElementRef;

	@ViewChild( 'container' , { static : true } ) containerRef! : ElementRef;

	// private clickStream$ : Subject<MatchingPoint> = new Subject<MatchingPoint>();

	@HostListener( 'window:resize' ) onResize () : void {
		this.drawLines();
	}

	activePoint : MatchingPoint = null;

	observeRerender : Subject<string> = new Subject<string>();

	constructor ( private renderer : Renderer2 ) {
	}

	ngOnInit () : void {
		// this.clickStream$.pipe(
		// 	pairwise() ,
		// 	filter( ( [ p1 , p2 ] : [ MatchingPoint , MatchingPoint ] ) : boolean => p1.position !== p2.position ) ,
		// 	map( ( [ p1 , p2 ] : [ MatchingPoint , MatchingPoint ] ) : Match => ( p1.position === 'left' ? { left : p1 , right : p2 } : { left : p2 , right : p1 } ) as Match )
		// ).subscribe( ( { left , right } : Match ) : void => {
		// 	const existing : Match = this.connections.find( ( m : Match ) : boolean => ( m.left.id === left.id || m.right.id === right.id ) );
		// 	if ( existing ) {
		// 		// this.removeConnection( existing );
		// 	}
		// 	else {
		// 		this.connections.push( { left , right } );
		// 		this.drawLines();
		// 	}
		// } );
	}

	// onQuestionClick ( q : MatchingPoint ) : void {
	// 	this.clickStream$.next( q );
	// }
	//
	// onAnswerClick ( a : MatchingPoint ) : void {
	// 	this.clickStream$.next( a );
	// }

	selectPoint ( point : MatchingPoint ) : void {
		if ( point.connected ) {
			return;
		}
		if ( ! this.activePoint || this.activePoint.position === point.position ) {
			this.activePoint = point;
		}
		else {
			this.createConnection( this.connectPoints( [ this.activePoint , point ] ) );
		}
	}

	private connectPoints ( [ p1 , p2 ] : [ MatchingPoint , MatchingPoint ] ) : Match {
		return ( p1.position === 'left' ? { left : p1 , right : p2 } : { left : p2 , right : p1 } ) as Match
	}

	private createConnection ( match : Match ) : void {
		this.activePoint      = null;
		match.right.connected = true;
		match.left.connected  = true;
		this.connections.push( match );
		this.drawLines();
	}

	removeConnection ( match : Match ) : void {
		match.right.connected = false;
		match.left.connected  = false;
		this.connections      = this.connections.filter( ( c : Match ) : boolean => ! ( match.left.id === c.left.id || match.right.id === c.right.id ) );
		this.drawLines();
	}

	drawLines () : void {
		this.observeRerender.next( 'clear events' )
		const svg = this.svgRef.nativeElement as SVGSVGElement;
		while ( svg.firstChild ) svg.removeChild( svg.firstChild );
		const containerRect : DOMRect = this.containerRef.nativeElement.getBoundingClientRect();
		this.connections.forEach( ( conn : Match ) : void => {
			const qEl : HTMLElement = document.getElementById( `left-${ conn.left.id }` );
			const aEl : HTMLElement = document.getElementById( `right-${ conn.right.id }` );
			if ( ! qEl || ! aEl ) return;

			const qRect : DOMRect = qEl.getBoundingClientRect();
			const aRect : DOMRect = aEl.getBoundingClientRect();

			const x1 : number = qRect.right - containerRect.left;
			const y1 : number = qRect.top + qRect.height / 2 - containerRect.top;
			const x2 : number = aRect.left - containerRect.left;
			const y2 : number = aRect.top + aRect.height / 2 - containerRect.top;

			const path : SVGPathElement = this.renderer.createElement( 'path' , 'svg' );
			path.setAttribute( 'd' , `M ${ x1 },${ y1 } C ${ ( x1 + x2 ) / 2 },${ y1 } ${ ( x1 + x2 ) / 2 },${ y2 } ${ x2 },${ y2 }` );
			path.setAttribute( 'stroke' , color );
			path.setAttribute( 'fill' , 'none' );
			path.setAttribute( 'stroke-width' , '2' );
			path.style.cursor = 'pointer';

			/*// Hover effect
			 this.renderer.listen( path , 'mouseenter' , () : void => {
			 path.setAttribute( 'stroke' , hoverColor );
			 } );

			 this.renderer.listen( path , 'mouseleave' , () : void => {
			 path.setAttribute( 'stroke' , color );
			 } );

			 this.renderer.listen( path , 'click' , () : void => this.removeConnection( conn ) );*/


			// Create an interactive dot at start
			const startDot : SVGCircleElement = this.renderer.createElement( 'circle' , 'svg' );
			startDot.setAttribute( 'cx' , `${ x1 }` );
			startDot.setAttribute( 'cy' , `${ y1 }` );
			startDot.setAttribute( 'r' , radius.toString() );
			startDot.setAttribute( 'fill' , color );
			startDot.style.cursor = 'pointer';


			// Create an interactive dot at end
			const endDot : SVGCircleElement = this.renderer.createElement( 'circle' , 'svg' );
			endDot.setAttribute( 'cx' , `${ x2 }` );
			endDot.setAttribute( 'cy' , `${ y2 }` );
			endDot.setAttribute( 'r' , radius.toString() );
			endDot.setAttribute( 'fill' , color );
			endDot.style.cursor = 'pointer';

			//
			this.renderer.listen( startDot , 'mouseenter' , () : void => {
				startDot.setAttribute( 'fill' , hoverColor );
				path.setAttribute( 'stroke' , hoverColor );
				endDot.setAttribute( 'fill' , hoverColor );
			} );

			this.renderer.listen( startDot , 'mouseleave' , () : void => {
				startDot.setAttribute( 'fill' , color );
				path.setAttribute( 'stroke' , color );
				endDot.setAttribute( 'fill' , color );
			} );


			this.renderer.listen( endDot , 'mouseenter' , () : void => {
				startDot.setAttribute( 'fill' , hoverColor );
				path.setAttribute( 'stroke' , hoverColor );
				endDot.setAttribute( 'fill' , hoverColor );
			} );

			this.renderer.listen( endDot , 'mouseleave' , () : void => {
				startDot.setAttribute( 'fill' , color );
				path.setAttribute( 'stroke' , color );
				endDot.setAttribute( 'fill' , color );
			} );


			this.renderer.listen( startDot , 'click' , () : void => this.removeConnection( conn ) );
			this.renderer.listen( endDot , 'click' , () : void => this.removeConnection( conn ) );

			this.renderer.appendChild( svg , path );
			this.renderer.appendChild( svg , startDot );
			this.renderer.appendChild( svg , endDot );
		} );
	}
}
