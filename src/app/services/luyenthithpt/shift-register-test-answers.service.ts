import { Injectable } from '@angular/core';
import { IctuBaseServiceClass } from "@model/ictu-base-service";
import { ShiftRegisterTestAnswers } from "@model/shift-register-test-answers";

@Injectable( {
	providedIn : 'any'
} )
export class ShiftRegisterTestAnswersService extends IctuBaseServiceClass<ShiftRegisterTestAnswers> {

	constructor () {
		super( 'shift-register-test-answers' );
	}
}
