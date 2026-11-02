import { Component , Input , OnInit } from '@angular/core';
import { FormBuilder , FormGroup } from "@angular/forms";

@Component( {
	selector    : 'ngx-text-preview-form' ,
	templateUrl : './text-preview-form.component.html' ,
	styleUrls   : [ './text-preview-form.component.css' ]
} )
export class TextPreviewFormComponent implements OnInit {

	@Input() template : ( string | { id : string; placeholder : string } )[] = [];

	form! : FormGroup;

	constructor ( private fb : FormBuilder ) {
	}

	ngOnInit () : void {
		const group : any = {};
		for ( const part of this.template ) {
			if ( typeof part !== 'string' ) {
				group[ part.id ] = [ '' ];
			}
		}
		this.form = this.fb.group( group );
	}

	isStringType ( type : any ) : boolean {
		return typeof type === 'string';
	}

	getFormData () {
		return this.form.value;
	}
}
