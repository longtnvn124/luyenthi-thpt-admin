import { Component , ElementRef , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component( {
	selector    : 'app-text-input-replacer' ,
	standalone  : true ,
	imports     : [ CommonModule ] ,
	templateUrl : './text-input-replacer.component.html' ,
	styleUrls   : [ './text-input-replacer.component.css' ]
} )
export class TextInputReplacerComponent {
	@ViewChild( 'editableContent' , { static : true } ) editableContent! : ElementRef;

	// Lưu danh sách input đã chèn
	inputs : { placeholder : string, index : number }[] = [];

	ngAfterViewInit () {
		// Lắng nghe phím Ctrl + R
		this.editableContent.nativeElement.addEventListener( 'keydown' , ( event : KeyboardEvent ) => {
			if ( event.ctrlKey && event.key.toLowerCase() === 'r' ) {
				event.preventDefault();
				this.replaceSelection();
			}
		} );
	}

	replaceSelection () {
		const selection = window.getSelection();
		if ( ! selection || selection.isCollapsed ) return;

		const range        = selection.getRangeAt( 0 );
		const selectedText = selection.toString();

		if ( ! selectedText.trim() ) return;

		// Kiểm tra nếu đoạn được chọn nằm trong input
		const parentElement = selection.anchorNode?.parentElement;
		if ( parentElement?.tagName === 'INPUT' ) {
			alert( 'Đoạn đã chọn đã là một input!' );
			return;
		}

		// Tạo input
		const input        = document.createElement( 'input' );
		input.type         = 'text';
		input.placeholder  = selectedText;
		input.style.margin = '0 4px';

		// Lưu index (dựa trên vị trí text trước input)
		const contentText = this.editableContent.nativeElement.innerText;
		const index       = contentText.indexOf( selectedText );

		// Chèn input
		range.deleteContents();
		range.insertNode( input );

		// Lưu thông tin
		this.inputs.push( { placeholder : selectedText , index } );

		// Clear selection
		selection.removeAllRanges();
	}
}
