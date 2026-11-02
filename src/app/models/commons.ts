import { computed , inject , signal , Signal , WritableSignal } from "@angular/core";
import { map , Observable , of } from "rxjs";
import { tap } from "rxjs/operators";
import { DtoObject , IctuConditionParam , IctuQueryParams } from "@model/dto";
import { IctuPermissionInfo , UserPermission } from "@model/auth";
import { AuthService } from "@service/core/auth.service";
import { IctuDataTable } from "@model/ictu-data-table";

export interface Commons {
}

export interface DropdownOption {
	label : string;
	value : any;
}

export interface PageEvent {
	first : number;
	rows : number;
	page : number;
	pageCount : number;
}

export interface IctuMediaLoaderInstance {
	reload : () => void;
}

export interface IctuDropdownOption<T> {
	label : string;
	value : T;
	disabled? : boolean;
}

export interface IctuDropdownOptionExtended<V , O> {
	label : string;
	value : V;
	disabled? : boolean;
	object : O
}

export type Gender = 'nam' | 'nu' | 'khac';

type LoadingState = 'loading';

type ErrorState = 'error';

type SuccessState = 'success';

type Empty = 'empty';

export type ComponentBaseState = LoadingState | ErrorState | SuccessState;

export type ComponentStateExtend = ComponentBaseState | Empty;

export class IctuDropdownField {
	readonly placeholder? : Signal<string>;
	readonly options : WritableSignal<IctuDropdownOption<number>[]>;
	private loaded : boolean;
	private _dirty : boolean;
	private loader : Observable<IctuDropdownOption<number>[]>

	constructor ( loader : Observable<IctuDropdownOption<number>[]> , placeholder? : string ) {
		this.loader      = loader;
		this.placeholder = signal<string>( placeholder || '' );
		this.loaded      = false;
		this._dirty      = false;
		this.options     = signal<IctuDropdownOption<number>[]>( [] );
	}

	public get dirty () : boolean {
		return this._dirty || ! this.loaded;
	}

	public markAsDirty () : void {
		this._dirty = true;
	}

	public load () : Observable<IctuDropdownOption<number>[]> {
		return this.dirty ? this.loader.pipe(
			tap( () : void => {
				this.loaded = true;
				this._dirty = false;
			} ) ,
			map( ( options : IctuDropdownOption<number>[] ) : IctuDropdownOption<number>[] => {
				this.options.set( options );
				return options;
			} )
		) : of( this.options() );
	}
}

export interface IctuBaseModel {
	id : number,
	is_deleted : number,
	deleted_by : number,
	created_by : number,
	updated_by : number,
	created_at : string, // sql date-time YYYY-MM-DD
	updated_at : string, // sql date-time YYYY-MM-DD
}

export interface IctuBaseService<T> {
	create : ( info : Partial<T> ) => Observable<number>;
	update : ( id : number , info : Partial<T> ) => Observable<any>;
	delete : ( id : number ) => Observable<any>;
	query : ( conditions : IctuConditionParam[] , queryParams? : IctuQueryParams ) => Observable<DtoObject<T[]>>
}

export class IctuPermissionControl implements IctuPermissionInfo {
	private userPermission : UserPermission;

	get canView () : boolean {
		return this.userPermission.view;
	}

	get canCreate () : boolean {
		return this.userPermission.create;
	}

	get canUpdate () : boolean {
		return this.userPermission.update;
	}

	get canDelete () : boolean {
		return this.userPermission.delete;
	}

	constructor ( permission : UserPermission ) {
		this.userPermission = permission;
	}

}

export interface IctuBasePermission {
	permissionControl : Signal<IctuPermissionControl>;
}

export class IctuBasePermissionClass implements IctuBasePermission {
	readonly permissionControl : Signal<IctuPermissionControl>;
	readonly userCanView : Signal<boolean>;
	readonly userCanCreate : Signal<boolean>;
	readonly userCanUpdate : Signal<boolean>;
	readonly userCanDelete : Signal<boolean>;
	readonly auth : AuthService = inject<AuthService>( AuthService );

	constructor ( route : string ) {
		this.permissionControl = signal<IctuPermissionControl>( new IctuPermissionControl( this.auth.getUserPermission( route ) ) );
		this.userCanView       = computed( () : boolean => this.permissionControl().canView )
		this.userCanCreate     = computed( () : boolean => this.permissionControl().canCreate )
		this.userCanUpdate     = computed( () : boolean => this.permissionControl().canUpdate )
		this.userCanDelete     = computed( () : boolean => this.permissionControl().canDelete )
	}
}

export interface IctuTableComponent<T> {
	dataTable : IctuDataTable<T>;
	identify : ( index : number , item : T ) => number | string
}