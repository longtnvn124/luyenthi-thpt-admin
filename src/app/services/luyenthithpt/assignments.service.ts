import { Injectable } from '@angular/core';
import { IctuBaseServiceClass } from "@model/ictu-base-service";
import { Assignment } from "@model/assignment";

@Injectable( {
	providedIn : 'any'
} )
export class AssignmentsService extends IctuBaseServiceClass<Assignment> {

	constructor () {
		super( 'assignments' );
	}
}
