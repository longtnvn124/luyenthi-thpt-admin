import { Component , EventEmitter , Input , numberAttribute , OnDestroy , OnInit , Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Curriculum , Lesson } from '@model/lesson';
import { LessonsService } from '@service/lessons.service';
import { AuthService } from '@service/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CourseCurriculumPreviewComponent } from '../course-curriculum-preview/course-curriculum-preview.component';

@Component( {
	selector    : 'app-course-curriculum' ,
	standalone  : true ,
	imports     : [ CommonModule ] ,
	templateUrl : './course-curriculum.component.html' ,
	styleUrls   : [ './course-curriculum.component.css' ]
} )
export class CourseCurriculumComponent implements OnInit , OnDestroy {

	@Input( { required : true , alias : 'course-id' , transform : numberAttribute } ) courseId : number;

	@Input() lessons : Curriculum[];

	@Output() onLoadLessons : EventEmitter<Curriculum[]> = new EventEmitter<Curriculum[]>();

	loading : boolean = true;

	error : boolean = false;

	data : Curriculum[];

	isOwner : boolean = false;

	constructor(
		private auth : AuthService ,
		private router : Router ,
		private lessonsService : LessonsService ,
		private dialog : MatDialog
	) {}

	ngOnInit() : void {
		this.isOwner = this.auth.isAuthenticated && this.auth.courseIdSet.size && this.auth.courseIdSet.has( this.courseId );
		if ( !this.lessons ) {
			this.loadData();
		} else {
			this.data    = this.lessons;
			this.loading = false;
		}
	}

	loadData() {
		if ( this.courseId ) {
			this.loading = true;
			this.error   = false;
			this.lessonsService.listCurriculum( this.courseId ).subscribe( {
				next  : lessons => {
					this.data = this.orderLessons( lessons );
					this.onLoadLessons.emit( this.data );
					this.loading = false;
				} ,
				error : () => {
					this.error   = true;
					this.loading = false;
				}
			} );
		}
	}

	private orderLessons( lessons : Lesson[] ) : Lesson[] {
		return lessons.reduce( ( reducer , lesson ) => {
			if ( lesson.parent_id === 0 ) {
				lesson[ 'child' ] = lessons.filter( child => child.parent_id === lesson.id ).sort( ( a , b ) => a.ordering - b.ordering );
				reducer.push( lesson );
			}
			return reducer;
		} , new Array<Lesson>() ).sort( ( a , b ) => a.ordering - b.ordering );
	}

	openLesson( curriculum : Curriculum ) {
		if ( this.isOwner ) {
			void this.router.navigate( [ 'learning/course' , this.courseId ] , { queryParams : { lesson_id : curriculum.id } } );
		} else {
			if ( curriculum.trailer ) {
				this.dialog.open( CourseCurriculumPreviewComponent , {
					data       : { courseId : this.courseId , lessonId : curriculum.id } ,
					panelClass : [ 'theme-mat-dialog-circle' , 'cdk-overlay-pane--max-100vw' ]
				} );
			}
		}
	}

	showPreview( event : Event , curriculum : Curriculum ) : void {
		event.preventDefault();
		this.openLesson( curriculum );
	}

	ngOnDestroy() : void {
	}
}
