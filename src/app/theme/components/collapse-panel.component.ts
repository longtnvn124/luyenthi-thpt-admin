import { Component , Input , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollapseDimension , CollapseDirective } from "@theme/directives/collapse.directive";

@Component( {
	selector   : 'collapse-panel' ,
	standalone : true ,
	imports    : [ CommonModule , CollapseDirective ] ,
	template   : '<div [collapse]="dimension"><ng-content></ng-content></div>' ,
} )
export class CollapsePanelComponent {
	
	@Input( { alias : 'id' } ) id : string = '';
	
	@Input() dimension : CollapseDimension = 'height';
	
	@ViewChild( CollapseDirective , { static : true , read : CollapseDirective } ) panel? : CollapseDirective;
	
}
