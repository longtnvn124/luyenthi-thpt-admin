import { Component , inject , Signal , signal , WritableSignal } from '@angular/core';
import {
	AppPreviewCopyContentInjector ,
	AppPreviewHeading ,
	PreviewCopyContent
} from "@pages/preview/preview.component";
import { NgClass , NgForOf } from "@angular/common";
import { CardComponent } from "@theme/components/card/card.component";
import { MatButtonModule } from "@angular/material/button";
import { SharedModule } from "@sharedModule";

@Component( {
	selector    : 'app-custom-button' ,
	imports : [
		NgClass ,
		CardComponent ,
		NgForOf ,
		MatButtonModule ,
		SharedModule ,
	] ,
	standalone  : true ,
	templateUrl : './custom-button.component.html' ,
	styleUrls   : [ './custom-button.component.css' ]
} )
export default class CustomButtonComponent {
	
	readonly colors : Signal<string[]>                        = signal<string[]>( [ 'light' , 'gradient' , 'ghost' ] );
	readonly styles : Signal<string[]>                        = signal<string[]>( [ 'primary' , 'secondary' , 'warning' , 'info' , 'success' , 'danger' , 'purple' , 'teal' , 'orange' ] );
	private _copyContent : WritableSignal<PreviewCopyContent> = inject( AppPreviewCopyContentInjector );
	readonly badges : Signal<string[]>                        = signal<string[]>( [ 'primary' , 'secondary' , 'warning' , 'info' , 'success' , 'danger' , 'light' , 'dark' , 'orange' , 'pink' , 'teal' , 'purple' ] );
	
	constructor () {
		inject( AppPreviewHeading ).set( { heading : 'Custom button' } );
	}
	
	copyButton ( id : string ) : void {
		const svgTag : string = `<button class="btn ${ id }">button</button>`;
		this._copyContent.set( { value : svgTag , body : id } );
	}
	
	copyBadge ( badge : string ) : void {
		const spanTag : string = `<span class="ictu-badge ictu-badge--${ badge }">${ badge }</span>`;
		this._copyContent.set( { value : spanTag , body : badge } );
	}
	
	copyBadgeButton ( id : string ) : void {
		const svgTag : string = `<button mat-flat-button class="btn ${ id }">button</button>`;
		this._copyContent.set( { value : svgTag , body : id } );
	}
}
