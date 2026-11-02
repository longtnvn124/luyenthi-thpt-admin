import { Component , Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA , MatDialogModule , MatDialogRef } from '@angular/material/dialog';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { Button , BUTTON_CLOSE , ButtonBase } from '@model/button';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

export interface ConfirmDialogData {
	title? : string;
	heading? : string;
	message? : string;
	buttons? : Button[];
}

@Component( {
	selector    : 'app-confirm' ,
	standalone  : true ,
	imports     : [ CommonModule , MatDialogModule , SafeHtmlPipe , ButtonModule , RippleModule ] ,
	templateUrl : './confirm.component.html' ,
	styleUrls   : [ './confirm.component.css' ]
} )
export class ConfirmComponent {
	title 	: string 	   = '';
	buttons : ButtonBase[] = [];
	heading : string       = '';
	message : string       = '';

	constructor(
		public dialogRef : MatDialogRef<ConfirmComponent> ,
		@Inject( MAT_DIALOG_DATA ) public data : ConfirmDialogData
	) {
		const arrButtons : Button[] = this.data.buttons && this.data.buttons.length ? this.data.buttons : [ BUTTON_CLOSE ];
		this.buttons                = arrButtons.reduce( ( reducer , button , index ) => [ ... reducer , Object.assign( {
			label    : '' ,
			icon     : '' ,
			class    : '' ,
			readonly : false ,
			name     : 'btn_' + index
		} , button ) ] , new Array<ButtonBase>() );
		this.title 					= data.title || '';
		this.heading                = data.heading || '';
		this.message                = data.message || '';
	}

	onNoClick() : void {
		this.dialogRef.close();
	}

	buttonClick() {

	}
}
