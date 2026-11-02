// import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
// import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { Plugin } from '@ckeditor/ckeditor5-core'; // Đúng cách import Plugin từ CKEditor build sẵn

export default class CustomImagePlugin extends Plugin {
	init () {
		const editor = this.editor;

		// Cho phép các thuộc tính bổ sung cho ảnh
		editor.model.schema.extend( 'imageBlock' , {
			allowAttributes : [ 'alt' , 'title' , 'description' ]
		} );

		// Downcast converter (Chuyển đổi từ model sang view HTML)
		editor.conversion.for( 'downcast' ).attributeToElement( {
			model : 'alt' ,
			view  : ( altValue , { writer } ) => {
				return writer.createAttributeElement( 'img' , { alt : altValue } );
			}
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model : 'title' ,
			view  : ( titleValue , { writer } ) => {
				return writer.createAttributeElement( 'img' , { title : titleValue } );
			}
		} );

		// Upcast converter (Chuyển đổi từ HTML vào model CKEditor)
		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view  : {
				name : 'img' ,
				key  : 'alt'
			} ,
			model : 'alt'
		} );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view  : {
				name : 'img' ,
				key  : 'title'
			} ,
			model : 'title'
		} );
	}
}
