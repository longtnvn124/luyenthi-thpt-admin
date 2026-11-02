import { computed , Signal , signal , WritableSignal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { catchError , forkJoin , Observable , of , Subject , throwError } from "rxjs";
import { tap } from "rxjs/operators";
import { IctuDropdownField } from "@model/commons";
import { Sidebar } from "primeng/sidebar";

export type IctuFormControlState = 'PREPARATION' | 'READY' | 'SUBMITTING' | 'PREPARATION_FAILED';

export type IctuFormControlType = 'FORM_ADD' | 'FORM_EDIT';

export interface IctuFormControlConstructor {
	dropdownFields : IctuDropdownField[],
	formGroup? : FormGroup,
	objectName? : string,
	getLoadingLabel? : Record<IctuFormControlState , string>,
	sidebar : Sidebar
}

export class IctuFormControl<T> {
	
	private readonly type : WritableSignal<IctuFormControlType>;
	
	public readonly state : WritableSignal<IctuFormControlState> = signal<IctuFormControlState>( 'PREPARATION' )
	
	public readonly heading : Signal<string>;
	
	public readonly enableLoading : Signal<boolean>;
	
	public readonly loadingLabel : Signal<string>;
	
	public formGroup : FormGroup;
	
	public object : T;
	
	readonly sidebar : Sidebar;
	
	public visible : boolean;
	
	public _submitted : boolean;
	
	public get submitted () : boolean {
		return this._submitted;
	}
	
	private readonly _objectName : string;
	
	private readonly _getLoadingLabel : Record<IctuFormControlState , string>;
	
	public readonly observeClosed : Subject<boolean> = new Subject<boolean>();
	
	public get onClosed () : Observable<boolean> {
		return this.observeClosed.asObservable();
	}
	
	private readonly dropdownFields : IctuDropdownField[];
	
	private get preloader () : Observable<any> {
		const requests : Observable<any>[] = this.dropdownFields.reduce( ( reducer : Observable<any>[] , field : IctuDropdownField ) : Observable<any>[] => {
			if ( field.dirty ) {
				reducer.push( field.load() );
			}
			return reducer;
		} , new Array<Observable<any>>() );
		return requests.length ? forkJoin<any[]>( requests ) : of( 1 );
	}
	
	public get formFilledAndValid () : boolean {
		return this.formGroup ? this.formGroup.valid && this.formGroup.touched : false;
	}
	
	public get isFormAdd () : boolean {
		return this.type() === 'FORM_ADD';
	}
	
	public get isFormEdit () : boolean {
		return this.type() === 'FORM_EDIT';
	}
	
	constructor ( info : IctuFormControlConstructor ) {
		const arrLoadingState : IctuFormControlState[] = [ 'SUBMITTING' , 'PREPARATION' ]
		if ( info.formGroup ) {
			this.formGroup = info.formGroup;
		}
		this.visible          = false;
		this.dropdownFields   = info.dropdownFields || [];
		this._getLoadingLabel = info.getLoadingLabel || {
			PREPARATION        : 'Thiết lập thông tin...' ,
			PREPARATION_FAILED : '' ,
			READY              : '' ,
			SUBMITTING         : 'Cập nhật dữ liệu...'
		};
		this._objectName      = info.objectName || 'đối tượng';
		this.sidebar          = info.sidebar || null;
		this._submitted       = false;
		this.type             = signal<IctuFormControlType>( 'FORM_ADD' );
		this.heading          = computed( () : string => ( `${ this.type() === 'FORM_ADD' ? 'Thêm mới' : 'Cập nhật' } ${ this._objectName }` ) );
		this.loadingLabel     = computed( () : string => ( this._getLoadingLabel[ this.state() ] ) );
		this.enableLoading    = computed( () : boolean => ( arrLoadingState.includes( this.state() ) ) );
	}
	
	openFormAdd () : void {
		this._submitted = false;
		this.preloadForm( 'FORM_ADD' , null );
		this.visible = true;
	}
	
	openFormEdit ( object : T ) : void {
		this._submitted = false;
		this.preloadForm( 'FORM_EDIT' , object );
		this.visible = true;
	}
	
	closeForm () : void {
		this.visible = false;
		if ( this.sidebar ) {
			this.sidebar.hide( true );
		}
	}
	
	private preloadForm ( type : IctuFormControlType , object : T ) : void {
		this.object = object;
		this.type.set( type );
		this.preparation();
	}
	
	public markFormSubmitted () : void {
		this._submitted = true;
	}
	
	preparation () : void {
		this.state.set( 'PREPARATION' );
		this.preloader.subscribe( {
			next  : () : void => {
				this.state.set( 'READY' );
			} ,
			error : () : void => {
				this.state.set( 'PREPARATION_FAILED' );
			} ,
		} );
	}
	
	public get canSubmit () : boolean {
		return this.formFilledAndValid && this.state() === 'READY';
	}
	
	/**
	 * submit
	 * Only call submitting without actions
	 * */
	public submit ( submitter : Observable<any> ) : Observable<any> {
		this.state.set( 'SUBMITTING' );
		return submitter.pipe(
			tap( () : void => {
				this.markFormSubmitted();
				this.state.set( 'READY' );
			} ) ,
			catchError( ( err : any ) : Observable<never> => {
				this.state.set( 'READY' )
				return throwError( () : any => err );
			} )
		);
	}
	
	public recallFormPreparation () : void {
		this.preparation();
	}
}