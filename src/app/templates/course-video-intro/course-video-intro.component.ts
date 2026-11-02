import { AfterViewInit , Component , ElementRef , HostListener , Inject , OnInit , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlyrModule } from '@module/ngx-plyr/lib/plyr.module';
import * as Plyr from 'plyr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResizeVideoDirective } from '../../directives/resize-video.directive';

export interface CourseVideoIntroData {
	sources : Plyr.Source[];
	options? : Plyr.Options;
}

@Component( {
	selector    : 'app-course-video-intro' ,
	standalone  : true ,
	imports     : [ CommonModule , PlyrModule , ResizeVideoDirective ] ,
	templateUrl : './course-video-intro.component.html' ,
	styleUrls   : [ './course-video-intro.component.css' ]
} )
export class CourseVideoIntroComponent implements OnInit , AfterViewInit {

	@HostListener( 'window:resize' ) onResize() {
		this.resize();
	}

	@ViewChild( 'videoWrap' , { static : true } ) videoWrap : ElementRef<HTMLDivElement>;

	sources : Plyr.Source[];

	options : Plyr.Options;

	constructor( @Inject( MAT_DIALOG_DATA ) public data : CourseVideoIntroData ) {
		this.sources = data.sources;
		this.options = data.options ? Object.assign( { blankVideo : 'assets/videos/blank.mp4' } , data.options ) : { blankVideo : 'assets/videos/blank.mp4' };
	}

	ngOnInit() : void {

	}

	resize() {
		//default 1200x675
		if ( ( window.innerWidth - 30 ) <= 1200 || ( window.innerHeight - 30 ) <= 675 ) {
			if ( ( window.innerHeight - 30 ) >= ( window.innerWidth * 9 / 16 ) ) {
				this.videoWrap.nativeElement.style.width = ( window.innerWidth - 30 ) + 'px';
			} else {
				this.videoWrap.nativeElement.style.width = ( ( window.innerHeight - 30 ) * 16 / 9 ) + 'px';
			}
		} else {
			this.videoWrap.nativeElement.style.width = '1200px';
		}
	}

	ngAfterViewInit() : void {
		this.resize();
	}

}
