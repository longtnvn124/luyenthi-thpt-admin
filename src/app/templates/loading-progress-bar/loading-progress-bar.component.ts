import { Component , Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component( {
	selector    : 'app-loading-progress-bar' ,
	standalone  : true ,
	imports     : [ CommonModule , MatProgressBarModule ] ,
	templateUrl : './loading-progress-bar.component.html' ,
	styleUrls   : [ './loading-progress-bar.component.css' ]
} )
export class LoadingProgressBarComponent {
	@Input( { alias : 'heading' } ) label : string = 'Loading...';
}
