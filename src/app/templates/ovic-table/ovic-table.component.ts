import {
	ChangeDetectionStrategy ,
	Component ,
	EventEmitter ,
	Input ,
	OnDestroy ,
	OnInit ,
	Output ,
	SimpleChanges ,
	TemplateRef ,
	ViewChild ,
	ViewContainerRef ,
	ViewEncapsulation
} from '@angular/core';
import { Table , TableModule } from 'primeng/table';
import { debounceTime , distinctUntilChanged , Subject , takeUntil } from 'rxjs';
import { NotificationService } from '@theme/services/notification.service';
import { InsideAction , OvicTableStructure , OvicTableStructureButton } from '@model/ovic-models';
import { ButtonBase } from '@model/button';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { MatMenuModule } from '@angular/material/menu';
import { TooltipModule } from 'primeng/tooltip';
import { SafeHtmlPipe } from "../../pipes/safe-html.pipe";
import { DomSanitizer , SafeHtml } from '@angular/platform-browser';
import { InputTextModule } from "primeng/inputtext";

@Component( {
	selector        : 'ovic-table' ,
	standalone      : true ,
	templateUrl     : './ovic-table.component.html' ,
	styleUrls       : [ './ovic-table.component.css' ] ,
	encapsulation   : ViewEncapsulation.None ,
	changeDetection : ChangeDetectionStrategy.OnPush ,
	imports         : [ CommonModule , ButtonModule , RippleModule , TableModule , DropdownModule , MatMenuModule , TooltipModule , SafeHtmlPipe , InputTextModule ] ,
} )
export class OvicTableComponent implements OnInit , OnDestroy {
	
	@Input() min_width : string = '70rem'; // Khởi tạo giá trị của biến min_width
	
	tableStyles : { [ key : string ] : string } = {};
	
	@Input() session : number = 1; // using to force regenerate view from parent component
	
	@Input() index : number = 1;
	
	@Input() data;
	
	@Input() tableName : string = null;
	
	@Input() enableSearch : boolean;
	
	@Input() enableSearchLocal : boolean = true;
	
	@Input() searchCircle : boolean = false;
	
	@Input() searchDebounceTime : number = 500; // unit mini seconds
	
	@Input() searchPlaceholder : string = 'Tìm kiếm thông tin';
	
	@Input() loading;
	
	@Input() dataKey;
	
	@Input() rowHover;
	
	@Input() rows : number;
	
	@Input() page : number = 1;
	
	@Input() globalFilterFields;
	
	@Input() styleClass;
	
	@Input() tblStructure : OvicTableStructure[];
	
	@Input() ovicFiler;
	
	@Input() ovicFilterOption;
	
	@Input() addRow : boolean;
	
	@Input() headerButtons : ButtonBase[];
	
	@Input() addRowLabel : string;
	
	@Input() options_dropdown : any[];
	
	@Input() label_dropdown : string = 'label';
	
	@Input() addDropdown : boolean = false;
	
	@Input() placeholder_dropdown : string = '--Tất cả--';
	
	/*For Expansion settings */
	
	@Input() rowExpanded : boolean = false;
	
	@Input() expandedHeadCssClass : string;
	
	@Input() expandedHeadInner : string;
	
	@Input() expandedColumnCssClass : string;
	
	@Input() expandedDataField : string;
	
	@Input() expandedTooltip : string;
	
	@Input() expandedBtnIcons : any; /*[ 'pi pi-chevron-down' , 'pi pi-chevron-right' ]*/
	
	@Input() expandedBtnInside : InsideAction;
	
	@Input() menuTemplate : TemplateRef<any>;
	
	@Input() enablePaginator : boolean = false;
	
	@Input() emptyMessage : string = 'Không có dữ liệu';
	
	@Output() onChangeDropdownEvent : EventEmitter<any> = new EventEmitter<any>();
	/*------------------------------------------------------------*/
	
	@Output() expandedInside : EventEmitter<any> = new EventEmitter<any>();
	
	@Output() editData : EventEmitter<number> = new EventEmitter<number>();
	
	@Output() deleteData : EventEmitter<number> = new EventEmitter<number>();
	
	@Output() lockData : EventEmitter<boolean> = new EventEmitter<boolean>();
	
	@Output() switch : EventEmitter<boolean> = new EventEmitter<boolean>();
	
	@Output() rowClick : EventEmitter<boolean> = new EventEmitter<boolean>();
	
	@Output() addNewRow : EventEmitter<boolean> = new EventEmitter<boolean>();
	
	@Output() onButtonClick : EventEmitter<ButtonBase> = new EventEmitter<ButtonBase>();
	
	@Output() onSearch : EventEmitter<string> = new EventEmitter<string>();
	
	@ViewChild( Table , { static : true } ) table : Table;
	
	@ViewChild( 'topSelectorValue' ) topSelectorValue;
	
	tblClass : string = 'ovic-ui-table';
	
	rowLength : number = 3;
	
	activeRow : any;
	
	private _EVENT_CLICK : Subject<ButtonBase> = new Subject<ButtonBase>();
	
	private closeObservers$ : Subject<string> = new Subject<string>();
	
	private _SEARCH_DEBOUNCE : Subject<string> = new Subject<string>();
	
	constructor (
		private notificationService : NotificationService ,
		private viewContainerRef : ViewContainerRef ,
		private sanitizer : DomSanitizer
	) {
		this.notificationService.eventCloseRightContextMenu$.pipe( takeUntil( this.closeObservers$ ) ).subscribe( { next : () => this.activeRow = null } );
		this._EVENT_CLICK.asObservable().pipe( takeUntil( this.closeObservers$ ) , debounceTime( 300 ) ).subscribe( { next : button => this.onButtonClick.emit( button ) } );
		this._SEARCH_DEBOUNCE.asObservable().pipe( takeUntil( this.closeObservers$ ) , debounceTime( this.searchDebounceTime ) , distinctUntilChanged() ).subscribe( search => this.onSearch.emit( search ) );
	}
	
	ngOnInit () : void {
		if ( this.styleClass ) {
			this.tblClass = `ovic-ui-table ${ this.styleClass }`;
		}
		if ( ! this.rows ) {
			this.rows = 20;
		}
		if ( this.tblStructure ) {
			this.rowLength = this.tblStructure.length + 1;
			if ( this.rowExpanded ) {
				this.rowLength = this.tblStructure.length + 2;
			}
		}
		if ( ! this.addRow ) {
			this.addRow = false;
		}
		else {
			if ( ! this.addRowLabel ) {
				this.addRowLabel = 'Thêm trường mới';
			}
		}
		
		this.tableStyles = {
			'min-width' : this.min_width ,
			'width'     : '100%'
		};
	}
	
	getSafeHtmlContent ( html : string ) : SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml( html );
	}
	
	ngOnDestroy () : void {
		this.closeObservers$.next( 'close' );
		this.closeObservers$.complete();
	}
	
	ngOnChanges ( changes : SimpleChanges ) : void {
		if ( changes[ 'data' ] ) {
		}
	}
	
	editClick ( key : any ) : void {
		this.editData.emit( key );
		this.userClick( {
			label : 'Edit button' ,
			name  : 'EDIT' ,
			data  : key ,
			icon  : '' ,
			class : ''
		} );
	}
	
	deleteClick ( key : any ) : void {
		this.deleteData.emit( key );
		this.userClick( {
			label : 'Delete button' ,
			name  : 'DELETE' ,
			data  : key ,
			icon  : '' ,
			class : ''
		} );
	}
	
	lockClick ( key : any ) : void {
		this.lockData.emit( key );
		this.userClick( {
			label : 'Lock button' ,
			name  : 'LOCK' ,
			data  : key ,
			icon  : '' ,
			class : ''
		} );
	}
	
	buttonClick ( button : OvicTableStructureButton , key : any ) : void {
		this.userClick( {
			label : button.label ,
			name  : button.name ,
			data  : key ,
			icon  : '' ,
			class : ''
		} );
	}
	
	switchClick ( key : any ) : void {
		this.switch.emit( key );
		this.userClick( {
			label : 'Switch button' ,
			name  : 'SWITCH' ,
			data  : key ,
			icon  : '' ,
			class : ''
		} );
	}
	
	rowClickHandle ( key : any ) : void {
		this.rowClick.emit( key );
	}
	
	addNewRowClick ( key : any ) : void {
		this.addNewRow.emit( true );
		this.userClick( {
			label : 'Add new row button' ,
			name  : 'ADD_NEW_ROW' ,
			data  : key ,
			icon  : '' ,
			class : ''
		} );
	}
	
	expandedBtnInsideHandle ( key : any ) : void {
		this.expandedInside.emit( key );
		this.userClick( {
			label : 'Expanded inside button' ,
			name  : 'EXPANDED_INSIDE' ,
			data  : key ,
			icon  : '' ,
			class : ''
		} );
	}
	
	/********************************************************
	 * Disable context menu
	 * ******************************************************/
	disableContextMenu ( event : Event ) : void {
		if ( this.menuTemplate ) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
	}
	
	/**********************************************
	 * open context menu
	 * *******************************************/
	// openContextMenu(event: MouseEvent, data) {
	// 	this.notificationService.closeContextMenu();
	// 	if (this.menuTemplate) {
	// 		this.notificationService.openContextMenu(event, this.menuTemplate, this.viewContainerRef, data, true);
	// 		this.activeRow = data[this.dataKey];
	// 	}
	// }
	
	userClick ( button : ButtonBase ) : void {
		this._EVENT_CLICK.next( button );
	}
	
	inputSearch ( text : string ) : void {
		
		if ( this.enableSearchLocal ) {
			this.table.filterGlobal( text , 'contains' );
		}
		else {
			this._SEARCH_DEBOUNCE.next( text );
		}
	}
	
	onChangeDropdown ( event : { value : any; } ) : void {
		this.onChangeDropdownEvent.emit( event.value );
	}
	
}
