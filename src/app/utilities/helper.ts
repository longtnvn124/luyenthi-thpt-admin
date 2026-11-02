import { Is } from './is';
import { IctuConditionParam } from '@model/dto';
import { HttpParams } from '@angular/common/http';
import { signal , Signal } from "@angular/core";
import { AbstractControl , ValidatorFn } from "@angular/forms";

type ArrayOrderBy = -1 | 1;

const encodeHTMLReplacement : { [ key : string ] : string } = {
	'&'  : '&amp;' ,
	'<'  : '&lt;' ,
	'>'  : '&gt;' ,
	'\'' : '&apos;'
};

export class HelperClass {
	/**
	 * sort
	 * @param array : array
	 * @param field : any field chosen to sort
	 * @param orderBy : ArrayOrderBy Direction to sort ascending: 1; descending: -1; default: 1.
	 */
	arraySort<T> ( array : Array<T> , field : keyof T , orderBy : ArrayOrderBy = 1 ) : T[] {
		return array.sort( ( left , right ) : number => {
			if ( left[ field ] < right[ field ] ) {
				return -orderBy;
			}
			if ( left[ field ] > right[ field ] ) {
				return orderBy;
			}
			return 0;
		} );
	}

	arrayShuffle<T> ( array : Array<T> ) : T[] {
		for ( let i : number = array.length - 1 ; i > 0 ; i-- ) {
			const j : number            = Math.floor( Math.random() * ( i + 1 ) );
			[ array[ i ] , array[ j ] ] = [ array[ j ] , array[ i ] ];
		}
		return array;
	}

	sortWidthTwoConditions ( dataSource : any[] , firstCondition : string , secondsCondition : string ) : any[] {
		return dataSource.sort( ( left , right ) : number => {
			if ( left[ firstCondition ] < right[ firstCondition ] ) {
				return -1;
			}
			else if ( left[ firstCondition ] > right[ firstCondition ] ) {
				return 1;
			}
			if ( left[ secondsCondition ] < right[ secondsCondition ] ) {
				return -1;
			}
			else if ( left[ secondsCondition ] > right[ secondsCondition ] ) {
				return 1;
			}
			return 0;
		} );
	}

	tryParseJSON ( str : string ) {
		try {
			const obj = JSON.parse( str );
			/**
			 * Handle non-exception-throwing cases:
			 * Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
			 * but... JSON.parse(null) returns null, and typeof null === "object",
			 * so we must check for that, too. Thankfully, null is falsy, so this suffices:
			 * */
			return ( obj && typeof obj === 'object' ) ? obj : [];
		}
		catch ( e ) {
			return [];
		}
	}

	isValidJSON ( str : string ) : boolean {
		try {
			JSON.parse( str );
			return true;
		}
		catch ( e ) {
			return false;
		}
	}

	/**
	 * sanitizeVietnameseTitle
	 * Sanitizes a string into a slug
	 * @param title - input ( string )
	 * @return a slug converted from string input
	 * */
	sanitizeVietnameseTitle ( title : string ) : string {
		let str : string    = title;
		str                 = str.replace( /^\s+|\s+$/g , '' );
		str                 = str.toLowerCase();
		const from : string = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ·/_,:;';
		const to : string   = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd------';
		for ( let i : number = 0 ; i <= from.length ; i++ ) {
			str = str.replace( new RegExp( from.charAt( i ) , 'g' ) , to.charAt( i ) );
		}

		str = str.replace( /[^a-z\d -]/g , '' ).replace( /\s+/g , '-' ).replace( /-+/g , '-' );
		return str;
	}

	encodeHTML ( text : string ) : string {
		return text ? text.replace( /[&<>'"]/g , tag => ( encodeHTMLReplacement[ tag ] || tag ) ) : '';
	}

	decodeHTML ( text : string ) : string {
		return text.replace( /&apos;/g , '\'' ).replace( /&quot;/g , '"' ).replace( /&gt;/g , '>' ).replace( /&lt;/g , '<' ).replace( /&amp;/g , '&' );
	}

	showPhoneNumbersSafety ( phone : string , numberToShow = 4 ) : string {
		return phone && phone.length ? new Array( phone.length - numberToShow + 1 ).join( '*' ) + phone.slice( -numberToShow ) : '';
	}

	showEmailAddressSafety ( email : string ) : string {
		if ( ! email || email.length < 5 ) {
			return '';
		}
		const arrEmail = email.split( '@' );
		if ( arrEmail[ 0 ].length < 2 ) {
			return email;
		}
		const trailingCharsIntactCount2 = Math.floor( arrEmail[ 0 ].length / 2 );
		arrEmail[ 0 ]                   = arrEmail[ 0 ].slice( 0 , trailingCharsIntactCount2 ) + new Array( arrEmail[ 0 ].length - trailingCharsIntactCount2 + 1 ).join( '*' );
		return arrEmail.join( '@' );
	}

	getYoutubeIdFromUrl ( url : string ) : string {
		if ( Is.empty( url ) ) {
			return '';
		}
		const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		return url.match( regex ) ? RegExp.$2 : url;
	}

	removeAscent ( str : string ) {
		if ( str === null || str === undefined ) {
			return str;
		}
		str = str.toLowerCase();
		str = str.replace( /[àáạảãâầấậẩẫăằắặẳẵ]/g , 'a' );
		str = str.replace( /[èéẹẻẽêềếệểễ]/g , 'e' );
		str = str.replace( /[ìíịỉĩ]/g , 'i' );
		str = str.replace( /[òóọỏõôồốộổỗơờớợởỡ]/g , 'o' );
		str = str.replace( /[ùúụủũưừứựửữ]/g , 'u' );
		str = str.replace( /[ỳýỵỷỹ]/g , 'y' );
		str = str.replace( /đ/g , 'd' );
		return str;
	}

	formatSQLTimeStamp ( date : Date ) : string {
		const d = new Date( date.toUTCString() );
		return this.formatSQLDateTime( d );
	}

	formatSQLDateTime ( date : Date ) : string {
		const y : string   = date.getFullYear().toString();
		const m : string   = ( date.getMonth() + 1 ).toString().padStart( 2 , '0' );
		const d : string   = date.getDate().toString().padStart( 2 , '0' );
		const h : string   = date.getHours().toString().padStart( 2 , '0' );
		const min : string = date.getMinutes().toString().padStart( 2 , '0' );
		const sec : string = date.getSeconds().toString().padStart( 2 , '0' );
		return `${ y }-${ m }-${ d } ${ h }:${ min }:${ sec }`;
	}

	/**
	 * convert form Date object to sql DATETIME format
	 * @param date : Date
	 * @return string // YYYY-MM-DD
	 * */
	formatSQLDate ( date : Date ) : string {
		const y : string = date.getFullYear().toString( 10 );
		const m : string = ( date.getMonth() + 1 ).toString().padStart( 2 , '0' );
		const d : string = date.getDate().toString().padStart( 2 , '0' );
		return `${ y }-${ m }-${ d }`;
	}

	strToSQLDate ( input : string ) : string {
		const date = input ? this.dateFormatWithTimeZone( input ) : null;
		return date ? this.formatSQLDate( date ) : '';
	}

	uniqueId () : string {
		const head : string = Date.now().toString( 36 );
		const tail : string = Math.random().toString( 36 ).substr( 2 );
		return head + tail;
	}

	copyToClipboard ( text : string ) : void {
		if ( navigator.clipboard?.writeText ) {
			void navigator.clipboard.writeText( text );
		}
	}

	shallowClone ( obj : Object ) : Object {
		return Object.assign( {} , obj );
	}

	countWords ( str : string ) : number {
		return str.split( /[^a-zA-Z-]+/ ).filter( Boolean ).length;
	}

	randomIntegerInRange ( min : number , max : number ) : number {
		return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	}

	minDate ( dates : Date[] ) : Date {
		const arrNumber = dates.filter( Boolean ).map( d => d.getTime() );
		return new Date( Math.min( ... arrNumber ) );
	}

	maxDate ( dates : Date[] ) : Date {
		const arrNumber = dates.filter( Boolean ).map( d => d.getTime() );
		return new Date( Math.max( ... arrNumber ) );
	}

	isSameDate ( dateOne : Date , dateTwo : Date ) : boolean {
		return dateOne.toISOString() === dateTwo.toISOString();
	}

	isBeforeDate ( dateOne : Date , dateTwo : Date ) : boolean {
		return dateOne < dateTwo;
	}

	isAfterDate ( dateOne : Date , dateTwo : Date ) : boolean {
		return dateOne > dateTwo;
	}

	isBrowserTabFocused = () => ! document.hidden;

	generateCode ( length : number = 16 , dictionary : string = '' ) : string {
		const permittedChars : string       = dictionary || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ&';
		const permittedCharsLength : number = permittedChars.length;
		let result : string                 = '';
		const usedList : number[]           = [];
		for ( let i : number = 0 ; i < length ; i++ ) {
			let position : number = Math.floor( Math.random() * permittedCharsLength );
			if ( usedList.includes( position ) ) {
				while ( usedList.includes( position ) ) {
					position = Math.floor( Math.random() * permittedCharsLength );
				}
			}
			usedList.unshift( position );
			usedList.length = 5;
			result          = ''.concat( result , permittedChars[ position ] );
		}
		return result;
	}

	/**
	 * capitalizedString
	 * Uppercase first letter of the words
	 * */
	capitalizedString ( data : string ) : string {
		return data[ 0 ].toUpperCase() + data.slice( 1 );
	}

	dateFormatWithTimeZone ( date : Date | string , timeZone : string = 'Asia/Ho_Chi_Minh' ) : Date {
		return typeof date === 'string' ? new Date( new Date( date ).toLocaleString( 'en-US' , { timeZone } ) ) : new Date( date.toLocaleString( 'en-US' , { timeZone } ) );
	}

	/**
	 * str2Number
	 * convert variable from string to number safety
	 * @var str - input string
	 * @var _default - default result's value if conversion failed
	 * */
	str2Number ( str : string , _default : number = 0 ) : number {
		try {
			const num : number = parseInt( str , 10 );
			return ! Number.isNaN( num ) ? num : _default;
		}
		catch ( e ) {
			return _default;
		}
	}

	createNewArray ( total : number ) : number[] {
		return Array.from( { length : total } , ( _ , index ) => index );
	}

	formatVndCurrency ( num : number ) : string {
		return num.toLocaleString( 'vi-VN' , { style : 'currency' , currency : 'VND' } );
	}

	formatVnNumber ( num : number ) : string {
		return num.toLocaleString( 'vi-VN' );
	}

	/**
	 * reverseStrDateFormat
	 * reverse dd/mm/yyyy => yyyy/mm/dd
	 * reverse yyyy/mm/dd => dd/mm/yyyy
	 * */
	reverseStrDateFormat ( input : string ) : string {
		return input ? input.replace( /[-_.]/g , '/' ).split( '/' ).reverse().join( '/' ) : '';
	}

	base64ToFile ( base64 : string , fileName : string ) : File {
		const bytes = base64.split( ',' )[ 0 ].indexOf( 'base64' ) >= 0 ? atob( base64.split( ',' )[ 1 ] ) : ( <any> window ).unescape( base64.split( ',' )[ 1 ] );
		const mime  = base64.split( ',' )[ 0 ].split( ':' )[ 1 ].split( ';' )[ 0 ];
		const max   = bytes.length;
		const ia    = new Uint8Array( max );
		for ( let i = 0 ; i < max ; i++ ) {
			ia[ i ] = bytes.charCodeAt( i );
		}
		return new File( [ ia ] , fileName , { lastModified : new Date().getTime() , type : mime } );
	}

	base64ToFile2 ( base64 : string , fileName? : string ) : File {
		// Tách header & dữ liệu base64
		const arr       = base64.split( ',' );
		const mimeMatch = arr[ 0 ].match( /:(.*?);/ );
		const mime      = mimeMatch ? mimeMatch[ 1 ] : 'application/octet-stream';

		// Map MIME type sang extension
		const mimeToExt : { [ key : string ] : string } = {
			'image/jpeg'      : 'jpg' ,
			'image/png'       : 'png' ,
			'image/gif'       : 'gif' ,
			'image/webp'      : 'webp' ,
			'application/pdf' : 'pdf' ,
			'text/plain'      : 'txt'
		};

		// Lấy extension hoặc mặc định là 'bin'
		const extension = mimeToExt[ mime ] || 'bin';
		fileName        = fileName ? fileName : `file.${ extension }`;

		// Chuyển Base64 → Mảng byte
		const byteString  = atob( arr[ 1 ] );
		const byteNumbers = new Array( byteString.length );
		for ( let i = 0 ; i < byteString.length ; i++ ) {
			byteNumbers[ i ] = byteString.charCodeAt( i );
		}

		// Tạo Blob từ dữ liệu
		const byteArray = new Uint8Array( byteNumbers );
		const fileBlob  = new Blob( [ byteArray ] , { type : mime } );

		// Tạo File từ Blob
		return new File( [ fileBlob ] , fileName , { type : mime } );
	}

	blobToFile ( blob : Blob , fileName : string ) : File {
		return new File( [ blob ] , fileName , { lastModified : new Date().getTime() , type : blob.type } );
	}

	base64URLEncode ( str : string ) : string {
		const utf8Arr : Uint8Array   = new TextEncoder().encode( str );
		const base64Encoded : string = btoa( String.fromCharCode( ... new Uint8Array( utf8Arr ) ) );
		return base64Encoded.replace( /\+/g , '-' ).replace( /\//g , '_' ).replace( /=+$/ , '' );
	}

	base64URLDecode ( str : string ) : string {
		const base64Encoded : string     = str.replace( /-/g , '+' ).replace( /_/g , '/' );
		const padding : string           = str.length % 4 === 0 ? '' : '='.repeat( 4 - ( str.length % 4 ) );
		const base64WithPadding : string = base64Encoded + padding;
		return atob( base64WithPadding ).split( '' ).map( char => String.fromCharCode( char.charCodeAt( 0 ) ) ).join( '' );
	}

	convertToDateString ( dateString : string , typeFormat : string ) : string {
		const date                 = new Date( dateString );
		let date1                  = date.toLocaleDateString();
		let [ month , day , year ] = date1.split( '/' );


		// const day = String(date.getUTCDate()).padStart(2, '0');
		// const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
		// const year = date.getUTCFullYear();

		// const hours = String(date.getUTCHours()).padStart(2, '0');
		// const minutes = String(date.getUTCMinutes()).padStart(2, '0');
		// const seconds = String(date.getUTCSeconds()).padStart(2, '0');

		return `${ day }${ typeFormat }${ month }${ typeFormat }${ year }`;
	}

	convertFileFromBase64 ( UrlOject : string , fileName : string , addExtention : boolean = false ) {
		const bytes = UrlOject.split( ',' )[ 0 ].indexOf( 'base64' ) >= 0 ? atob( UrlOject.split( ',' )[ 1 ] ) : ( <any> window ).unescape( UrlOject.split( ',' )[ 1 ] );
		const mime  = UrlOject.split( ',' )[ 0 ].split( ':' )[ 1 ].split( ';' )[ 0 ];
		const max   = bytes.length;
		const ia    = new Uint8Array( max );
		for ( let i = 0 ; i < max ; i++ ) {
			ia[ i ] = bytes.charCodeAt( i );
		}
		if ( addExtention ) {
			fileName = ''.concat( fileName , '.' , mime.split( '/' )[ 1 ] );
		}
		return new File( [ ia ] , fileName , { type : mime } );
	}
}

export const Helper : HelperClass = Object.freeze<HelperClass>( new HelperClass() );

export const paramsConditionBuilder : ( conditions : IctuConditionParam[] , params? : HttpParams | null ) => HttpParams = ( conditions : IctuConditionParam[] , params : HttpParams | null = null ) : HttpParams => {
	const initHttpParams : HttpParams = params || new HttpParams();
	return conditions.reduce( ( httpParams , condition , i ) => {
		const key : string   = 'condition[' + i + '][key]';
		const value : string = 'condition[' + i + '][value]';
		httpParams           = httpParams.append( key , condition.conditionName || '' );
		httpParams           = httpParams.append( value , condition.value || '' );
		if ( condition[ 'condition' ] ) {
			const compare : string = 'condition[' + i + '][compare]';
			httpParams             = httpParams.append( compare , condition.condition || '' );
		}
		if ( condition[ 'orWhere' ] ) {
			const type : string = 'condition[' + i + '][type]';
			httpParams          = httpParams.append( type , condition[ 'orWhere' ] );
		}
		return httpParams;
	} , initHttpParams );
};

export const paramsBuilder : ( params : { [ T : string ] : string | number | boolean } ) => HttpParams = ( params : {
	[ T : string ] : string | number | boolean
} ) : HttpParams => {
	let httpParams : HttpParams = new HttpParams();
	const prmNames : string[]   = params ? Object.keys( params ) : [];
	if ( prmNames.length ) {
		prmNames.forEach( ( k : string ) : HttpParams => httpParams = httpParams.set( k , params[ k ] ) );
	}
	return httpParams;
};

export const parseArgs : <T>( input : Partial<T> , _default : T ) => T = <T> ( input : Partial<T> , _default : Partial<T> ) : T => Object.assign( _default , input ) as T;

export const applyInlineStyles : ( element : HTMLElement , styles : Partial<CSSStyleDeclaration> ) => HTMLElement = ( element : HTMLElement , styles : Partial<CSSStyleDeclaration> ) : HTMLElement => {
	const attrs : string[] = styles ? Object.keys( styles ) : [];
	return attrs.length ? attrs.reduce( ( _element : HTMLElement , attribute : string ) : HTMLElement => {
		_element.style[ attribute ] = styles[ attribute ];
		return _element;
	} , element ) : element;
}
declare var window : any;

export const linkStaticResource : ( path : string ) => string = ( path : string ) : string => {
	return window.location.origin + '/' + path
};

export const staticResource : ( path : string ) => Signal<string> = ( path : string ) : Signal<string> => {
	return signal<string>( linkStaticResource( path ) );
};


export function decimalNumberValidator () : ValidatorFn {
	return ( control : AbstractControl ) : { invalidDecimal : true } | null => {
		if ( ! control.value ) return null;
		const parsed : number = parseDecimal( control.value );
		return isNaN( parsed ) ? { invalidDecimal : true } : null;
	};
}

export function parseDecimal ( value : string | number ) : number {
	if ( typeof value === 'number' ) {
		return value;
	}
	const normalized : string = value.replace( ',' , '.' );
	const num : number        = parseFloat( normalized );
	return isNaN( num ) ? NaN : num;
}