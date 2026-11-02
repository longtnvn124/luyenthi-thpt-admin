import { Component , EventEmitter , Input , Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from "@angular/forms";
import { InputQuestionDirectionComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/input-question-direction.component";

@Component( {
	selector    : 'app-ictu-wrap-editor' ,
	standalone  : true ,
	imports     : [ CommonModule , InputQuestionDirectionComponent ] ,
	templateUrl : './ictu-wrap-editor.component.html' ,
	styleUrls   : [ './ictu-wrap-editor.component.css' ]
} )
export class IctuWrapEditorComponent {


	public readonly formControl : FormControl = new FormControl();

	ckEditor : any = {
		editor1 : null
	};

	@Input() set initData ( data : string ) {
		this.formControl.setValue( data ? data : '' );
	}

	@Output() resultData : EventEmitter<string> = new EventEmitter<string>();

	constructor () {
		this.formControl.valueChanges.subscribe( ( value : string ) : void => {
			this.resultData.emit( value )
		} )
	}

	ckEditorSetup ( ckEditor , name ) {
		this.ckEditor[ name ] = ckEditor;
	}

}
