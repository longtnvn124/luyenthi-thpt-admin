import { Component , OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '@service/core/auth.service';
import { ActivatedRoute , Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component( {
	selector    : 'app-unauthorized' ,
	standalone  : true ,
	imports     : [ CommonModule , ButtonModule , RippleModule , MatProgressBarModule ] ,
	templateUrl : './unauthorized.component.html' ,
	styleUrls   : [ './unauthorized.component.css' ]
} )
export default class UnauthorizedComponent implements OnInit {

	state : 'loading' | 'show' = 'loading';

	constructor(
		private auth : AuthService ,
		private router : Router ,
		private activatedRoute : ActivatedRoute
	) {}

	ngOnInit() : void {
		const strTime : string    = this.activatedRoute.snapshot.queryParamMap.has( 'time' ) ? this.activatedRoute.snapshot.queryParamMap.get( 'time' ) : '';
		const numberTime : number = strTime ? parseInt( strTime , 10 ) : NaN;
		const dateNow : number    = Date.now();
		const offsetTime : number = !Number.isNaN( numberTime ) ? Math.max( dateNow - ( numberTime - 1 ) , 0 ) : 0;
		if ( offsetTime > 0 && ( offsetTime / 60000 ) < 2 ) {
			this.state = 'show';
		} else {
			setTimeout( () => this.router.navigate( [ 'login' ] ) , 1000 );
		}
	}

	logout() {
		this.auth.logout();
		void this.router.navigate( [ 'login' ] );
	}

}
