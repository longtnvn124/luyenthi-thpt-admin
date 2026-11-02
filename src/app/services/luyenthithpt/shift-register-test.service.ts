import { Injectable } from '@angular/core';
import { IctuBaseServiceClass } from "@model/ictu-base-service";
import { ShiftRegisterTest } from "@model/shift-register-test";

@Injectable( {
	providedIn : 'any'
} )
export class ShiftRegisterTestService extends IctuBaseServiceClass<ShiftRegisterTest> {

	constructor () {
		super( 'shift-register-tests' );
	}
}
