import { Component , Input , OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { Course } from '@model/course';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

interface CourseProgressData {
	index : number;
	course : Course;
}

@Component( {
	selector    : 'app-course-progress' ,
	standalone  : true ,
	imports     : [ CommonModule , SafeHtmlPipe , ButtonModule , RippleModule ] ,
	templateUrl : './course-progress.component.html' ,
	styleUrls   : [ './course-progress.component.css' ]
} )
export class CourseProgressComponent implements OnDestroy {

	@Input( { required : true } ) set data( info : CourseProgressData ) {
		if ( info ) {
			this.loadData( info );
		}
	}

	protected index : number;

	protected course : Course;

	protected state : 'loading' | 'success' | 'error' = 'loading';

	private onDestroy$ : Subject<void> = new Subject<void>();

	protected dateStart : string = '';

	protected tplState : string = '<span style="--bs-badge-padding-x:10px;--bs-badge-padding-y:10px;--bs-badge-font-size:13px;--bs-badge-font-weight:400;" class="badge bg-light-primary w-100">Đang học</span>';

	// order[ '_preset_status' ]     = order.status === 1 ? '<span style="--bs-badge-padding-x:10px;--bs-badge-padding-y:10px;--bs-badge-font-size:13px;--bs-badge-font-weight:400;" class="badge bg-light-success w-100">Đã thanh toán</span>' : '<span style="--bs-badge-padding-x:10px;--bs-badge-padding-y:10px;--bs-badge-font-size:13px;--bs-badge-font-weight:400;" class="badge bg-light-danger w-100">Chưa thanh toán</span>';
	// assets/images/placeholder-368x206.svg

	protected progress : number = 0;

	constructor() {}

	private loadData( info : CourseProgressData ) {
		this.index        = info.index;
		this.course       = info.course;
		this.state        = 'loading';
		const date : Date = new Date( info.course.created_at );
		this.dateStart    = [ date.getDate().toString( 10 ).padStart( 2 , '0' ) , ( date.getMonth() + 1 ).toString( 10 ).padStart( 2 , '0' ) , date.getFullYear().toString( 10 ) ].join( '/' );
		setTimeout( () => this.state = 'error' , 3000 );
	}

	btnReload() {}

	ngOnDestroy() : void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

}
