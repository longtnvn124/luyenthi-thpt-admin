import { Component , ElementRef , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component( {
	selector    : 'app-text-input-replacer-export' ,
	standalone  : true ,
	imports     : [ CommonModule ] ,
	templateUrl : './text-input-replacer-export.component.html' ,
	styleUrls   : [ './text-input-replacer-export.component.css' ]
} )
export class TextInputReplacerExportComponent {
	@ViewChild( 'editableContent' , { static : true } ) editableContent! : ElementRef;

	inputs : { placeholder : string, id : string }[] = [];

	ngAfterViewInit () {
		this.editableContent.nativeElement.addEventListener( 'keydown' , ( event : KeyboardEvent ) => {
			if ( event.ctrlKey && event.key.toLowerCase() === 'r' ) {
				event.preventDefault();
				this.replaceSelection();
			}
		} );
	}

	generateId () {
		return '_' + Math.random().toString( 36 ).substr( 2 , 9 );
	}

	replaceSelection () {
		const selection = window.getSelection();
		if ( ! selection || selection.isCollapsed ) return;

		const range        = selection.getRangeAt( 0 );
		const selectedText = selection.toString().trim();

		if ( ! selectedText ) return;

		const parentElement = selection.anchorNode?.parentElement;
		if ( parentElement?.tagName === 'INPUT' ) {
			alert( 'Đoạn đã chọn đã là một input!' );
			return;
		}

		const inputId = this.generateId();

		// Tạo container để chứa input + nút xóa
		const wrapper            = document.createElement( 'span' );
		wrapper.style.display    = 'inline-flex';
		wrapper.style.alignItems = 'center';
		wrapper.style.margin     = '0 4px';
		wrapper.setAttribute( 'data-id' , inputId );

		const input             = document.createElement( 'input' );
		input.type              = 'text';
		input.placeholder       = selectedText;
		input.style.marginRight = '4px';

		const deleteBtn            = document.createElement( 'button' );
		deleteBtn.textContent      = '❌';
		deleteBtn.style.fontSize   = '12px';
		deleteBtn.style.cursor     = 'pointer';
		deleteBtn.style.border     = 'none';
		deleteBtn.style.background = 'transparent';

		deleteBtn.addEventListener( 'click' , () => {
			wrapper.remove();
			this.inputs = this.inputs.filter( i => i.id !== inputId );
		} );

		wrapper.appendChild( input );
		wrapper.appendChild( deleteBtn );

		// Thay đoạn bôi đen bằng wrapper
		range.deleteContents();
		range.insertNode( wrapper );

		this.inputs.push( { placeholder : selectedText , id : inputId } );

		selection.removeAllRanges();
	}

	exportText ( format : 'brackets' | 'curly' ) : string {
		const clone = this.editableContent.nativeElement.cloneNode( true ) as HTMLElement;

		// Thay mỗi input bằng định dạng cần thiết
		const inputs = clone.querySelectorAll( 'input' );
		inputs.forEach( input => {
			const replacement = format === 'curly' ? '{ }' : '[blank]';
			const span        = document.createTextNode( replacement );
			input.parentElement?.replaceWith( span ); // thay cả input + nút xóa
		} );

		return clone.innerText.trim();
	}

	protected readonly alert = alert;
}
