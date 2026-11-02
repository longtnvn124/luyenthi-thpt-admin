import { Component , OnInit , Input , SimpleChanges , OnChanges, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { AbstractControl , FormControl , FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelperService } from '@service/core/helper.service';
import { BehaviorSubject , Subscription } from 'rxjs';
import { EditorModule } from 'primeng/editor';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
@Component( {
	selector    : 'ovic-editor' ,
	standalone: true,
	templateUrl : './ovic-editor.component.html' ,
	styleUrls   : [ './ovic-editor.component.css' ],
	imports: [
		EditorModule,
		ReactiveFormsModule,
		FormsModule
	]
} )
export class OvicEditorComponent implements OnInit  , OnChanges, AfterViewInit {
	
	@Input() height = '320px';
	
	@Input() formField : AbstractControl;
	
	@Input() default : string;
	
	textContents : string;
	
	constructor (
		private helperService : HelperService,
	) {
	}
	
	ngOnInit () : void {
		// this.textContents = this.default;
	}
	ngAfterViewInit() {
		// this.textContents = this.default;
	}
	
	ngOnChanges ( changes : SimpleChanges ) {
		if ( changes[ 'default' ] ) {
			
			this.textContents = this.default;
		}
	}
	
	setData ( data : string ) {
		this.textContents = data;
	}
	
	onTextChange ( event ) {
		
		// event.htmlValue: Current value as html.
		// event.textValue: Current value as text.
		if ( this.formField ) {
			this.formField.setValue( event.htmlValue );
		}
	}
	
}
