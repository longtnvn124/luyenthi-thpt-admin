import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@theme/components/card/card.component';
import { FormControl , FormsModule , Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SharedModule } from '@sharedModule';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@service/core/auth.service';
import { NotificationService } from '@appNotification';

@Component( {
	selector    : 'app-forget-password' ,
	standalone  : true ,
	imports     : [ CommonModule , CardComponent , FormsModule , MatButtonModule , MatCheckboxModule , MatFormFieldModule , MatIconModule , MatInputModule , MatProgressBarModule , SharedModule , RouterLink ] ,
	templateUrl : './forget-password.component.html' ,
	styleUrls   : [ '../authentication.scss' , '../login/login.component.scss' , './forget-password.component.css' ]
} )
export default class ForgetPasswordComponent {

	loading : boolean = false;

	email : FormControl<string> = new FormControl( '' , [ Validators.required , Validators.email ] );

	sentSuccessful : boolean = false;

	constructor(
		private title : Title ,
		private auth : AuthService ,
		private notification : NotificationService
	) {
		this.title.setTitle( 'Yêu cầu cập nhật khẩu' );
	}

	getErrorMessage() : string {
		if ( this.email.hasError( 'required' ) ) {
			return 'Vui lòng nhập email của bạn';
		}
		return this.email.hasError( 'email' ) ? 'Email không đúng định dạng' : '';
	}

	submitData() {
		if ( !this.loading && this.email.valid && this.email.value ) {
			this.loading = true;
			this.auth.forgetPassword( this.email.value.trim() ).subscribe( {
				next  : () => {
					this.loading        = false;
					this.sentSuccessful = true;
				} ,
				error : () => {
					this.loading = false;
					this.notification.toastError( 'Mất kết nối với máy chủ' );
				}
			} );
		}
	}
}
