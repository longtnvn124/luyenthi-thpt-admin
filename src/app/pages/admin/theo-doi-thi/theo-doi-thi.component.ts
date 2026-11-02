import { CommonModule } from "@angular/common";
import { Component , ElementRef , OnDestroy , OnInit , TemplateRef , ViewChild , } from "@angular/core";
import { FormBuilder , FormGroup , FormsModule , ReactiveFormsModule , Validators , } from "@angular/forms";
import { ButtonBase } from "@model/button";
import { IctuPaginator , IctuQueryCondition } from "@model/dto";
import { TnQLCathi } from "@model/tn-ql-ca-thi";
import { HelperService } from "@service/core/helper.service";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { TnQLCathiService } from "@service/luyenthithpt/tn-ql-ca-thi.service";
import { TnShiftTestQuestionService } from "@service/luyenthithpt/tn-shift-test-question.service";
import { TnShiftTestService } from "@service/luyenthithpt/tn-shift-test.service";
import { NotificationService } from "@theme/services/notification.service";
import { ButtonModule } from "primeng/button";
import { PaginatorModule , PaginatorState } from "primeng/paginator";
import { debounceTime , firstValueFrom , forkJoin , map , Subject , switchMap , takeUntil , } from "rxjs";
import { ProgressBarModule } from "primeng/progressbar";
import { CheckboxModule } from "primeng/checkbox";
import { TnStudent } from "@model/tn-student";
import { NgbModal , NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TableModule } from "primeng/table";
import { TnShiftTest } from "@model/tn-shift-test";
import { TnStudentService } from "@service/luyenthithpt/tn-student.service";
import { TnShiftTestControlService } from "@service/luyenthithpt/tn-shift-test-control.service";
import { DomSanitizer } from "@angular/platform-browser";
import { TnFormDetailService } from "@service/luyenthithpt/tn-form-detail.service";
import { AuthService } from "@service/core/auth.service";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { SKILL_TEST_OBJECT , SKILL_TEST_TOTAL } from "@utilities/syscats";
import { TnShiftTestStateService } from "@service/luyenthithpt/tn-shift-test-state.service";
import { TnShiftTestState } from "@model/tn-shift-test-state";
import { MatDialogRef } from "@angular/material/dialog";
import { TnShiftTestControl } from "@model/tn-shift-test-control";
import { OvicFlexibleTableNewColumn } from "@model/ovic-flexible-table-new";
import moment from "moment";
import { DropdownModule } from "primeng/dropdown";
import { TooltipModule } from "primeng/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { TnShiftStudentTest } from "@model/tn-shift-student-test";
import { TnShiftStudentTestService } from "@service/luyenthithpt/tn-shift-student-tests.service";
import { TableLoaderComponent } from "src/app/templates/table-loader/table-loader.component";
import { AppSocketEventControlName , } from "@service/socket/app-socket.service";
import { AssignExamShiftRolesComponent } from "./components/assign-exam-shift-roles/assign-exam-shift-roles.component";
import { TnShiftRoom } from "@model/tn-shift-room";
import { TnShiftRoomService } from "@service/luyenthithpt/tn-shift-room.service";

import { ImageModule } from 'primeng/image';
import { ViewShiftTestComponent } from "./components/view-shift-test/view-shift-test.component";

interface StatusSession {
	status : number;
	name : string;
}

interface ShiftExtend extends TnQLCathi {
	__index_table : number;
	__ongoing : number | null;
	__completed : number | null;
}

@Component( {
	selector    : "app-theo-doi-thi" ,
	templateUrl : "./theo-doi-thi.component.html" ,
	styleUrls   : [ "./theo-doi-thi.component.css" ] ,
	standalone  : true ,
	imports     : [
		CommonModule ,
		FormsModule ,
		ReactiveFormsModule ,
		PaginatorModule ,
		ButtonModule ,
		ProgressBarModule ,
		CheckboxModule ,
		NgbModule ,
		TableModule ,
		MatProgressBarModule ,
		MatCheckboxModule ,
		DropdownModule ,
		TooltipModule ,
		MatMenuModule ,
		TableLoaderComponent ,
		AssignExamShiftRolesComponent ,
		ImageModule ,
		ViewShiftTestComponent
	] ,
} )
export class TheoDoiThiComponent implements OnInit , OnDestroy {
	@ViewChild( "templateDisplayStudent" ) templateDisplayStudent : TemplateRef<any>;
	@ViewChild( "dialogAccessControl" ) dialogAccessControl : TemplateRef<any>;
	@ViewChild( "templateAssignShiftPermissions" ) templateAssignShiftPermissions : TemplateRef<any>;
	@ViewChild( "templateDisplayAvatar" ) templateDisplayAvatar : ElementRef;
	@ViewChild( "templateSelectedStudent" )
	templateSelectedStudent : TemplateRef<any>;
	@ViewChild( "templateNoteReason" ) templateNoteReason : ElementRef;
	@ViewChild( "templateInfoControl" ) templateInfoControl : ElementRef;
	@ViewChild( "templateVipham" ) templateVipham : TemplateRef<any>;
	@ViewChild( "templatePauseShiftTest" ) templatePauseShiftTest : TemplateRef<any>;
	@ViewChild( "templateViewShiftTest" ) templateViewShiftTest : TemplateRef<any>;
	@ViewChild( "templateChangePass" ) templateChangePass : ElementRef;
	
	styleShow = {
		grid  : true ,
		list  : false ,
		speak : false ,
	};
	isManager = false;
	
	dmCathi : ShiftExtend[];
	dmShiftTestCathi : TnStudent[];
	selectedStudentS : number[] = [];
	selectedCathi : ShiftExtend;
	dmShiftTestCathiFull : TnStudent[];
	filterStatus                = 1;
	roomSelected : TnShiftRoom;
	listRoom : TnShiftRoom[]    = [];
	typeResetPass : string;
	
	index        = 1;
	page         = 1;
	rows         = 15;
	recordsTotal = 0;
	
	titleForm : string;
	
	progressValue                   = 0;
	valueSearchStudent              = "";
	student_ids_searched : number[] = [];
	
	formScontrol : FormGroup;
	selectedStudent : TnShiftStudentTest;
	
	shiftTestId : number;
	isDeletedShiftTest                    = false;
	checkedForALl                         = false;
	seletedState : any;
	isStopTest                            = false;
	addTime                               = true;
	time_add : number;
	skillTestObject                       = SKILL_TEST_OBJECT;
	realTimeLoadOneStudent : any;
	dmShiftTestState : TnShiftTestState[] = [];
	isViolation                           = false;
	skillTestTotal                        = SKILL_TEST_TOTAL;
	updateViolation                       = false;
	idViolation : number;
	dmControl                             = [];
	cols : OvicFlexibleTableNewColumn[];
	
	// custom
	titleDialog : string;
	typeControl : AppSocketEventControlName;
	dmStudentSession : TnShiftStudentTest[] = [];
	selected_shiftestSession : TnShiftStudentTest;
	StatusSessions : StatusSession[] | undefined;
	recordsTotalStudentSession              = 0;
	pageStudentSession                      = 1;
	rowsStudentSession                      = 40;
	sort : "asc" | "desc"                   = "desc";
	selectedStatus : StatusSession          = {
		status : 1 ,
		name   : "Thí sinh đang thi" ,
	};
	
	private childialog : MatDialogRef<any> = null;
	
	// custom
	searchCathi : string = "";
	isLoading : boolean  = false;
	isAdmin : boolean    = false;
	
	statusShift : number = null;
	listStatusShiftLabel : {
		value : number;
		name : string;
	}[]                  = [
		{
			value : 1 ,
			name  : "Kích hoạt" ,
		} ,
		{
			value : 2 ,
			name  : "Đã thi xong" ,
		} ,
	];
	selectedStatusShift : {
		value : number;
		name : string;
	};
	
	private SocketControlState : Partial<Record<AppSocketEventControlName , ( event : AppSocketEventControlName ) => void>> = {
		continue  : this.handleEvent.bind( this ) ,
		pause     : this.handleEvent.bind( this ) ,
		reject    : this.handleEvent.bind( this ) ,
		submitted : this.handleEvent.bind( this ) ,
		violation : this.handleEvent.bind( this )
	};
	
	private handleEvent ( event : AppSocketEventControlName ) : void {
		if ( ! this.selected_shiftestSession.student ) {
			return this.notifi.toastError( "Không tìm thấy thí sinh" );
		}
		
		this.tnShiftTestControlService.controlShiftStudentTest( this.selected_shiftestSession.student.user_id , {
			title                 : "" ,
			shift_student_test_id : this.selected_shiftestSession.id
		} , event ).subscribe();
	}
	
	viewDetailStudentOpened : boolean = false;
	
	private inputChanged : Subject<string>                = new Subject<string>();
	private inputStudentSesstionChanged : Subject<string> = new Subject<string>();
	private destroy : Subject<string>                     = new Subject<string>();
	private destroyedViewShiftTest$                       = new Subject<void>();
	
	constructor (
		private auth : AuthService ,
		private helperService : HelperService ,
		private httpParamsHeplerService : HttpParamsHeplerService ,
		private tnQLCathiService : TnQLCathiService ,
		private tnShiftTestService : TnShiftTestService ,
		private tnShiftTestQuestionService : TnShiftTestQuestionService ,
		private tnShiftTestControlService : TnShiftTestControlService ,
		private tnStudentService : TnStudentService ,
		private tnFormDetailService : TnFormDetailService ,
		private tnShiftTestStateService : TnShiftTestStateService ,
		private notifi : NotificationService ,
		protected sanitizer : DomSanitizer ,
		private formBuilder : FormBuilder ,
		private modalService : NgbModal ,
		private tnShiftStudentTestService : TnShiftStudentTestService ,
		private tnShiftRoomService : TnShiftRoomService ,
	) {
		this.inputChanged.pipe( debounceTime( 1000 ) ).subscribe( ( searchString : string ) => {
			this.searchShiftContentByInput( searchString );
		} );
		
		this.inputStudentSesstionChanged.pipe( debounceTime( 1000 ) ).subscribe( ( searchString : string ) => {
			this.searchStudentSesstion( searchString );
		} );
		this.isManager    =
			this.auth.userHasRole( "manager" ) || this.auth.userHasRole( "hoidongcoithi" )
			? true
			: false;
		this.formScontrol = this.formBuilder.group( {
			value                 : [ "" , Validators.required ] ,
			shift_student_test_id : [ "" ] ,
			name                  : [ "" ] ,
			object                : [ "" ] ,
			note                  : [ "" , Validators.required ] ,
			state                 : [ "" ] ,
			skill                 : [ "" ] ,
		} );
		
		this.isAdmin = this.auth.userHasRole( "admin_luyenthi_thpt" );
		
		
	}
	
	ngOnInit () {
		this.loadCaThi();
		this.StatusSessions = [
			{ name : "Tất cả" , status : 3 } ,
			{ name : "Thí sinh đang thi" , status : 1 } ,
			{ name : "Thí sinh đã thi xong" , status : 2 } ,
			{ name : "Thí sinh chưa thi" , status : 0 } ,
			{ name : "Thí sinh bị cấm thi" , status : -1 } ,
		];
	}
	
	onSocketEvent () : void {
		/*this.auth.onSocketResponse().pipe( takeUntil( this.destroyedViewShiftTest$ ) ).subscribe( ( { name , data } ) => {
			const handleEvent : Record<AppSocketEventControlName , () => void> = {
				pause             : () => {
					console.log( 'pause event' );
					console.log( data );
					
					
					if ( ! data ) return;
					
					let indexStudentTest = this.dmStudentSession.findIndex(
						( item ) => item.id == parseInt( data.data.shift_student_test_id )
					);
					
					if ( indexStudentTest != -1 ) {
						this.dmStudentSession[ indexStudentTest ].status = 3;
					}
				} ,
				continue          : () => {
					console.log( 'continue event' );
					console.log( data );
					if ( ! data ) return;
					
					let indexStudentTest = this.dmStudentSession.findIndex(
						( item ) => item.id == parseInt( data.data.shift_student_test_id )
					);
					
					if ( indexStudentTest != -1 ) {
						this.dmStudentSession[ indexStudentTest ].status = 1;
					}
				} ,
				submitted         : () => {
					if ( ! data ) return;
					
					let indexStudentTest = this.dmStudentSession.findIndex(
						( item ) => item.id == parseInt( data.data.shift_student_test_id )
					);
					
					if ( indexStudentTest != -1 ) {
						this.dmStudentSession[ indexStudentTest ].status = 2;
					}
				} ,
				reject            : () => {
					if ( ! data ) return;
					
					let indexStudentTest = this.dmStudentSession.findIndex(
						( item ) => item.id == parseInt( data.data.shift_student_test_id )
					);
					
					if ( indexStudentTest != -1 ) {
						this.dmStudentSession[ indexStudentTest ].status = -1;
					}
				} ,
				violation         : () => {
				} ,
				photo_before_exam : () => {
				} ,
				photo_during_exam : () => {
				}
			};
			
			if ( handleEvent[ name ] ) {
				handleEvent[ name ]();
			}
		} );*/
	}
	
	
	get fS () {
		return this.formScontrol.controls;
	}
	
	loadCaThi () {
		// this.notifi.isProcessing(true);
		
		this.isLoading = true;
		this.tnQLCathiService
		.getTnQLCathiLimitByStatus(
			this.page ,
			this.searchCathi ,
			this.statusShift ,
			15
		)
		.subscribe( {
			next  : ( result : { recordsTotal : number; data : TnQLCathi[] } ) => {
				this.recordsTotal        = result.recordsTotal;
				let shift_ids : number[] = [];
				
				this.dmCathi = result.data.map( ( m , index ) => {
					shift_ids.push( m.id );
					
					// Tạo một đối tượng mở rộng với các thuộc tính mới
					const extendedItem : ShiftExtend = {
						... m ,
						__index_table : ( this.page - 1 ) * 10 + index + 1 ,
						__ongoing     : null ,
						__completed   : null ,
					};
					
					return extendedItem;
				} );
				
				this.isLoading = false;
				
				// Gọi loadCountTest để cập nhật dữ liệu ongoing và completed
				this.loadCountTest( shift_ids );
			} ,
			error : ( err ) => {
				console.error( err );
				this.isLoading = false;
			} ,
		} );
	}
	
	loadCountTest ( shift_ids : number[] ) {
		if ( ! shift_ids?.length ) return;
		this.tnShiftStudentTestService.getCountTest( shift_ids ).subscribe( {
			next  : ( res : any ) => {
				let shiftCountTestObj = {};
				if ( res?.data?.length > 0 ) {
					res.data.map( ( item ) => {
						shiftCountTestObj[ item.shift_id ] = item;
					} );
					
					// Check the length of the object (i.e., number of keys)
					if ( Object.keys( shiftCountTestObj ).length > 0 ) {
						this.dmCathi = this.dmCathi.map( ( item ) => {
							item.__completed = shiftCountTestObj[ item.id ][ "completed" ];
							
							item.__ongoing = shiftCountTestObj[ item.id ][ "ongoing" ];
							return item;
						} );
						
					}
				}
			} ,
			error : ( err : any ) => {
				console.error( err );
				
			} ,
		} );
	}
	
	paginate ( { page } : PaginatorState ) {
		this.page = page + 1;
		this.loadCaThi();
	}
	
	paginateStudent ( { page } : PaginatorState ) {
		this.pageStudentSession = page + 1;
		this.loadStudentSesstion();
	}
	
	async handleClickOnTable ( button : ButtonBase ) {
		if ( ! button ) {
			return;
		}
		this.selectedCathi =
			button.data && this.dmCathi
			? this.dmCathi.find( ( u ) => u.id === button.data )
			: null;
		switch ( button.name ) {
			case "BUTTON_REFRESH":
				break;
			
			case "EDIT_LIST_CANDIDATES":
				break;
			default:
				break;
		}
	}
	
	async setUpFormStudent ( shift : ShiftExtend ) : Promise<void> {
		this.onSocketEvent(); // listen event from socket
		this.roomSelected  = null;
		this.selectedCathi = shift;
		await this.loadRooms();
		
		
		let listTeacher = [];
		if ( this.selectedCathi.type_of_shift == 'IMPORT' ) {
			
			listTeacher = this.listRoom.reduce( ( acc : number[] , room ) => {
				try {
					const teacherIds = room?.teacher_ids ?
					                   JSON.parse( room.teacher_ids ) :
					                   [];
					
					return acc.concat( teacherIds );
				}
				catch ( error ) {
					console.error( error );
					
					return acc;
				}
				
				
			} , [] );
			
			if ( ! this.isAdmin ) {
				if ( ! listTeacher.includes( this.auth.user.id ) ) {
					this.notifi.toastWarning( "Bạn không được phân quyền theo dõi ca thi này 😔" , 'Thông báo' );
					return;
				}
			}
			
			
		}
		this.titleForm =
			"Danh sách sinh viên trong ca thi: " + this.selectedCathi.name;
		this.styleShow = {
			grid  : true ,
			list  : false ,
			speak : false ,
		};
		
		this.childialog = this.notifi.createDialog.open(
			this.templateDisplayStudent ,
			{
				width     : "100%" ,
				height    : "100%" ,
				maxWidth  : "100%" ,
				maxHeight : "100%" ,
			}
		);
		this.loadStudentSesstion();
	}
	
	async getCountStudentSession () : Promise<void> {
		try {
			const res                       = await firstValueFrom(
				this.tnShiftStudentTestService.getCountByCathiId( this.selectedCathi.id )
			);
			this.recordsTotalStudentSession = res.recordsTotal;
		}
		catch ( error ) {
			console.error( "Error in getCountStudentSession:" , error );
		}
	}
	
	async loadRooms () : Promise<void> {
		try {
			const res : TnShiftRoom[] = await firstValueFrom(
				this.tnShiftRoomService.getAllTnShiftRoomByShiftId( this.selectedCathi.id )
			);
			this.listRoom             = res || [];
		}
		catch ( error ) {
			console.error( "Error in loadRooms:" , error );
		}
	}
	
	
	async loadStudentSesstion () : Promise<void> {
		
		this.notifi.isProcessing( true );
		await this.getCountStudentSession();
		await this.loadRooms();
		if ( ! this.roomSelected ) {
			this.tnShiftStudentTestService
			.getLimitedByCaThiIdV2(
				this.pageStudentSession ,
				this.selectedCathi.id ,
				this.sort ,
				this.rowsStudentSession ,
				this.selectedStatus.status ,
				this.student_ids_searched
			)
			.pipe(
				switchMap(
					( res : { recordsTotal : number; data : TnShiftStudentTest[] } ) => {
						let shift_test_ids = res.data.map( ( item ) => item.shift_test_id );
						let student_ids    = res.data.map( ( item ) => item.student_id );
						student_ids        = [ ... new Set( student_ids ) ];
						
						return forkJoin( [
							this.tnStudentService.getStudentByIds( student_ids ) ,
							this.tnShiftTestService.getUnlimitedByIds( shift_test_ids ) ,
						] ).pipe(
							map( ( [ students , shiftTests ] ) => {
								students.data.forEach( ( student ) => {
									student[ "ngay_sinh_converted" ] = moment(
										student.ngaysinh
									).format( "DD/MM/YYYY" );
								} );
								
								res.data.forEach( ( item , index ) => {
									item[ "__index_table" ]        =
										( this.pageStudentSession - 1 ) * 10 + index + 1;
									item[ "avatar_temp" ]          = this.getRandomAvatar();
									item[ "student" ]              = students.data.find(
										( student ) => student.id === item.student_id
									);
									item[ "time_start_converted" ] = item.time_start
									                                 ? moment( item.time_start ).format( "HH:mm DD/MM/YYYY" )
									                                 : "_ _ _";
									item[ "time_end_converted" ]   = item.time_end
									                                 ? moment( item.time_end ).format( "HH:mm DD/MM/YYYY" )
									                                 : "_ _ _";
									
									item[ "shift_test" ] = shiftTests.data.find(
										( shiftTest ) => shiftTest.id === item.shift_test_id
									);
									// item['credentials_parse'] = JSON.parse(item['student_credentials'])
									try {
										item[ "credentials_parse" ] = JSON.parse(
											item[ "student_credentials" ]
										);
									}
									catch ( error ) {
										item[ "credentials_parse" ] = null; // Handle invalid JSON
									}
								} );
								
								return res;
							} )
						);
					}
				)
			)
			.subscribe( ( res ) => {
				this.dmStudentSession           = res.data;
				this.recordsTotalStudentSession = res.recordsTotal;
				
				this.notifi.isProcessing( false );
			} );
		}
		else {
			
			let student_ids : number[] = [];
			if ( this.student_ids_searched.length <= 0 ) {
				student_ids = JSON.parse( this.roomSelected.student_ids );
			}
			else {
				
				student_ids = this.roomSelected?.student_ids
				              ? this.student_ids_searched.filter( ( item ) =>
						JSON.parse( this.roomSelected.student_ids || '[]' ).includes( item )
					)
				              : [];
				
				
			}
			
			
			if ( student_ids.length > 0 ) {
				this.tnShiftStudentTestService.getLimitByStudentIdsV2( this.page , this.rowsStudentSession , student_ids , this.selectedCathi.id , this.selectedStatus.status , this.sort ).pipe(
					switchMap(
						( res : IctuPaginator<TnShiftStudentTest> ) => {
							let shift_test_ids = res.data.map( ( item ) => item.shift_test_id );
							let student_ids    = res.data.map( ( item ) => item.student_id );
							student_ids        = [ ... new Set( student_ids ) ];
							
							return forkJoin( [
								this.tnStudentService.getStudentByIds( student_ids ) ,
								this.tnShiftTestService.getUnlimitedByIds( shift_test_ids ) ,
							] ).pipe(
								map( ( [ students , shiftTests ] ) => {
									students.data.forEach( ( student ) => {
										student[ "ngay_sinh_converted" ] = moment(
											student.ngaysinh
										).format( "DD/MM/YYYY" );
									} );
									
									res.data.forEach( ( item , index ) => {
										item[ "__index_table" ]        =
											( this.pageStudentSession - 1 ) * 10 + index + 1;
										item[ "avatar_temp" ]          = this.getRandomAvatar();
										item[ "student" ]              = students.data.find(
											( student ) => student.id === item.student_id
										);
										item[ "time_start_converted" ] = item.time_start
										                                 ? moment( item.time_start ).format( "HH:mm DD/MM/YYYY" )
										                                 : "_ _ _";
										item[ "time_end_converted" ]   = item.time_end
										                                 ? moment( item.time_end ).format( "HH:mm DD/MM/YYYY" )
										                                 : "_ _ _";
										
										item[ "shift_test" ] = shiftTests.data.find(
											( shiftTest ) => shiftTest.id === item.shift_test_id
										);
										// item['credentials_parse'] = JSON.parse(item['student_credentials'])
										try {
											if ( item.student_credentials ) {
												item[ "credentials_parse" ] = JSON.parse(
													item[ "student_credentials" ]
												);
											}
											
										}
										catch ( error ) {
											item[ "credentials_parse" ] = null; // Handle invalid JSON
										}
									} );
									
									return res;
								} )
							);
						}
					)
				)
				.subscribe( ( res ) => {
					this.dmStudentSession           = res.data;
					this.recordsTotalStudentSession = res.totalRecords;
					
					this.notifi.isProcessing( false );
				} );
			}
			else {
				this.dmStudentSession           = [];
				this.recordsTotalStudentSession = 0;
				
				this.notifi.isProcessing( false );
			}
			
			
		}
		
		
	}
	
	handleSortStudentSession () : void {
		this.sort == "asc" ? ( this.sort = "desc" ) : ( this.sort = "asc" );
		this.loadStudentSesstion();
	}
	
	closeForm () {
		this.notifi.closeSideNavigationMenu();
	}
	
	closeDialogParent () {
		// Phát tín hiệu hủy lắng nghe
		this.destroyedViewShiftTest$.next();
		this.destroyedViewShiftTest$.complete(); // Hoàn tất Subject nếu không tái sử dụng
		
		this.dmShiftTestCathi = [];
		this.notifi.createDialog.closeAll();
		
		this.closeDialog();
	}
	
	closeDialog () {
		if ( this.childialog ) {
			this.childialog.close();
		}
	}
	
	closePopUpReason ( d ) {
		d( true );
		this.formScontrol.reset();
		this.isDeletedShiftTest = false;
		this.isStopTest         = false;
		this.addTime            = true;
		this.updateViolation    = false;
		this.isViolation        = false;
		this.checkedForALl      = false;
	}
	
	//action thí sinh
	
	showAvatar ( shiftElement : any ) {
		this.selectedStudent = shiftElement;
		this.modalService.open( this.templateDisplayAvatar );
	}
	
	pauseAndRedo ( type : string , item : TnShiftStudentTest ) {
		this.formScontrol.reset();
		if ( type == "pause" ) {
			this.pauseShiftTest( item );
		}
		else {
			this.redoStatus( item );
		}
	}
	
	pauseShiftTest ( event ) {
		this.titleDialog              = "Xử lý tạm dừng thi";
		this.typeControl              = "pause";
		this.selected_shiftestSession = event;
		this.fS[ "shift_student_test_id" ].setValue( event.id );
		this.fS[ "state" ].setValue( 0 );
		this.fS[ "name" ].setValue( "pause" );
		this.fS[ "value" ].setValue( 0 );
		this.checkedForALl = false;
		this.notifi.createDialog.open( this.templatePauseShiftTest , {
			width : "500px" ,
			id    : "pauseShiftTestDialog" ,
		} );
	}
	
	redoStatus ( event ) {
		this.formScontrol.reset();
		this.titleDialog              = "Xử lý tiếp tục thi";
		this.selected_shiftestSession = event;
		this.typeControl              = "continue";
		this.fS[ "shift_student_test_id" ].setValue( event.id );
		this.fS[ "state" ].setValue( 0 );
		this.fS[ "name" ].setValue( "continue" );
		this.fS[ "value" ].setValue( 0 );
		this.fS[ "note" ].setValue( "Cho phép sinh viên tiếp tục thi" );
		this.notifi.createDialog.open( this.templatePauseShiftTest , {
			width : "500px" ,
			id    : "pauseShiftTestDialog" ,
		} );
	}
	
	stopedTest ( event ) {
		this.formScontrol.reset();
		this.selected_shiftestSession = event;
		this.titleDialog              = "Xử lý nộp bài thi";
		this.typeControl              = "submitted";
		this.fS[ "shift_student_test_id" ].setValue( event.id );
		this.fS[ "state" ].setValue( 0 );
		this.fS[ "name" ].setValue( "submited" );
		this.fS[ "value" ].setValue( 0 );
		this.fS[ "note" ].setValue( "Hết giờ thi" );
		this.checkedForALl = false;
		this.notifi.createDialog.open( this.templatePauseShiftTest , {
			width : "500px" ,
			id    : "pauseShiftTestDialog" ,
		} );
	}
	
	rejectTest ( event ) {
		this.formScontrol.reset();
		this.selected_shiftestSession = event;
		this.titleDialog              = "Xử lý hủy bài thi";
		this.typeControl              = "reject";
		this.fS[ "shift_student_test_id" ].setValue( event.id );
		this.fS[ "state" ].setValue( 0 );
		this.fS[ "name" ].setValue( "reject" );
		this.fS[ "value" ].setValue( 0 );
		this.fS[ "note" ].setValue( "" );
		this.checkedForALl = false;
		this.notifi.createDialog.open( this.templatePauseShiftTest , {
			width : "500px" ,
			id    : "pauseShiftTestDialog" ,
		} );
	}
	
	submitControl ( type : AppSocketEventControlName ) : void {
		if ( ! this.formScontrol.valid ) {
			this.notifi.toastError( "Vui lòng nhập đầy đủ dữ liệu" );
			return;
		}
		switch ( type ) {
			case "pause":
				this.notifi.confirmV2( "Xác nhận tạm dừng thi" ).then( ( res ) => {
					if ( res ) {
						this.changeSessionStatus( 3 );
						this.saveControlV2();
						// handle socket to student
						this.SocketControlState[ type ]( type );
					}
				} );
				break;
			case "continue":
				this.notifi
				.confirmV2( "Xác nhận cho thí sinh tiếp tục thi" )
				.then( ( res ) => {
					if ( res ) {
						this.changeSessionStatus( 1 );
						this.saveControlV2();
						this.SocketControlState[ type ]( type );
					}
				} );
				
				break;
			
			case "submitted": // submit shifttest session
				this.notifi.confirmV2( "Xác nhận nộp bài của thí sinh" ).then( ( res ) => {
					if ( res ) {
						// this.changeSessionStatus(2);
						this.saveControlV2();
						this.SocketControlState[ type ]( type );
					}
				} );
				break;
			
			case "reject": // submit shifttest session
				this.notifi
				.confirmDelete( "Xác nhận hủy bài của thí sinh" )
				.then( ( res ) => {
					if ( res ) {
						this.changeSessionStatus( -1 );
						this.saveControlV2();
						this.SocketControlState[ type ]( type );
					}
				} );
				break;
		}
	}
	
	saveControlV2 () {
		this.tnShiftTestControlService
		.addTnShiftTestControl( this.formScontrol.value )
		.subscribe( ( res ) => {
			this.notifi.toastSuccess( "Đã thực hiện thành công" );
			this.closeDialogByName( "pauseShiftTestDialog" );
		} );
	}
	
	changeSessionStatus ( status : number ) : void {
		this.tnShiftStudentTestService
		.update( this.selected_shiftestSession.id , { status : status } )
		.subscribe( {
			next  : ( res ) => {
				this.loadStudentSesstion();
			} ,
			error : ( err ) => {
			} ,
		} );
	}
	
	onViewShiftTest ( object ) {
		this.selectedStudent         = object;
		this.viewDetailStudentOpened = true;
		this.titleDialog             = 'Thông tin thí sinh'
		this.notifi.createDialog.open( this.templateViewShiftTest , {
			width : '840px' ,
			id    : "viewStudent" ,
		} );
		// this.helperService.openRightSideNavigationMenu(this.templateSelectedStudent, OvicSideNavigationMenuSize.lg);
		// this.modalService.open(this.templateSelectedStudent, LARGE_MODAL_OPTIONS);
	}
	
	infoActionControl () {
		const conditionControl =
			      this.httpParamsHeplerService.paramsConditionBuilder( [
				      {
					      conditionName : "name" ,
					      condition     : IctuQueryCondition.equal ,
					      value         : "add-time" ,
				      } ,
				      {
					      conditionName : "shift_test_id" ,
					      condition     : IctuQueryCondition.equal ,
					      value         : this.selectedStudent.id.toString() ,
					      orWhere       : "and" ,
				      } ,
			      ] );
		this.tnShiftTestControlService
		.getTnShiftTestControlByCols( conditionControl )
		.subscribe( ( res ) => {
			const control = [];
			res.forEach( ( f , key ) => {
				f[ "skill" ]      = this.skillTestObject[ f.object.split( "|" )[ 0 ] ];
				f[ "part" ]       = f.object.split( "|" )[ 1 ].split( "," ).join( ", " );
				f[ "min" ]        = Number( f.value ) / 60;
				const date        = new Date( f[ "created_at" ] );
				f[ "actionTime" ] = date.toLocaleString( "en-GB" );
				control.push( f );
			} );
			this.dmControl = control;
			this.modalService.open( this.templateInfoControl , {
				centered : true ,
			} );
		} );
	}
	
	changeTimeAdd ( event ) {
		this.fS[ "value" ].setValue( event.target.value );
	}
	
	openReason ( addtime , object ) {
		this.addTime      = addtime;
		this.seletedState = object;
		const lastPart    = addtime ? object[ "part" ] : object[ "name" ];
		this.fS[ "shift_test_id" ].setValue( this.selectedStudent.id );
		this.fS[ "state" ].setValue( 0 );
		this.fS[ "object" ].setValue( object[ "skill" ] + "|" + lastPart );
		this.fS[ "name" ].setValue( "add-time" );
		this.fS[ "skill" ].setValue( object[ "skill" ] );
		this.checkedForALl = false;
		this.modalService.open( this.templateNoteReason , {
			centered : true ,
		} );
	}
	
	violation ( object ) {
		this.selectedStudent = object;
		this.isViolation     = true;
		this.fS[ "shift_student_test_id" ].setValue( this.selectedStudent.id );
		this.fS[ "state" ].setValue( 0 );
		this.changeSkillTotal( object );
		this.notifi.createDialog.open( this.templateVipham , {
			width : "500px" ,
			id    : "violationDialog" ,
		} );
	}
	
	closeDialogByName ( dialogName : string ) {
		this.viewDetailStudentOpened = false;
		const dialogRef              = this.notifi.createDialog.getDialogById( dialogName );
		if ( dialogRef ) {
			dialogRef.close();
		}
		else {
		}
	}
	
	editViolation ( data : TnShiftTestControl ) {
		this.idViolation = data.id;
		this.fS[ "value" ].setValue( data.value );
		this.fS[ "object" ].setValue( data.object );
		this.fS[ "note" ].setValue( data.note );
	}
	
	saveViolation () {
		this.fS[ "name" ].setValue( "violation" );
		// return;
		
		let violation = this.formScontrol.value;
		
		if (
			! violation.name ||
			! violation.note ||
			! violation.object ||
			! violation.value
		) {
			this.notifi.toastError( "Vui lòng nhập đầy đủ thông tin dữ liệu" );
			return;
		}
		
		if ( this.formScontrol.valid ) {
			this.notifi
			.confirmV2(
				"Bạn có chắc chắn thực hiện xử lý vi phạm không?" ,
				"Xác nhận hành động"
			)
			.then( ( a ) => {
				
				if ( a ) {
					if ( this.updateViolation ) {
						this.tnShiftTestControlService
						.updateTnShiftTestControl(
							this.idViolation ,
							this.formScontrol.value
						)
						.subscribe( ( res ) => {
							this.notifi.toastSuccess( "Đã cập nhật thành công" );
							this.closeDialogByName( "violationDialog" );
						} );
					}
					else {
						this.tnShiftTestControlService
						.addTnShiftTestControl( this.formScontrol.value )
						.subscribe( ( res ) => {
							this.notifi.toastSuccess( "Đã thực hiện thành công" );
							this.closeDialogByName( "violationDialog" );
						} );
					}
				}
				else {
					this.notifi.toastInfo( "Đã hủy thao tác" );
				}
			} );
		}
		else {
			this.notifi.toastWarning( "Lỗi nhập liệu" );
		}
	}
	
	loadState ( object ) {
		const condition = this.httpParamsHeplerService
		.paramsConditionBuilder( [
			{
				conditionName : "shift_test_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : object.id.toString() ,
			} ,
		] )
		.set( "select" , "answer" );
		forkJoin( [
			this.tnShiftTestStateService.getTnShiftTestStateByCol(
				"shift_test_id" ,
				object.id.toString()
			) ,
			this.tnShiftTestQuestionService.getTnShiftTestQuestionByCols( condition ) ,
		] ).subscribe( ( [ state , _question ] ) => {
			const tmpState = [];
			const progress = _question
			.filter( ( m ) => m.answer )
			.length.toString()
			.concat( "/" , _question.length.toString() );
			state.forEach( ( f , key ) => {
				const dataChild = [];
				// if (f.progress) {
				// const progressArr = f.progress.split("|");
				// const totalPart = progressArr[0].split(",");
				// const working = progressArr[1];
				// const done = progressArr[2].split(",");
				// totalPart.forEach((p, j) => {
				//     let flagWorking = working === p ? 2 : 1;// 1 là chưa làm, 2 là đăng làm, 3 là đã làm xong;
				//     flagWorking = done.findIndex(m => m === p) !== -1 || f.completed === 1 ? 3 : flagWorking;
				//     dataChild.push({ name: p, working: flagWorking, skill: f.skill });
				// })
				// f['child'] = dataChild;
				// f['part'] = progressArr[0];
				f[ "progress" ]          = progress;
				f[ "time_left_convert" ] = Math.floor( f.time_left / 60 );
				tmpState.push( f );
				// }
			} );
			this.dmShiftTestState       = tmpState;
			this.realTimeLoadOneStudent = setTimeout(
				() => this.loadState( this.selectedStudent ) ,
				15000
			);
		} );
	}
	
	trustHtml ( value ) {
		if ( value ) {
			return this.sanitizer.bypassSecurityTrustResourceUrl( value );
		}
		else {
			return "";
		}
	}
	
	changeSkillTotal ( event ) {
		this.formScontrol.reset();
		this.fS[ "shift_student_test_id" ].setValue( this.selectedStudent.id );
		this.fS[ "state" ].setValue( 0 );
		const conditionControl =
			      this.httpParamsHeplerService.paramsConditionBuilder( [
				      {
					      conditionName : "name" ,
					      condition     : IctuQueryCondition.equal ,
					      value         : "violation" ,
				      } ,
				      {
					      conditionName : "shift_student_test_id" ,
					      condition     : IctuQueryCondition.equal ,
					      value         : event.id ,
					      orWhere       : "and" ,
				      } ,
			      ] );
		this.tnShiftTestControlService
		.getTnShiftTestControlByCols( conditionControl )
		.subscribe( ( res ) => {
			if ( res && res.length ) {
				this.updateViolation = true;
				this.editViolation( res[ 0 ] );
			}
			else {
				this.updateViolation = false;
			}
		} );
	}
	
	setPointSpeak ( shift : TnShiftTest , rowIndex : number , event ) {
		if ( event ) {
			const index = this.dmShiftTestCathi.findIndex( ( i ) => i.id === shift.id );
			if ( index !== -1 ) {
				this.dmShiftTestCathi[ index ][ "pointSpeak" ] = event.target.value;
				if ( ! this.dmShiftTestCathi[ index ][ "newPoint" ] ) {
					this.dmShiftTestCathi[ index ][ "editPoint" ] = true;
				}
			}
		}
	}
	
	getRandomPassInt ( min , max ) {
		min = Math.ceil( min );
		max = Math.floor( max );
		return Math.floor( Math.random() * ( max - min ) + min ); //The maximum is exclusive and the minimum is
	                                                              // inclusive
	}
	
	// doneReset(count, length) {
	//   if (count === length) {
	//     this.startProgress = false;
	//     this.progressValue = 0;
	//     this.notifi.toastSuccess("Đổi mật khẩu thành công");
	//     this.loadStudentSesstion();
	//   }
	// }
	
	// saveNewPass() {
	//   // this.progressValue = 0;
	//   // this.startProgress = true;
	//   // let i = 0;
	
	//   if (this.typeResetPass === "random") {
	//     this.selectedStudentS.forEach((f, key) => {
	//       setTimeout(() => {
	//         const index = this.dmShiftTestCathi.findIndex((m) => m.email === f);
	//         if (index !== -1) {
	//           this.userService
	//             .updateUserByEmail(f, "email", {
	//               password: this.newPass.toString(),
	//             })
	//             .subscribe((res) => {
	//               // i = i + 1;
	//               // this.progressValue = i / this.selectedStudentS.length * 100;
	//               // this.doneReset(i, this.selectedStudentS.length);
	//               // this.loading = false;
	//             });
	//         } else {
	//           // i = i + 1;
	//           // this.progressValue = i / this.selectedStudentS.length * 100;
	//           // this.doneReset(i, this.selectedStudentS.length);
	//         }
	//       }, key * 100);
	//     });
	//   } else {
	//     this.selectedStudentS.forEach((f, key) => {
	//       setTimeout(() => {
	//         const index = this.dmShiftTestCathi.findIndex((m) => m.email === f);
	//         if (index !== -1) {
	//           const pass = this.dmShiftTestCathi[index][
	//             "ngaysinhConvert"
	//           ].replace(/\//g, "");
	//           this.userService
	//             .updateUserByEmail(f, "email", { password: pass })
	//             .subscribe((res) => {
	//               // i = i + 1;
	//               // this.progressValue = i / this.selectedStudentS.length * 100;
	//               // this.doneReset(i, this.selectedStudentS.length);
	//             });
	//         } else {
	//           // i = i + 1;
	//           // this.progressValue = i / this.selectedStudentS.length * 100;
	//           // this.doneReset(i, this.selectedStudentS.length);
	//         }
	//       }, key * 100);
	//     });
	//   }
	
	//   // this.helperService.confirmAction("Bản có chắc chắn thực hiện thao tác lưu mới mật khẩu không?").then(a => {
	//   //     if (a) {
	//   //         clearTimeout(this.timeRealLoadRoom);
	
	//   //     } else {
	//   //         this.helperService.toastInfo("Đã hủy thao tác")
	//   //     }
	//   // }, () => null)
	// }
	
	getRandomAvatar () : string {
		const randomIndex = Math.floor( Math.random() * 10 ) + 1;
		return `assets/images/client/avatar/avatar_${ randomIndex }.jpg`;
	}
	
	checkForAllStudent () {
		this.checkedForALl = ! this.checkedForALl;
	}
	
	async saveControl ( d ) {
		if ( this.formScontrol.valid ) {
			let confirm = "Thêm thời gian";
			if ( ! this.checkedForALl ) {
				if ( this.formScontrol.value[ "name" ] === "add-time" ) {
					if ( this.addTime ) {
						confirm =
							"Bạn có chắc chắn thêm thời gian " +
							this.formScontrol.value[ "value" ] +
							" phút cho bài thi " +
							this.skillTestObject[ this.seletedState[ "skill" ] ] +
							" vào bài kiểm tra của thí sinh " +
							this.selectedStudent[ "hoten" ] +
							" - SBD: " +
							this.selectedStudent[ "code" ] +
							" không?";
					}
					else {
						confirm =
							"Bạn có chắc chắn cho phép thí sinh " +
							this.selectedStudent[ "hoten" ] +
							" - SBD: " +
							this.selectedStudent[ "code" ] +
							" làm lại bài thi " +
							this.skillTestObject[ this.seletedState[ "skill" ] ] +
							": " +
							this.seletedState[ "name" ] +
							" trong khoảng thời gian " +
							this.formScontrol.value[ "value" ] +
							" phút?";
					}
				}
				else if ( this.formScontrol.value[ "name" ] === "reject" ) {
					confirm =
						"Bạn có chắc chắn muốn hủy bài thi của thí sinh: " +
						this.selectedStudent[ "hoten" ] +
						" - SBD: " +
						this.selectedStudent[ "code" ] +
						" không?";
				}
				else if ( this.formScontrol.value[ "name" ] === "stopped" ) {
					confirm =
						"Bạn có chắc chắn muốn nộp bài thi của thí sinh: " +
						this.selectedStudent[ "hoten" ] +
						" - SBD: " +
						this.selectedStudent[ "code" ] +
						" không?";
				}
				else if ( this.formScontrol.value[ "name" ] === "pause" ) {
					confirm =
						"Bạn có chắc chắn muốn tạm dừng bài thi của thí sinh: " +
						this.selectedStudent[ "hoten" ] +
						" - SBD: " +
						this.selectedStudent[ "code" ] +
						" không?";
				}
				else if ( this.formScontrol.value[ "name" ] === "continue" ) {
					confirm =
						"Bạn có chắc chắn muốn tiếp tục bài thi của thí sinh: " +
						this.selectedStudent[ "hoten" ] +
						" - SBD: " +
						this.selectedStudent[ "code" ] +
						" không?";
				}
				this.notifi.confirmDelete( confirm , "Xác nhận thao tác" ).then( ( a ) => {
					if ( a ) {
						this.formScontrol.value[ "value" ] =
							this.formScontrol.value[ "name" ] === "add-time"
							? this.formScontrol.value[ "value" ] * 60
							: 0;
						if (
							this.formScontrol.value[ "name" ] !== "reject" &&
							this.formScontrol.value[ "name" ] !== "stopped"
						) {
							forkJoin( [
								this.tnShiftTestControlService.addTnShiftTestControl(
									this.formScontrol.value
								) ,
								this.tnShiftTestService.updateTnShiftTest(
									this.selectedStudent.id ,
									{ status : 1 }
								) ,
							] ).subscribe(
								( res ) => {
									if ( this.formScontrol.value[ "name" ] === "add-time" ) {
										this.time_add = null;
										this.loadState( this.selectedStudent );
										this.closePopUpReason( d );
									}
									else {
										this.loadStudentSesstion();
										this.closePopUpReason( d );
									}
									this.notifi.toastSuccess( "Đã cập nhật thành công" );
								} ,
								() => this.notifi.toastError( "Đã cập nhật thất bại" )
							);
						}
						else if ( this.formScontrol.value[ "name" ] === "reject" ) {
							forkJoin( [
								this.tnShiftTestControlService.addTnShiftTestControl(
									this.formScontrol.value
								) ,
								this.tnShiftTestService.updateTnShiftTest( this.shiftTestId , {
									status : -1 ,
								} ) ,
							] ).subscribe( () => {
								this.loadStudentSesstion();
								this.closePopUpReason( d );
								this.notifi.toastSuccess( "Đã cập nhật thành công" );
							} );
						}
						else if ( this.formScontrol.value[ "name" ] === "stopped" ) {
							forkJoin( [
								this.tnShiftTestControlService.addTnShiftTestControl(
									this.formScontrol.value
								) ,
								this.tnShiftTestService.updateTnShiftTest( this.shiftTestId , {
									status : 2 ,
								} ) ,
							] ).subscribe( () => {
								this.loadStudentSesstion();
								this.closePopUpReason( d );
								this.closeForm();
								this.notifi.toastSuccess( "Đã cập nhật thành công" );
							} );
						}
					}
					else {
						this.notifi.toastInfo( "Thao tác đã bị hủy" );
					}
				} );
			}
			else {
				this.notifi
				.confirmDelete(
					"Bạn có chắc chắn muốn thêm thời gian cho tất cả thí sinh trong phòng thi không?" ,
					"Xác nhận thao tác"
				)
				.then( ( a ) => {
					if ( a ) {
						let i           = 0;
						const addObject = { ... this.formScontrol.value };
						
						this.progressValue = 0;
						this.closePopUpReason( d );
						this.closeForm();
						this.dmShiftTestCathiFull.forEach( ( f , key ) => {
							if ( f.status === 2 ) {
								setTimeout( () => {
									const newAddObject         = { ... addObject };
									newAddObject.shift_test_id = f.id;
									newAddObject.value         = addObject.value * 60;
									forkJoin( [
										this.tnShiftTestControlService.addTnShiftTestControl(
											newAddObject
										) ,
										this.tnShiftTestService.updateTnShiftTest( f.id , {
											status : 1 ,
										} ) ,
									] ).subscribe( () => {
										i                  = i + 1;
										this.progressValue =
											( i / this.dmShiftTestCathiFull.length ) * 100;
										if ( i === this.dmShiftTestCathiFull.length ) {
											this.progressValue = 0;
											this.notifi.toastSuccess( "Đã cập nhật thành công" );
											this.loadStudentSesstion();
										}
									} );
								} , 100 * key );
							}
							else {
								i                  = i + 1;
								this.progressValue =
									( i / this.dmShiftTestCathiFull.length ) * 100;
								if ( i === this.dmShiftTestCathiFull.length ) {
									this.progressValue = 0;
									this.notifi.toastSuccess( "Đã cập nhật thành công" );
									this.loadStudentSesstion();
								}
							}
						} );
					}
					else {
						this.notifi.toastInfo( "Tháo tác đã bị hủy" );
					}
				} );
			}
		}
		else {
			this.notifi.toastWarning( "Lỗi nhập liệu" );
		}
	}
	
	//action menu header
	exportPointAfterTest ( file : string ) {
		if ( this.dmShiftTestCathiFull.length ) {
			const shiftTest_id = [];
			this.dmShiftTestCathiFull.forEach( ( f ) => {
				shiftTest_id.push( f[ "id" ] );
			} );
			const condition = this.httpParamsHeplerService
			.paramsConditionBuilder( [
				{
					conditionName : "grading_teacher" ,
					condition     : IctuQueryCondition.notEqual ,
					value         : "-1" ,
					orWhere       : "and" ,
				} ,
			] )
			.set(
				"pluck" ,
				"id,shift_test_id,result,ordering,group_id,bank_question_id,skill"
			)
			.set( "include_by" , "shift_test_id" )
			.set( "include" , shiftTest_id.toString() );
			forkJoin( [
				this.tnFormDetailService.getTnFormDetailByCol(
					"form_id" ,
					this.selectedCathi.form_id
				) ,
				this.tnShiftTestQuestionService.getTnShiftTestQuestionByCols( condition ) ,
			] ).subscribe(
				( [ formInfo , res ] ) => {
					if ( res ) {
						const form       = formInfo[ 0 ];
						const exportData = this.dmShiftTestCathiFull.map( ( m ) => {
							m[ "computerPoint" ] = 0;
							formInfo.forEach( ( fdt , fdtKey ) => {
								const eachPartTrue = res.filter(
									( i ) =>
										i.shift_test_id === m.id &&
										i[ "ordering" ] === fdt.ordering &&
										i.result === 1
								);
								const questionNum  = res.filter(
									( i ) =>
										i.shift_test_id === m.id && i[ "ordering" ] === fdt.ordering
								);
								if ( questionNum.length ) {
									m[ "computerPoint" ] +=
										( fdt.last_point / questionNum.length ) * eachPartTrue.length;
								}
							} );
							m[ "newCode" ] = Number( m[ "code" ].replace( /\D/g , "" ) );
							return m;
						} );
						if ( file === "pdf" ) {
							// this.convertDataToExportPdf(this.helperService.sort(exportData, 'newCode'))
						}
						else if ( file === "excel" ) {
							// this.tnBankService.getTnBankByCol('id', formInfo[0].bank_id).subscribe(_bank => {
							//     this.tnBankService.getTnBankByCol('id', _bank[0].parent_id).subscribe(_bank_parent
							// => { this.convertDataToExportExcel(exportData, _bank_parent[0],
							// this.donviId.toString()); }) })
							// this.exportExcelTeamWriting(this.helperService.sort(exportData, 'newCode'), null, null)
						}
					}
				} ,
				() => this.notifi.toastError( "Lấy giữ liệu thất bại" )
			);
		}
	}
	
	resetPass () {
		if ( this.selectedStudentS && this.selectedStudentS.length ) {
			
			this.typeResetPass = "birtday";
			this.modalService.open( this.templateChangePass );
		}
		else {
			this.notifi.toastWarning( "Xin vui lòng chọn thí sinh" );
		}
	}
	
	requestTrueFalsePoint () {
		this.notifi.isProcessing( true );
		const observables = this.dmShiftTestCathiFull.map( ( f ) =>
			this.tnShiftTestQuestionService.tinhDiem( f.id )
		);
		forkJoin( observables ).subscribe( {
			next  : () => {
				this.notifi.toastSuccess( "Tổng hợp điểm thành công" );
				this.notifi.isProcessing( false );
			} ,
			error : () => {
				this.notifi.toastSuccess( "Lỗi kết nối" );
				this.notifi.isProcessing( false );
			} ,
		} );
	}
	
	filterStudent ( studentCheck : string ) {
		this.filterStatus     = -this.filterStatus;
		this.dmShiftTestCathi = this.helperService.sort(
			this.dmShiftTestCathi ,
			studentCheck ,
			this.filterStatus
		);
	}
	
	studentSessionStatusChange ( event : any ) {
		this.loadStudentSesstion();
	}
	
	roomStudentSessionChange () : void {
		this.loadStudentSesstion();
	}
	
	sortSBD ( value ) {
		this.dmShiftTestCathi = this.helperService.sort(
			this.dmShiftTestCathi ,
			"newCode"
		);
	}
	
	changeListStyle ( list : boolean , grid : boolean , speak : boolean ) {
		this.styleShow.list  = list;
		this.styleShow.grid  = grid;
		this.styleShow.speak = speak;
		this.loadStudentSesstion();
		// if (!speak) {
		// } else {
		//   clearTimeout(this.timeRealLoadRoom);
		// }
		// this.listStyle = flag;
		// this.notSpeakShow = speakShow;
	}
	
	searchShifTest ( event ) {
		this.valueSearchStudent = event.toLowerCase();
		this.dmShiftTestCathi   = [
			... this.dmShiftTestCathiFull.filter(
				( m ) =>
					m.hoten
					.concat( m.email , m.phone , m[ "ngaysinhConvert" ] , m[ "code" ] )
					.toLowerCase()
					.indexOf( event.toLowerCase() ) !== -1
			) ,
		];
	}
	
	onSearch ( event : any ) {
		this.searchCathi = event;
		this.loadCaThi();
	}
	
	changeStatusShift ( event : any ) {
		if ( this.selectedStatusShift ) {
			this.statusShift = this.selectedStatusShift.value;
		}
		else {
			this.statusShift = null;
		}
		
		this.loadCaThi();
	}
	
	onInputChange ( event : string ) {
		this.inputChanged.next( event );
	}
	
	searchShiftContentByInput ( text : string ) {
		this.page = 1;
		
		this.searchCathi = text.trim();
		
		this.loadCaThi();
	}
	
	onSearchStudentSesstions ( event : string ) {
		this.inputStudentSesstionChanged.next( event );
	}
	
	searchStudentSesstion ( search : string ) {
		this.tnStudentService.getUnLimitedStudentByNameOrCode( search ).subscribe( {
			next : ( res ) => {
				if ( res.data.length > 0 ) {
					this.pageStudentSession = 1;
					
					this.recordsTotalStudentSession = 0;
					this.student_ids_searched       = res.data.map( ( item ) => item.id );
					
					
					this.loadStudentSesstion()
				}
			}
		} )
	}
	
	ngOnDestroy () : void {
		setTimeout( () => {
			this.destroy.next( "closed" );
			this.destroy.complete();
		} , 1000 );
	}
	
	assignExamShiftRoles ( shift : ShiftExtend ) {
		this.selectedCathi = shift;
		
		this.notifi.openSideNavigationMenu( {
			name      : 'assignExamShiftRoles' ,
			template  : this.dialogAccessControl ,
			size      : 900 ,
			offsetTop : "0px" ,
		} );
	}
	
	addTimeExamShiftStudentTest ( shift_student_test : TnShiftStudentTest ) : void {
		console.log( shift_student_test );
		
	}
}
