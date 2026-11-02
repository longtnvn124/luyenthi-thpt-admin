import { Component , Inject , signal , Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA , MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

export interface ConfirmDeleteData {
	amount : number;
}

@Component( {
	selector    : 'app-confirm-delete2' ,
	standalone  : true ,
	imports     : [ CommonModule , MatButtonModule ] ,
	templateUrl : './confirm-delete2.component.html' ,
	styleUrls   : [ './confirm-delete2.component.scss' ]
} )
export class ConfirmDelete2Component {
	
	message : Signal<string>;
	
	constructor (
		public dialogRef : MatDialogRef<ConfirmDelete2Component> ,
		@Inject( MAT_DIALOG_DATA ) public data : ConfirmDeleteData
	) {
		const _message : string = `Bạn có chắc chắn muốn xóa ${ ( data.amount === 1 ? 'mục' : `những mục` ) } này không?`;
		this.message            = signal<string>( _message );
	}
	
	dismiss ( event : MouseEvent ) : void {
		this.confirm( event , false );
	}
	
	confirm ( event : MouseEvent , confirm : boolean ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.dialogRef.close( confirm );
	}
}
