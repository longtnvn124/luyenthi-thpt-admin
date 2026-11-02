import { Component , OnDestroy , OnInit } from '@angular/core';
import { AbstractControl , FormBuilder , FormControl , FormGroup , ValidationErrors , Validators } from '@angular/forms';
import { UserService } from '@service/core/user.service';
import { AuthService } from '@service/core/auth.service';
import { firstValueFrom , Subject } from 'rxjs';
import { NotificationService } from '@appNotification';
import { Button , ButtonBase } from '@model/button';
import { PasswordValidator, ReactivePasswordValidator } from '@utilities/validators';

interface PasswordField {
	hide : boolean,
	field : FormControl<string | null>
}

interface FormPasswordStructure {
	password : FormControl<string | null>,
	confirm_password : FormControl<string | null>
}

const RePasswordValidator = ( control : AbstractControl ) : ValidationErrors | null => control.valid && control.parent?.get( 'password' ).valid ? control.parent.get( 'password' ).value.trim() === control.value.trim() ? null : { passwordAndRePasswordNotMatch : true } : null;
@Component( {
	selector    : 'app-password' ,
	templateUrl : './password.component.html' ,
	styleUrls   : [ './password.component.css' ]
} )
export class PasswordComponent implements OnInit , OnDestroy {

	protected loading : boolean = false;

	protected password : PasswordField = {
		hide  : true ,
		field : new FormControl<string>( '' , [ Validators.required , ReactivePasswordValidator ] )
	};

	protected confirmPassword : PasswordField = {
		hide  : true ,
		field : new FormControl<string>( '' , [ Validators.required , RePasswordValidator ] )
	};

	protected formGroup : FormGroup<FormPasswordStructure>;

	protected readonly $destroy : Subject<string> = new Subject<string>();

	constructor(
		private authService : AuthService ,
		private userService : UserService ,
		private notificationService : NotificationService ,
		private fb : FormBuilder
	) {
		this.formGroup = this.fb.group<FormPasswordStructure>( {
			password         : this.password.field ,
			confirm_password : this.confirmPassword.field
		} );
		this.formGroup.controls.confirm_password.setValidators( ( control : AbstractControl ) : ValidationErrors | null => {
			let words_wrong : string = '';
			if ( control.value && control.parent?.get( 'password' )?.invalid ) {
				words_wrong = 'Vui lòng xác thực mật khẩu trước!';
			} else if ( control.parent?.get( 'password' )?.value !== control.value ) {
				words_wrong = 'Trường mật khẩu và trường xác nhận mật khẩu chưa trùng khớp!';
			}
			return words_wrong ? { words_wrong } : null;
		} );
	}

	getConfirmPasswordError() : string {
		if ( this.confirmPassword.field.hasError( 'words_wrong' ) ) {
			return this.confirmPassword.field.getError( 'words_wrong' ) || '';
		} else {
			return '';
		}
	}

	ngOnInit() : void {
	}

	ngOnDestroy() : void {
		this.$destroy.next( '' );
		this.$destroy.complete();
	}

	async submit() : Promise<void> {
		const BUTTON_YES : Button = {
			name  : 'yes' ,
			label : 'Có' ,
			icon  : 'ti ti-check' ,
			class : 'p-button-rounded'
		};

		const BUTTON_CLOSE : Button = {
			name  : 'no' ,
			label : 'Không' ,
			icon  : 'ti-x ti' ,
			class : 'p-button-danger p-button-rounded'
		};
		const confirm : ButtonBase  = await firstValueFrom<ButtonBase>( this.notificationService.confirm( {
			heading : 'Xác nhận' ,
			message : 'Bạn có chắc chắn muốn cập nhật mật khẩu không?' ,
			buttons : [ BUTTON_CLOSE , BUTTON_YES ]
		} ) );

		if ( confirm.name === 'yes' ) {
			this.loading               = true;
			const newPassword : string = this.password.field.value as string;
			this.userService.update( { password : newPassword.trim() } ).subscribe( {
				next  : () => {
					this.loading = false;
					this.notificationService.toastSuccess( 'Cập nhật mật khẩu thành công' );
					this.formGroup.reset( {
						password         : '' ,
						confirm_password : ''
					} );
				} ,
				error : () => {
					this.loading = false;
					this.notificationService.toastError( 'Cập nhật mật khẩu thất bại' );
				}
			} );
		}
	}
}