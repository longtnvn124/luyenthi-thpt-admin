import { Component , EventEmitter , inject , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , BankQuestionNodeModel , questionCreator } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { BankQuestionType } from "@model/bank-question";
import { Subject , takeUntil } from "rxjs";
import { SelectOptions } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import { NotificationService } from "@appNotification";
import { QuestionsService } from "@service/luyenthithpt/questions.service";
import { Helper } from "@utilities/helper";
import { tap } from "rxjs/operators";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { RippleModule } from "primeng/ripple";
import { SafeHtmlSinglePipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";
import { IctuMediaLoaderDirective } from "../../../../../directives/ictu-media-loader.directive";
import { QuestionGroupChildInputComponent } from "@pages/admin/bank/bank-question-types/question-group/question-group-child/question-group-child-input.component";
import { QuestionGroupChildRadioComponent } from "@pages/admin/bank/bank-question-types/question-group/question-group-child/question-group-child-radio.component";
import { QuestionGroupChildTrueFalseComponent } from "@pages/admin/bank/bank-question-types/question-group/question-group-child/question-group-child-true-false.component";

@Component( {
	selector    : 'app-question-group' ,
	standalone  : true ,
	imports     : [ CommonModule , ButtonModule , DropdownModule , InputTextModule , PaginatorModule , RippleModule , SafeHtmlSinglePipe , IctuMediaLoaderDirective , QuestionGroupChildInputComponent , QuestionGroupChildRadioComponent , QuestionGroupChildTrueFalseComponent , QuestionGroupChildInputComponent , QuestionGroupChildRadioComponent , QuestionGroupChildTrueFalseComponent ] ,
	templateUrl : './question-group.component.html' ,
	styleUrls   : [ './question-group.component.css' ]
} )
export class QuestionGroupComponent implements OnInit , OnDestroy , BankQuestionNodeModel {

	@Input( { required : true } ) question : WritableSignal<BankQuestionEditorNode>;

	@Input( { required : true } ) mode : BankQuestionChildComponentMode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	onDestroy$ : Subject<string> = new Subject();

	colOptions : SelectOptions<number>[] = [
		{ value : 1 , label : 'Hiển thị 1 câu hỏi / dòng' , disable : false } ,
		{ value : 2 , label : 'Hiển thị 2 câu hỏi / dòng' , disable : false }
	];

	private readonly notificationService : NotificationService = inject<NotificationService>( NotificationService );

	private readonly service : QuestionsService = inject<QuestionsService>( QuestionsService );

	ngOnInit () : void {
	}

	dataChanged () : void {
		this.question().children = Helper.arraySort<BankQuestionEditorNode>( this.question().children , "question_number" , 1 );
		this.markAsDirty.emit( this.question().type );
	}

	async deleteChildQuestion ( child : BankQuestionEditorNode , index : number ) : Promise<void> {
		const confirm : boolean = await this.notificationService.confirmDelete();
		if ( confirm ) {
			this.notificationService.isProcessing( true );
			if ( child.id ) {
				this.service.delete( child.id ).pipe(
					takeUntil( this.onDestroy$ ) ,
					tap( () : void => {
						this.question().children = this.question().children.filter( ( q : BankQuestionEditorNode ) : boolean => q.id !== child.id );
					} )
				).subscribe( {
					next  : () : void => {
						this.notificationService.isProcessing( false );
						this.notificationService.toastSuccess( 'Thao tác thành công' );
						this.dataChanged();
					} ,
					error : () : void => {
						this.notificationService.isProcessing( false );
						this.notificationService.toastError( 'Lỗi mất kết nối trong quá trình xóa dữ liệu.' );
					}
				} );
			}
			else {
				this.dataChanged();
				this.question().children = this.question().children.filter( ( _ : BankQuestionEditorNode , order : number ) : boolean => order !== index );
				setTimeout( () : void => {
					this.notificationService.isProcessing( false );
					this.notificationService.toastSuccess( 'Thao tác thành công' );
				} , 500 );
			}
		}
	}

	addNewMoreChild () : void {
		const parent : BankQuestionEditorNode   = this.question();
		const newChild : BankQuestionEditorNode = questionCreator[ parent.type ]( parent );
		if ( this.question().type === 'group-true-false' ) {
			newChild.options = [
				{ value : '1' , label : 'Đúng'},
				{ value : '0' , label : 'Sai'},
			]
		}
		this.question().children.push( newChild );
		this.dataChanged();
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroyed' );
		this.onDestroy$.complete();
	}
}
