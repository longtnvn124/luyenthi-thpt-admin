import { Component , ElementRef , OnInit } from '@angular/core';
import { applyInlineStyles } from "@utilities/helper";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { Router } from "@angular/router";
import { AuthService } from "@service/core/auth.service";

@Component( {
	selector    : 'app-content-none' ,
	templateUrl : './content-none.component.html' ,
	styleUrls   : [ './content-none.component.css' ] ,
	standalone  : true ,
	imports     : [
		ButtonModule ,
		RippleModule
	] ,
	host        : {
		'class' : 'app-content-none d-block w-100'
	}
} )
export default class ContentNoneComponent implements OnInit {

	constructor (
		private elementRef : ElementRef ,
		private auth : AuthService ,
		private router : Router
	) {
		applyInlineStyles( this.elementRef.nativeElement , {
			minHeight : 'var(--max-screen-height)' ,
			maxHeight : 'var(--max-screen-height)' ,
			height    : 'var(--max-screen-height)' ,
			overflowY : 'auto'
		} )
	}

	ngOnInit () : void {
	}

	btnGetToDashboard () : void {
		void this.router.navigate( [ 'admin/dashboard' ] );
	}

	btnLogout () : void {
		this.auth.logout();
	}
}
