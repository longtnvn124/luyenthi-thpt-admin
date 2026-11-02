// angular import
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { MenuCollapseComponent } from './menu-collapse/menu-collapse.component';
import { MenuGroupVerticalComponent } from './menu-group/menu-group.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { VerticalMenuComponent } from './vertical-menu.component';
import { SharedModule } from '@sharedModule';
import { SafeUrlPipe } from '../../../../pipes/safe-url.pipe';

@NgModule( {
	declarations : [ MenuCollapseComponent , MenuGroupVerticalComponent , MenuItemComponent , VerticalMenuComponent ] ,
	imports : [ CommonModule , RouterModule , SharedModule , SafeUrlPipe ] ,
	exports      : [ VerticalMenuComponent ]
} )
export class VerticalMenuModule {}
