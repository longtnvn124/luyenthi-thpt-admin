import { Component , computed , inject , Signal , signal , WritableSignal } from '@angular/core';
import {
	AppPreviewCopyContentInjector ,
	AppPreviewHeading ,
	PreviewCopyContent ,
	PreviewHeading
} from "@pages/preview/preview.component";
import { IconClasses } from "@pages/preview/children/tabler-icons/tabler-icons";
import { SharedModule } from "@sharedModule";
import { InputTextModule } from "primeng/inputtext";

@Component( {
	selector    : 'app-tabler-icons' ,
	standalone : true,
	imports : [ SharedModule , InputTextModule ] ,
	templateUrl : './tabler-icons.component.html' ,
	styleUrls    : ['./tabler-icons.component.scss']
} )
export default class TablerIconsComponent {
	
	icons : Signal<string[]> = computed( () : string[] => ( this.filter() && this.filter().trim() ? IconClasses.filter( ( icon : string ) : boolean => icon.includes( this.filter() ) ) : IconClasses ) );
	
	heading : WritableSignal<PreviewHeading> = inject( AppPreviewHeading );
	
	filter : WritableSignal<string> = signal( '' );
	
	bodyHeading : Signal<string> = computed( () : string => ( this.filter() && this.filter().trim() ? `Search results for "${ this.filter().trim() }"` : 'All icons' ) );
	
	private copyContent : WritableSignal<PreviewCopyContent> = inject( AppPreviewCopyContentInjector );
	
	search : string = '';
	
	constructor () {
		this.heading.set( {
			heading : 'Tabler Icons' ,
			// description : 'version 3.30.0'
		} );
	}
	
	copyIcon ( icon : string ) : void {
		const tagHtml : string = `<i class="ti ${icon}"></i>`;
		this.copyContent.set( {
			value : tagHtml ,
			body  : tagHtml
		} )
	}
	
	triggerSearch () : void {
		this.filter.set( this.search.trim() );
	}
}

