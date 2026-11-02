import { AfterViewInit , Component , ElementRef , EventEmitter , Output , ViewChild } from '@angular/core';

@Component( {
	selector    : 'ngx-text-editor' ,
	templateUrl : './text-editor.component.html' ,
	styleUrls   : [ './text-editor.component.css' ]
} )
export class TextEditorComponent implements AfterViewInit {

	@ViewChild( 'editable' , { static : true } ) editable! : ElementRef;

	@Output() exported = new EventEmitter<( string | { id : string, placeholder : string } )[]>();

	inputs : { id : string, placeholder : string }[] = [];

	ngAfterViewInit () : void {
		this.editable.nativeElement.addEventListener( 'keydown' , ( e : KeyboardEvent ) => {
			if ( e.ctrlKey && e.key.toLowerCase() === 'r' ) {
				e.preventDefault();
				this.insertInput();
			}
		} );

		const editable = this.editable.nativeElement;

		editable.addEventListener( 'keydown' , ( e : KeyboardEvent ) => {
			if ( e.ctrlKey && e.key.toLowerCase() === 'r' ) {
				e.preventDefault();
				this.insertInput();
			}
		} );

		// ✅ Xử lý paste
		// editable.addEventListener( 'paste' , ( e : ClipboardEvent ) => {
		// 	e.preventDefault();
		// 	const text = e.clipboardData?.getData( 'text/plain' ) || '';
		// 	document.execCommand( 'insertText' , false , text );
		// } );
		editable.addEventListener( 'paste' , ( e : ClipboardEvent ) => {
			e.preventDefault();

			const pasteText = e.clipboardData?.getData( 'text/plain' ) || '';
			const selection = window.getSelection();

			if ( ! selection || selection.rangeCount === 0 ) return;

			const range = selection.getRangeAt( 0 );
			range.deleteContents();
			const textNode = document.createTextNode( pasteText );
			range.insertNode( textNode );

			// Di chuyển con trỏ ra sau phần được dán
			range.setStartAfter( textNode );
			selection.removeAllRanges();
			selection.addRange( range );
		} );

		editable.addEventListener( 'click' , ( e : MouseEvent ) => {
			const target   = e.target as HTMLElement;
			const removeId = target.getAttribute( 'data-remove-id' );
			if ( removeId ) {
				const span = this.editable.nativeElement.querySelector( `[data-id="${ removeId }"]` );
				if ( span ) span.remove();
				this.inputs = this.inputs.filter( i => i.id !== removeId );
			}
		} );
	}

	insertInput () {
		const selection = window.getSelection();
		if ( ! selection || selection.isCollapsed ) return;

		const range        = selection.getRangeAt( 0 );
		const selectedText = selection.toString().trim();
		if ( ! selectedText ) return;

		// 🔒 Kiểm tra xem vùng chọn có nằm trong 1 input (span[data-id]) đã tồn tại không
		let ancestor = range.commonAncestorContainer as HTMLElement;
		while ( ancestor && ancestor !== this.editable.nativeElement ) {
			if ( ancestor.nodeType === 1 && ancestor.hasAttribute( 'data-id' ) ) {
				alert( 'Bạn đã chọn một vùng nằm trong chỗ trống đã chèn.' );
				return;
			}
			ancestor = ancestor.parentElement!;
		}

		const id = '_' + Math.random().toString( 36 ).substring( 2 , 9 );

		const span = document.createElement( 'span' );
		span.setAttribute( 'data-id' , id );
		span.className = 'inline-block border px-1 mx-1 rounded bg-blue-100 text-blue-800';

		span.innerHTML = `<span class="mr-1">[blank: ${ selectedText }]</span><button data-remove-id="${ id }" class="text-red-500 hover:underline text-sm ml-1">✕</button>`;

		range.deleteContents();
		range.insertNode( span );
		selection.removeAllRanges();

		this.inputs.push( { id , placeholder : selectedText } );
	}

	insertInput_old () {

		const selection = window.getSelection();
		if ( ! selection || selection.isCollapsed ) return;

		const range        = selection.getRangeAt( 0 );
		const selectedText = selection.toString().trim();
		if ( ! selectedText ) return;

		const id = '_' + Math.random().toString( 36 ).substring( 2 , 9 );

		const span = document.createElement( 'span' );
		span.setAttribute( 'data-id' , id );
		span.className = 'inline-block border px-1 mx-1 rounded bg-blue-100 text-blue-800';
		// span.innerText = `[blank: ${ selectedText }]`;

		span.innerHTML = `<span class="mr-1">[blank: ${ selectedText }]</span><button data-remove-id="${ id }" class="text-red-500 hover:underline text-sm ml-1">✕</button>`;

		range.deleteContents();
		range.insertNode( span );
		selection.removeAllRanges();

		this.inputs.push( { id , placeholder : selectedText } );
	}

	exportTemplate_old () {
		const nodes                                                         = this.editable.nativeElement.childNodes;
		const result : ( string | { id : string, placeholder : string } )[] = [];
		nodes.forEach( ( node : any ) => {
			if ( node.nodeType === 3 ) {
				result.push( node.textContent );
			}
			else if ( node.nodeType === 1 && node.hasAttribute( 'data-id' ) ) {
				const id          = node.getAttribute( 'data-id' );
				const placeholder = this.inputs.find( i => i.id === id )?.placeholder || '';
				result.push( { id , placeholder } );
			}
		} );

		this.exported.emit( result );
	}

	exportTemplate () : void {
		const result : ( string | { id : string, placeholder : string } )[] = [];

		const traverse = ( node : Node ) => {
			if ( node.nodeType === 3 ) {
				// Text node
				if ( node.textContent?.trim() ) result.push( node.textContent );
			}
			else if ( node.nodeType === 1 ) {
				const el = node as HTMLElement;

				if ( el.hasAttribute( 'data-id' ) ) {
					const id          = el.getAttribute( 'data-id' )!;
					const placeholder = this.inputs.find( i => i.id === id )?.placeholder || '';
					result.push( { id , placeholder } );
				}
				else {
					// Duyệt các con của node này
					Array.from( el.childNodes ).forEach( traverse );
				}
			}
		};

		Array.from( this.editable.nativeElement.childNodes ).forEach( traverse );

		this.exported.emit( result );
	}
}
