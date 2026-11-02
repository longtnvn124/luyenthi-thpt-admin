import { Component , ElementRef , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component( {
	selector    : 'app-text-input-replacer-undo' ,
	standalone  : true ,
	imports     : [ CommonModule ] ,
	templateUrl : './text-input-replacer-undo.component.html' ,
	styleUrls   : [ './text-input-replacer-undo.component.css' ]
} )
export class TextInputReplacerUndoComponent {

	@ViewChild( 'editableContent' , { static : true } ) editableContent! : ElementRef;

	inputs : { placeholder : string, id : string }[] = [];
	undoStack : { html : string, id : string }[]     = [];

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

		const wrapper     = document.createElement( 'span' );
		wrapper.className = 'inline-flex items-center gap-1 mx-1';
		wrapper.setAttribute( 'data-id' , inputId );

		const input       = document.createElement( 'input' );
		input.type        = 'text';
		input.placeholder = selectedText;
		input.className   = 'border border-gray-300 px-2 py-1 rounded';

		const deleteBtn        = document.createElement( 'button' );
		deleteBtn.textContent  = '❌';
		deleteBtn.className    = 'text-red-500 text-xs';
		deleteBtn.style.cursor = 'pointer';

		deleteBtn.addEventListener( 'click' , () => {
			this.undoStack.push( {
				html : wrapper.outerHTML ,
				id   : inputId
			} );
			wrapper.remove();
			this.inputs = this.inputs.filter( i => i.id !== inputId );
		} );

		wrapper.appendChild( input );
		wrapper.appendChild( deleteBtn );

		range.deleteContents();
		range.insertNode( wrapper );

		this.inputs.push( { placeholder : selectedText , id : inputId } );
		selection.removeAllRanges();
	}

	undoLastDelete () {
		// if ( this.undoStack.length === 0 ) return;
		//
		// const last = this.undoStack.pop();
		// if ( ! last ) return;
		//
		// const temp          = document.createElement( 'div' );
		// temp.innerHTML      = last.html;
		// const nodeToRestore = temp.firstChild;
		//
		// if ( nodeToRestore ) {
		// 	this.editableContent.nativeElement.appendChild( nodeToRestore );
		// 	const inputEl = nodeToRestore.querySelector( 'input' );
		// 	if ( inputEl ) {
		// 		const placeholder = inputEl.getAttribute( 'placeholder' ) || '';
		// 		this.inputs.push( { placeholder , id : last.id } );
		// 	}
		// }

		if ( this.undoStack.length === 0 ) return;

		const last = this.undoStack.pop();
		if ( ! last ) return;

		const temp          = document.createElement( 'div' );
		temp.innerHTML      = last.html;
		const nodeToRestore = temp.firstChild;

		if ( nodeToRestore ) {
			this.editableContent.nativeElement.appendChild( nodeToRestore );

			const inputEl = ( nodeToRestore as HTMLElement ).querySelector( 'input' );
			if ( inputEl ) {
				const placeholder = inputEl.getAttribute( 'placeholder' ) || '';
				this.inputs.push( { placeholder , id : last.id } );
			}
		}
	}

	exportText ( format : 'brackets' | 'curly' ) : string {
		const clone  = this.editableContent.nativeElement.cloneNode( true ) as HTMLElement;
		const inputs = clone.querySelectorAll( 'input' );
		inputs.forEach( input => {
			const replacement = format === 'curly' ? '{ }' : '[blank]';
			const span        = document.createTextNode( replacement );
			input.parentElement?.replaceWith( span );
		} );
		return clone.innerText.trim();
	}

	protected readonly alert = alert;
}
