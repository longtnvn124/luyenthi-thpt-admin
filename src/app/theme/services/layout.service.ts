import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LayoutService {

	// theme menu sidebar show and hide
	layoutState: Subject<boolean> = new Subject<boolean>();

	// theme component page  menu sidebar show and hide
	componentState: Subject<boolean> = new Subject<boolean>();

	drawerOpen: boolean = false;

	componentDrawerOpen: boolean = false;

	toggleSideDrawer(): void {
		this.layoutState.next(!this.drawerOpen);
	}

	toggleMenuSide(): void {
		this.componentState.next(!this.componentDrawerOpen);
	}

	onBlockActionsChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	onSearch$: Subject<string> = new Subject<string>();

	blockAction(block: boolean) {
		this.onBlockActionsChanges$.next(block);
	}
}
