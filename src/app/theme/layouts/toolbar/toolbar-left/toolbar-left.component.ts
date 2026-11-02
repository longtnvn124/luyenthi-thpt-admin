// angular import
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LayoutService } from '@theme/services/layout.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, NavigationEnd, Route, Router, Routes } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '@service/core/auth.service';

@Component({
	selector: 'app-nav-left',
	templateUrl: './toolbar-left.component.html',
	styleUrls: ['./toolbar-left.component.scss']
})
export class NavLeftComponent implements OnInit, OnDestroy {

	private onDestroy$: Subject<string> = new Subject<string>();

	featureName: string = '';

	// @ViewChild( MatMenuTrigger ) trigger : MatMenuTrigger;

	// constructor
	constructor(
		private layoutService: LayoutService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private auth: AuthService,

	) {
		const _routes: Routes = this.activatedRoute.routeConfig.children;
		this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntil(this.onDestroy$)).subscribe((event: NavigationEnd) => {
			const pathActive: string = event.urlAfterRedirects.split('?')[0].split(';')[0].replace('dashboard', '').replace(/\//g, '');
			const routeActive: Route = _routes.find(r => r.path == 'dashboard')['_loadedRoutes']?.find(r => r.path == pathActive);
			
			
			const activeLink = event.url.substring(7).split('?')[0];
			//new featureName
			
			const useCase = this.auth.getUseCase(activeLink);
			// this.featureName = routeActive?.data['title'] || 'Bảng điều khiển';
			this.featureName = useCase ? useCase.title : 'Bảng điều khiển' ;
		});

	}

	// public method
	toggleMenu() {
		this.layoutService.toggleSideDrawer();
	}

	ngOnDestroy(): void {
		this.onDestroy$.next('');
		this.onDestroy$.complete();
	}

	ngOnInit(): void {
		
	}

	// search( event : Event ) {
	// 	if ( event.target[ 'value' ] && event.target[ 'value' ].trim() ) {
	// 		this.layoutService.onSearch$.next( event.target[ 'value' ].trim() );
	// 		// event.target[ 'value' ] = '';
	// 		setTimeout( () => this.trigger.closeMenu() , 100 );
	// 	}
	// }


}
