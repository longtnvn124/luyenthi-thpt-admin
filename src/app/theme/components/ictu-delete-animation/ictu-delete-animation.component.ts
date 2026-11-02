import { Component , computed , Inject , OnDestroy , signal , Signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule , ProgressBarMode } from "@angular/material/progress-bar";
import { map , Observable , Subject , takeUntil } from "rxjs";
import { MAT_DIALOG_DATA , MatDialogRef } from "@angular/material/dialog";

export interface IctuDeleteAnimationConfig {
	observer : Observable<number>;
}

@Component( {
	selector    : 'app-ictu-delete-animation' ,
	standalone  : true ,
	imports : [ CommonModule , MatProgressBarModule ] ,
	templateUrl : './ictu-delete-animation.component.html' ,
	styleUrls   : [ './ictu-delete-animation.component.scss' ]
} )
export class IctuDeleteAnimationComponent implements OnDestroy {
	
	mode : Signal<ProgressBarMode> = computed( () : ProgressBarMode => this.value() > 0 ? 'buffer' : 'indeterminate' );
	
	value : WritableSignal<number> = signal<number>( 0 );
	
	private onDestroy$ : Subject<string> = new Subject<string>();
	
	constructor (
		private dialogRef : MatDialogRef<IctuDeleteAnimationComponent> ,
		@Inject( MAT_DIALOG_DATA ) public data : IctuDeleteAnimationConfig
	) {
		this.data.observer.pipe(
			takeUntil( this.onDestroy$ ) ,
			map( ( progress : number ) : number => Math.min( progress , 100 ) )
		).subscribe( {
			next     : ( progress : number ) : void => {
				this.value.set( Math.round( progress ) );
				if ( progress === 100 ) {
					setTimeout( () : void => {
						if ( this.dialogRef ) {
							this.dialogRef.close( true );
						}
					} , 500 )
				}
			} ,
			error    : () : void => {
				if ( this.dialogRef ) {
					this.dialogRef.close( false );
				}
			} ,
			complete : () : void => {
				if ( this.dialogRef ) {
					this.dialogRef.close( true );
				}
			} ,
		} );
	}
	
	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroy' );
		this.onDestroy$.complete();
	}
}
