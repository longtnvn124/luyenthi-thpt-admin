// angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from '@sharedModule';

@Component( {
	selector    : 'app-footer' ,
	standalone  : true ,
	imports     : [ CommonModule , SharedModule ] ,
	templateUrl : './footer.component.html' ,
	styleUrls   : [ './footer.component.scss' ]
} )
export class FooterComponent {}
