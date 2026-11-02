import { Component , inject } from '@angular/core';
import { SharedModule } from '@module/shared/shared.module';
import { AppPreviewHeading } from "@pages/preview/preview.component";

@Component( {
	standalone  : true ,
	selector    : 'app-typography' ,
	imports     : [ SharedModule ] ,
	templateUrl : './typography.component.html' ,
	styleUrls   : [ './typography.component.scss' ]
} )
export default class TypographyComponent {
	
	constructor () {
		inject( AppPreviewHeading ).set( { heading : 'Typography' } );
	}
}
