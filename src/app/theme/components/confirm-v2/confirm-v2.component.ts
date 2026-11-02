import { Component , Input , OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component( {
	selector    : 'app-confirm-v2' ,
	templateUrl : './confirm-v2.component.html' ,
	standalone  : true ,
	styleUrls   : [ './confirm-v2.component.css' ]
} )
export class ConfirmV2Component implements OnInit {

	constructor ( private activeModal : NgbActiveModal ) {
	}

	@Input() head : string = 'Xác nhận hành động !';

	@Input() message : string = '-';

	ngOnInit () : void {

	}

	confirm ( p : boolean ) : void {
		this.activeModal.close( p );
	}

}
