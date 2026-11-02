import { NgModule } from '@angular/core';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { TextPreviewFormComponent } from './text-preview-form/text-preview-form.component';
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@NgModule( {
	declarations : [
		TextEditorComponent ,
		TextPreviewFormComponent
	] ,
	imports      : [
		CommonModule ,
		ReactiveFormsModule
	] ,
	exports      : [
		TextEditorComponent ,
		TextPreviewFormComponent
	]
} )
export class NgxTextBlankFormModule {}
