import { Component , computed , inject , OnDestroy , OnInit , Signal , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from "primeng/inputtext";
import { SharedModule } from "@sharedModule";
import { DialogModule } from "primeng/dialog";
import { ComponentStateExtend } from "@model/commons";
import { ShiftRegisterTestService } from "@service/luyenthithpt/shift-register-test.service";
import { map , merge , Subject , takeUntil } from "rxjs";
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { AuthService } from "@service/core/auth.service";
import { ShiftRegisterTest } from "@model/shift-register-test";
import { Router } from "@angular/router";

interface TeacherAssignmentCheckInfo {
	label : string;
	disabled : boolean;
}

export type ShiftRegisterTestPicks = Pick<ShiftRegisterTest , 'id' | 'shift_register_id' | 'status' | 'score' | 'teacher_id' | 'hand_score' | 'question_ids'>

@Component( {
	selector    : 'app-cham-thi' ,
	standalone  : true ,
	imports     : [ CommonModule , InputTextModule , SharedModule , DialogModule ] ,
	templateUrl : './cham-thi.component.html' ,
	styleUrls   : [ './cham-thi.component.css' ]
} )
export class ChamThiComponent implements OnInit , OnDestroy {

	private readonly shiftRegisterTestService : ShiftRegisterTestService = inject( ShiftRegisterTestService );

	private readonly auth : AuthService = inject( AuthService );

	private readonly router : Router = inject( Router );

	private readonly _destroy$ : Subject<void> = new Subject<void>();

	private readonly _loadObserver$ : Subject<void> = new Subject<void>();

	readonly state : WritableSignal<ComponentStateExtend> = signal<ComponentStateExtend>( 'loading' );

	readonly listTests : WritableSignal<ShiftRegisterTestPicks[]> = signal<ShiftRegisterTestPicks[]>( [] );

	readonly checkResult : Signal<TeacherAssignmentCheckInfo> = computed( () : TeacherAssignmentCheckInfo => {
		return {
			label    : `Bạn có ${ this.listTests().length } bài cần chấm` ,
			disabled : this.listTests().length === 0
		}
	} );

	ngOnInit () : void {
		this.loadTestAssignments();
	}

	private loadTestAssignments () : void {
		this._loadObserver$.next();
		this.state.set( 'loading' );
		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'status' ,
				condition     : IctuQueryCondition.equal ,
				value         : '3'
			} ,
			{
				conditionName : 'teacher_id' ,
				condition     : IctuQueryCondition.equal ,
				value         : this.auth.teacher.id.toString( 10 ) ,
				orWhere       : "and"
			}
		];
		const queryParams : IctuQueryParams     = {
			limit  : -1 ,
			paged  : 1 ,
			select : 'id,shift_register_id,score,teacher_id,status'
		};
		this.shiftRegisterTestService.query( conditions , queryParams ).pipe(
			takeUntil( merge( this._loadObserver$ , this._destroy$ ) ) ,
			map( ( response : DtoObject<ShiftRegisterTest[]> ) : ShiftRegisterTestPicks[] => response.data.length ? response.data : [] )
		).subscribe( {
			next  : ( tests : ShiftRegisterTestPicks[] ) : void => {
				this.listTests.set( tests );
				this.state.set( tests.length ? 'success' : 'empty' );
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} );
	}

	startScoring () : void {
		if ( ! this.checkResult().disabled ) {
			this.state.set( 'loading' );
			try {
				void this.router.navigateByUrl( 'grading-assignment' );
			}
			catch ( _ ) {
				this.state.set( 'error' );
			}
		}
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadTestAssignments();
	}

	ngOnDestroy () : void {
		this._destroy$.next();
		this._destroy$.complete();
	}

}
