import { AfterViewInit , Component , Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProgressBarModule } from 'primeng/progressbar';

@Component( {
	selector    : 'app-progress-bar-percent' ,
	standalone  : true ,
	imports     : [ CommonModule , ProgressBarModule ] ,
	templateUrl : './progress-bar-percent.component.html' ,
	styleUrls   : [ './progress-bar-percent.component.css' ]
} )
export class ProgressBarPercentComponent implements AfterViewInit {

	@Input() percent : number = 0;

	@Input() show : boolean = false;

	constructor ( private activeModal : NgbActiveModal ) {
	}

	ngAfterViewInit () : void {
		// Nếu modal mở lần đầu và percent bằng 0, ta có thể thêm hiệu ứng chạy hết rồi thu lại.
		// if (this.percent === 0 && this.show) {
		//   setTimeout(() => {
		//     this.percent = 100;
		//     setTimeout(() => {
		//       this.percent = 0; // Sau khi thanh chạy hết, thu lại.
		//     }, 1000); // Thời gian thu lại
		//   }, 1000); // Hiệu ứng chạy hết thanh
		// }
	}


	confirm ( p : boolean ) : void {
		this.activeModal.close( p );
	}
}
