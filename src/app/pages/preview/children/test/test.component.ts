import { Component , inject , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppPreviewHeading , PreviewHeading } from "@pages/preview";

import { NgxTextBlankFormModule } from 'ngx-text-blank-form';
import { IctuCkeditorComponent } from "@pages/admin/bank/ictu-ckeditor/ictu-ckeditor.component";

@Component( {
	selector    : 'app-test' ,
	standalone  : true ,
	imports : [ CommonModule , NgxTextBlankFormModule , IctuCkeditorComponent ] ,
	templateUrl : './test.component.html' ,
	styleUrls   : [ './test.component.css' ]
} )
export default class TestComponent {

	private heading : WritableSignal<PreviewHeading> = inject( AppPreviewHeading );

	constructor () {
		setTimeout( () : void => this.heading.set( { heading : 'Test' } ) , 100 );

		/*const clicks   = fromEvent<PointerEvent>( document , 'click' );
		 const pairs    = clicks.pipe( pairwise() );
		 const distance = pairs.pipe(
		 map( ( [ first , second ] ) => {
		 const x0 = first.clientX;
		 const y0 = first.clientY;
		 const x1 = second.clientX;
		 const y1 = second.clientY;
		 return Math.sqrt( Math.pow( x0 - x1 , 2 ) + Math.pow( y0 - y1 , 2 ) );
		 } )
		 );

		 distance.subscribe( x => console.log( x ) );*/
	}

	template : any;

	onExport ( template : any ) : void {
		console.log( template );
		this.template = template;
	}
}

