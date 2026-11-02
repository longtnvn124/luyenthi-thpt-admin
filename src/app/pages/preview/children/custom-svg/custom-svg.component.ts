import { Component , computed , inject , Signal , signal , WritableSignal } from '@angular/core';
import {
	AppPreviewCopyContentInjector ,
	AppPreviewHeading ,
	PreviewCopyContent
} from "@pages/preview/preview.component";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "@sharedModule";
import { linkStaticResource } from "@utilities/helper";
import { InputTextModule } from "primeng/inputtext";

type AppState = 'loading' | 'error' | 'success';

@Component( {
	selector    : 'app-custom-svg' ,
	standalone  : true ,
	imports     : [
		FormsModule ,
		SharedModule ,
		InputTextModule
	] ,
	templateUrl : './custom-svg.component.html' ,
	styleUrls   : [ './custom-svg.component.scss' ] ,
	host        : {
		style : 'width:100%; min-height: calc(var(--max-screen-height) - 60px - 25px - 25px);display:block '
	}
} )
export default class CustomSvgComponent {
	
	private http : HttpClient = inject( HttpClient );
	
	state : WritableSignal<AppState> = signal<AppState>( 'loading' );
	
	icons : Signal<string[]> = computed( () : string[] => ( this.filter() ? this.iconLibrary.filter( ( icon : string ) : boolean => icon.includes( this.filter() ) ) : this.iconLibrary ) );
	
	filter : WritableSignal<string> = signal( null );
	
	search : string = '';
	
	bodyHeading : Signal<string> = computed( () : string => ( this.filter() ? `Search results for "${ this.filter() }"` : 'All items' ) );
	
	private iconLibrary : string[] = [];
	
	private copyContent : WritableSignal<PreviewCopyContent> = inject( AppPreviewCopyContentInjector );
	
	constructor () {
		inject( AppPreviewHeading ).set( { heading : 'Custom Svg' } );
		this.load();
	}
	
	triggerSearch () : void {
		this.filter.set( this.search.trim() );
	}
	
	load () : void {
		this.state.set( 'loading' );
		this.http.get( linkStaticResource( 'assets/fonts/custom-icon.svg' ) + '?code=' + Date.now() , {
			responseType : 'text'
		} ).subscribe( {
			next  : ( response : string ) : void => {
				this.iconLibrary = response.match( /id=["'][^"^']*['"]/gmi )?.map( ( str : string ) : string => str.toLowerCase().replace( /id=['"]/gmi , '' ).replace( /['"]/g , '' ) ) ?? [];
				this.state.set( 'success' );
				this.filter.set( '' );
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} )
	}
	
	copySvgId ( id : string ) : void {
		const svgTag : string = `<svg><use href="fonts/custom-icon.svg#${ id }"></use></svg>`;
		this.copyContent.set( {
			value : svgTag ,
			body  : id
		} )
	}
}

