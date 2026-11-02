import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component( {
	selector    : 'app-text-input-replacerment' ,
	standalone  : true ,
	imports     : [ CommonModule ] ,
	templateUrl : './text-input-replacerment.component.html' ,
	styleUrls   : [ './text-input-replacerment.component.css' ]
} )
export class TextInputReplacermentComponent {
	content : string = 'Nhập đoạn văn bản ở đây. Bạn có thể chọn bất kỳ phần nào.';

	replaceSelection () {
		const selection = window.getSelection();
		if ( ! selection || selection.isCollapsed ) return;

		const range        = selection.getRangeAt( 0 );
		const selectedText = selection.toString();

		if ( selectedText.length === 0 ) return;

		// Tạo thẻ input
		const input        = document.createElement( 'input' );
		input.type         = 'text';
		input.placeholder  = selectedText;
		input.style.margin = '0 4px';

		// Xoá nội dung đã chọn và thay thế bằng input
		range.deleteContents();
		range.insertNode( input );

		// Clear selection
		selection.removeAllRanges();
	}
}
