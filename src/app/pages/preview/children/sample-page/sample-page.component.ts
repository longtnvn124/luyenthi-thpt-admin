import { Component , inject , signal , Signal } from '@angular/core';
import { SharedModule } from '@sharedModule';
import { AppPreviewHeading } from "@pages/preview/preview.component";
import { CollapsePanelComponent } from "@theme/components/collapse-panel.component";
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { IctuPaginatorControl } from "@theme/components/ictu-paginator/ictu-paginator-control";

@Component( {
	selector    : 'app-sample-page' ,
	standalone  : true ,
	imports     : [ SharedModule , CollapsePanelComponent , IctuPaginatorComponent ] ,
	templateUrl : './sample-page.component.html' ,
	styleUrls   : [ './sample-page.component.scss' ]
} )
export default class SamplePageComponent {
	
	paginatorControl : Signal<IctuPaginatorControl> = signal<IctuPaginatorControl>( new IctuPaginatorControl( {
		pageLinkSize      : 5 ,
		rows              : 20 ,
		showFirstLastIcon : true
	} ) );
	
	constructor () {
		inject( AppPreviewHeading ).set( {
			heading : 'Sample Page'
		} );
		
		setTimeout( () : void => {
			// this.paginatorControl().setupPaginator( { totalRecords : 147 , rows : 20 , data : [] } )
		} , 1000 );
	}
}
