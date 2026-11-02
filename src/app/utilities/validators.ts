import { AbstractControl , AsyncValidatorFn , FormGroup , ValidationErrors , ValidatorFn } from '@angular/forms';
import moment from 'moment';
import { map , Observable } from "rxjs";

const PASSWORD_REGEX : RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?!.*?\s)(?=.*?[#?!@$%^&*-]).{8,30}$/;

export const USER_NAME_REGEX : RegExp = /^[a-z0-9]+(?:(?:-|_)[a-z0-9]+)*$/gm;

export const PHONE_REGEX : RegExp = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export const EMAIL_REGEX : RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const DDMMYYYYDateFormatValidator : ValidatorFn = ( control : AbstractControl ) : ValidationErrors | null => ( ! control.value || moment( control.value , 'DD/MM/YYYY' , true ).isValid() ) ? null : { theDateDoesNotExist : true };

export const PhoneNumberValidator : ValidatorFn = ( control : AbstractControl ) : ValidationErrors | null => control.value ? PHONE_REGEX.test( control.value ) ? null : { invalidPhoneNumberStructure : true } : null;

export const EmailValidator : ValidatorFn = ( control : AbstractControl ) : ValidationErrors | null => ! control.value || EMAIL_REGEX.test( control.value ) ? null : { invalidEmail : true };

export const UserNameValidator : ValidatorFn = ( control : AbstractControl ) : ValidationErrors | null => ! control.value || USER_NAME_REGEX.test( control.value ) ? null : { invalidUserName : true };

export const PasswordValidator : ValidatorFn = ( control : AbstractControl ) : ValidationErrors | null => ! control.value || ( PASSWORD_REGEX.test( control.value ) && control.value.length >= 8 && control.value.length <= 30 ) ? null : { invalidPassword : true };

export const ReactivePasswordValidator : ValidatorFn = ( control : AbstractControl ) : ValidationErrors | null => {
	if ( ! control.value ) {
		return null;
	}
	const _checker : PasswordCriteriaCheck = {
		length           : ( str : string ) : boolean => /.{8,200}/.test( str ) ,
		uppercase        : ( str : string ) : boolean => /[A-Z]/.test( str ) ,
		lowercase        : ( str : string ) : boolean => /[a-z]/.test( str ) ,
		number           : ( str : string ) : boolean => /\d/.test( str ) ,
		whitespace       : ( str : string ) : boolean => ! /\s/.test( str ) ,
		specialCharacter : ( str : string ) : boolean => /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test( str )
	};
	
	const invalidPassword : PasswordGuide | null = Object.keys( _checker ).reduce( ( reducer , criteria ) => {
		if ( ! _checker[ criteria ]( control.value ) ) {
			reducer[ criteria ] = true;
		}
		return reducer;
	} , {} );
	
	return Object.keys( invalidPassword ).length ? { invalidPassword } : null;
};

type PasswordCriteria = 'length' | 'uppercase' | 'lowercase' | 'number' | 'specialCharacter' | 'whitespace'

type PasswordGuide = {
	[T in PasswordCriteria]? : boolean
};

type PasswordCriteriaCheck = Record<PasswordCriteria , ( input : string ) => boolean>;

export const passwordMatchValidator : ValidatorFn = ( control : FormGroup ) : ValidationErrors | null => {
	const password : AbstractControl<string>        = control.get( 'password' );
	const confirmPassword : AbstractControl<string> = control.get( 'confirmPassword' );
	
	if ( password.invalid ) {
		return { 'password_invalid' : true };
	}
	
	if ( password && confirmPassword && password.value !== confirmPassword.value ) {
		return { 'password_mismatch' : true };
	}
	
	return null;
};

export const asyncValidator : ( validator : Observable<boolean> , fieldName? : string , invalid_name? : string ) => AsyncValidatorFn = ( validator : Observable<boolean> , fieldName? : string , invalid_name? : string ) : AsyncValidatorFn => {
	return ( control : AbstractControl ) : Observable<ValidationErrors | null> => {
		return validator.pipe(
			map( ( valid : boolean ) : ValidationErrors | null => {
				// valid ? null : { invalid_name : true }
				if ( valid ) {
					return null
				}
				else {
					const error : ValidationErrors = invalid_name ? { invalid_name : true } : { 'invalid' : true };
					if ( fieldName ) {
						control.get( fieldName ).setErrors( error );
					}
					return error;
				}
			} )
		)
	};
}