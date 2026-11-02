import { Component , OnDestroy , OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@theme/components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PaginatorModule } from 'primeng/paginator';
import { ActivatedRoute , Router , RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AbstractControl , FormBuilder , FormControl , FormGroup , ReactiveFormsModule , ValidationErrors , ValidatorFn , Validators } from '@angular/forms';
import { PasswordValidator } from '@utilities/validators';
import { Subject } from 'rxjs';
import { AuthService } from '@service/core/auth.service';
import { NotificationService } from '@appNotification';
import { Title } from '@angular/platform-browser';

const RePasswordValidator = ( control : AbstractControl ) : ValidationErrors | null => control.valid && control.parent?.get( 'password' ).valid ? control.parent.get( 'password' ).value.trim() === control.value.trim() ? null : { passwordAndRePasswordNotMatch : true } : null;

@Component( {
	selector    : 'app-reset-password' ,
	standalone  : true ,
	imports     : [ CommonModule , CardComponent , MatButtonModule , MatFormFieldModule , MatInputModule , MatProgressBarModule , PaginatorModule , RouterLink , MatIconModule , ReactiveFormsModule ] ,
	templateUrl : './reset-password.component.html' ,
	styleUrls   : [ '../authentication.scss' , '../login/login.component.scss' , './reset-password.component.css' ]
} )
export default class ResetPasswordComponent implements OnInit , OnDestroy {

	loading : boolean = false;

	hide : boolean = true;

	hideRePassword : boolean = true;

	protected form : FormGroup;

	private onDestroy$ : Subject<string> = new Subject<string>();

	protected tokenExpired : boolean = false;

	constructor(
		private title : Title ,
		private fb : FormBuilder ,
		private auth : AuthService ,
		private activatedRoute : ActivatedRoute ,
		private notification : NotificationService ,
		private router : Router
	) {
		this.form = this.fb.group( {
			token                 : [ '' , Validators.required ] ,
			password              : [ '' , [ Validators.required , PasswordValidator ] ] ,
			password_confirmation : [ '' , [ Validators.required , RePasswordValidator ] ]
		} );
	}

	ngOnInit() : void {
		this.title.setTitle( 'Cập nhật khẩu tài khoản' );
		if ( this.activatedRoute.snapshot.queryParamMap.has( 'token' ) && this.activatedRoute.snapshot.queryParamMap.get( 'token' ) ) {
			this.form.controls[ 'token' ].setValue( this.activatedRoute.snapshot.queryParamMap.get( 'token' ) );
		}
	}

	get password() : FormControl {
		return <FormControl<any>> this.form.controls[ 'password' ];
	}

	get rePassword() : FormControl {
		return <FormControl<any>> this.form.controls[ 'password_confirmation' ];
	}

	submitData() {
		if ( !this.loading && this.form.valid ) {
			this.loading = true;
			this.auth.resetPassword( this.form.value ).subscribe(
				{
					next  : () => {
						this.loading = false;
						this.router.navigateByUrl( '/login' ).then( () => this.notification.toastSuccess( 'Cập nhật mật khẩu mới thành công' ) );
					} ,
					error : ( res ) => {
						if ( res.error?.code === 'expired' ) {
							this.tokenExpired = true;
						}
						this.loading = false;
					}
				}
			);
		}
	}

	ngOnDestroy() : void {
		this.onDestroy$.next( '' );
		this.onDestroy$.complete();
	}
}
