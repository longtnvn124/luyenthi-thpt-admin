import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, EmailValidator, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PersonalInfo, Student, User, UserUpdatableFields } from '@model/user';
import { AuthService } from '@service/core/auth.service';
import { UserService } from '@service/core/user.service';
import { LayoutService } from '@theme/services/layout.service';
import { NotificationService } from '@theme/services/notification.service';
import { DDMMYYYYDateFormatValidator, PhoneNumberValidator } from '@utilities/validators';
import { Subject, debounceTime, firstValueFrom, forkJoin, switchMap, takeUntil } from 'rxjs';
import { ImageResizerComponent, ImageResizerConfig, ImageResizerDto } from 'src/app/templates/image-resizer/image-resizer.component';

type FormName = 'FORM_ACCOUNT';

interface FormHandlerDto {
	name: FormName,
	value: any
}
@Component({
	selector: 'app-thong-tin-tai-khoan',
	templateUrl: './thong-tin-tai-khoan.component.html',
	styleUrls: ['./thong-tin-tai-khoan.component.css']
})
export class ThongTinTaiKhoanComponent implements OnInit {

	private dialog: MatDialog = inject(MatDialog);

	avatar: string = 'assets/images/user/avatar-2.jpg';

	displayName: string = '';

	destroy$: Subject<string> = new Subject<string>();

	observerFileChooser$: Subject<string> = new Subject<string>();

	loading: boolean = false;

	formAccount: FormGroup;

	get fAccount(): { [key: string]: AbstractControl } {
		return this.formAccount.controls;
	}

	socialForm: FormGroup;

	private formHandler: Record<FormName, (value: any) => any> = {
		FORM_ACCOUNT: (value: any) => {
			const newUserInfo: Partial<UserUpdatableFields> = {
				display_name: value.display_name || this.auth.user.display_name,
				phone: value.phone || this.auth.user.phone,
				email: value.email || this.auth.user.email
			};
			const newStudentInfo: Partial<Student> = {
				full_name: newUserInfo.display_name,
				full_name_slug: this.auth.helper.sanitizeVietnameseTitle(newUserInfo.display_name),
				name: newUserInfo.display_name.trim().split(' ').pop().trim(),
				email: newUserInfo.email
			};

			this.userService.updateUserInfo(this.auth.user.id, newUserInfo).subscribe({
				next: (data) => {
					// this.auth.setNewUser(data);
					this.loading = false;
					this.notification.toastSuccess('Cập nhật thành công');
				}
			})

			// this.userService.update( newUserInfo ).subscribe({
			// 	next: (user) => {

			// 		this.auth.setNewUser(user);
			// 		this.loading = false;
			// 		this.notification.toastSuccess( 'Cập nhật thành công' );
			// 	},
			// 	error : () => this.loading = false
			// } );
		},
	};

	private formReset: Record<FormName, () => any> = {
		FORM_ACCOUNT: () => {
			this.formAccount.reset({

				username: {
					value: this.auth.user.username,
					disabled: true
				},
				display_name: this.auth.user.display_name,
				phone: this.auth.user.phone,
				email: this.auth.user.email
			},
				{
					onlySelf: true,
					emitEvent: false
				}
			);
		}
	};

	private observerUploadForm$: Subject<FormHandlerDto> = new Subject<FormHandlerDto>();

	constructor(
		private auth: AuthService,
		private router: Router,
		private layout: LayoutService,
		private notification: NotificationService,
		private userService: UserService,
		private fb: FormBuilder,
	) {

		this.formAccount = fb.group({
			username: [''],
			display_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
			phone: ['', [Validators.required, PhoneNumberValidator]],
			email: ['', [Validators.required]],
			// ho_va_ten: ['', [Validators.required]],
			// ten_lienhe: ['', [Validators.required]],
			// sdt_lienhe: ['', [Validators.required]],
			// stk_canhan: ['', [Validators.required]],
		});
		this.observerUploadForm$.asObservable().pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe(({ name, value }: FormHandlerDto) => this.formHandler[name](value));
	}

	ngOnInit(): void {
		this.auth.onUserSetup.pipe(takeUntil(this.destroy$)).subscribe((user: User) => {
			
			this.avatar = user.avatar;
			this.displayName = user.display_name;
			// this.formAccount.reset({
			// 	username: { 
			// 		value: user.username, 
			// 		// disabled: true 
			// 	},
			// 	display_name: user.display_name,
			// },
			// 	{
			// 		onlySelf: true,
			// 		emitEvent: false
			// 	}
			// );
			this.refreshForm('FORM_ACCOUNT')
		})
		let user1 = this.auth.user;
		
	}

	private callFileChooser() {
		const fileChooser: HTMLInputElement = document.createElement('input');
		fileChooser.type = 'file';
		fileChooser.accept = 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon';
		fileChooser.onchange = () => {
			if (fileChooser.files.length) {
				void this.makeAvatar(fileChooser.files.item(0));
			}
			setTimeout(() => fileChooser.remove(), 1000);
		};
		fileChooser.click();
	}

	private async makeAvatar(file: File): Promise<any> {
		try {
			const data: Partial<ImageResizerConfig> = {
				resizeToWidth: 150,
				aspectRatio: 1,
				format: 'png',
				dataUrl: URL.createObjectURL(file)
			};
			const dialogRef: MatDialogRef<ImageResizerComponent> = this.dialog.open(ImageResizerComponent, { data, disableClose: true, panelClass: 'image-resizer-panel' });
			const result: ImageResizerDto = await firstValueFrom(dialogRef.afterClosed());
			if (!result.error) {
				this.loading = true;
				const newFile: File = this.auth.helper.blobToFile(result.data.blob, 'my-avatar.png');
				this.auth.updateAvatar(newFile).subscribe({
					next: () => {
						this.loading = false;
						this.notification.toastSuccess('Cập nhật avatar thành công');
					},
					error: () => {
						this.loading = false;
						this.notification.toastError('Cập nhật avatar thất bại');
					}
				});
			}
		} catch (e) {
		}
	}

	callChangesAvatar() {
		this.observerFileChooser$.next('');
	}

	updateFormAccount() {
		if (this.formAccount.valid) {
			this.loading = true;
			this.observerUploadForm$.next({ name: 'FORM_ACCOUNT', value: this.formAccount.value });
		}
	}

	refreshForm(form: FormName) {
		this.formReset[form]();
		
	}

	ngOnDestroy(): void {
		this.destroy$.next('destroy');
		this.destroy$.complete();
	}

}
