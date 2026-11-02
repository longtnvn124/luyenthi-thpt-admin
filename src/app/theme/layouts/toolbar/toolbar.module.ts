import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './toolbar.component';
import { NavLeftComponent } from './toolbar-left/toolbar-left.component';
import { NavRightComponent } from './toolbar-right/toolbar-right.component';
import { SharedModule } from '@sharedModule';
import { RouterLink , RouterLinkActive } from '@angular/router';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { LoadingProgressBarComponent } from '../../../templates/loading-progress-bar/loading-progress-bar.component';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { EqualScrollbarBodyHeightDirective } from '../../../directives/equal-scrollbar-body-height.directive';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { LoadCourseThumbnailDirective } from '../../../directives/load-course-thumbnail.directive';
import { DropdownModule } from 'primeng/dropdown';

@NgModule( {
	declarations : [ NavBarComponent , NavLeftComponent , NavRightComponent ] ,
	imports      : [ CommonModule , SharedModule , RouterLinkActive , RouterLink , SafeUrlPipe , LoadingProgressBarComponent , ButtonModule , RippleModule , EqualScrollbarBodyHeightDirective , SafeHtmlPipe , LoadCourseThumbnailDirective , DropdownModule ] ,
	exports      : [ NavBarComponent , LoadingProgressBarComponent ]
} )
export class NavBarModule {
}

