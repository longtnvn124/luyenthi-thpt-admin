import { Component , computed , EventEmitter , Input , Output , signal , Signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IctuPaginatorControl } from "@theme/components/ictu-paginator/ictu-paginator-control";
import { MatButtonModule } from "@angular/material/button";

@Component( {
	selector    : 'ictu-paginator' ,
	standalone  : true ,
	imports     : [ CommonModule , MatButtonModule ] ,
	templateUrl : './ictu-paginator.component.html' ,
	styleUrls   : [ './ictu-paginator.component.css' ] ,
	host        : {
		class : 'ictu-paginator w-100 d-flex align-items-center justify-content-center' ,
		style : `
		--mdc-filled-button-label-text-font: "Roboto", sans-serif;
		--mdc-filled-button-label-text-size: 14px;
		--mdc-filled-button-label-text-tracking: normal;
		--mdc-filled-button-label-text-weight: 400;
		--mdc-filled-button-label-text-transform: none;
		--mdc-filled-button-container-height:35px;
		--p-icon-size:14px;`
	} ,
} )
export class IctuPaginatorComponent {
	
	control : WritableSignal<IctuPaginatorControl> = signal<IctuPaginatorControl>( new IctuPaginatorControl( {
		pageLinkSize      : 5 ,
		showFirstLastIcon : true ,
		rows              : 20
	} ) );
	
	@Input( { required : true , alias : 'control' } ) set setting ( control : IctuPaginatorControl ) {
		this.control.set( control );
	}
	
	@Output() onChangePage : EventEmitter<number> = new EventEmitter<number>();
	
	pageCount : Signal<number> = computed<number>( () : number => ( Math.ceil( this.control().totalRecords() / this.control().rows() ) ) );
	
	empty : Signal<boolean> = computed<boolean>( () : boolean => this.control().totalRecords() === 0 );
	
	isFirstPage : Signal<boolean> = computed<boolean>( () : boolean => this.control().paged() === 1 );
	
	isLastPage : Signal<boolean> = computed<boolean>( () : boolean => ( this.control().paged() === this.pageCount() ) );
	
	elements : Signal<number[]> = computed<number[]>( () : number[] => {
		const numberOfPages : number = this.pageCount();
		const visiblePages : number  = Math.min( Math.max( ( this.control().pageLinkSize() - 1 ) , 2 ) , numberOfPages );
		
		//calculate range, keep current in middle if necessary
		let start : number = Math.max( 1 , Math.ceil( this.control().paged() - visiblePages / 2 ) );
		const end : number = Math.min( numberOfPages , start + visiblePages );
		
		//check when approaching to last page
		const delta : number = this.control().pageLinkSize() - ( end - start + 1 );
		start                = Math.max( 1 , start - delta );
		
		const pageLinks : Array<number> = [];
		
		for ( let i : number = start ; i <= end ; i++ ) {
			pageLinks.push( i );
		}
		return pageLinks;
	} );
	
	changePageToFirst ( event : MouseEvent ) : void {
		if ( ! this.isFirstPage() ) {
			this.changePage( 1 );
		}
		event.preventDefault();
	}
	
	changePageToPrev ( event : MouseEvent ) : void {
		this.changePage( this.control().paged() - 1 );
		event.preventDefault();
	}
	
	changePageToNext ( event : MouseEvent ) : void {
		this.changePage( this.control().paged() + 1 );
		event.preventDefault();
	}
	
	changePageToLast ( event : MouseEvent ) : void {
		if ( ! this.isLastPage() ) {
			this.changePage( this.pageCount() );
		}
		event.preventDefault();
	}
	
	changePage ( pageNumber : number , event? : MouseEvent ) : void {
		if ( pageNumber >= 1 && pageNumber <= this.pageCount() && pageNumber !== this.control().paged() ) {
			this.onChangePage.emit( pageNumber );
		}
		if ( event ) {
			event.preventDefault();
		}
	}
	
	identify ( _ : number , node : number ) : number {
		return node;
	}
}
