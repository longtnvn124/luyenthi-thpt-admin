// angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl , Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// project import
import { SharedModule } from '@sharedModule';

@Component( {
	selector    : 'app-register' ,
	standalone  : true ,
	imports     : [ CommonModule , SharedModule , RouterModule ] ,
	templateUrl : './register.component.html' ,
	styleUrls   : [ '../authentication.scss' , './register.component.scss' ]
} )
export default class RegisterComponent {
	// public props
	hide : boolean      = true;
	coHide : boolean    = true;
	email : FormControl = new FormControl( '' , [ Validators.required , Validators.email ] );

	// public method
	getErrorMessage() {
		if ( this.email.hasError( 'required' ) ) {
			return 'You must enter an email';
		}
		return this.email.hasError( 'email' ) ? 'Not a valid email' : '';
	}
}
