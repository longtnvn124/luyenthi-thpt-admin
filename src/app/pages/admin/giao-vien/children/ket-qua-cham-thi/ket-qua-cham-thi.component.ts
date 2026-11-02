import { Component } from '@angular/core';
import { GradingAssigmentResultsComponent } from "../../../../../components/grading-assigment-results/grading-assigment-results.component";

@Component( {
	selector   : 'app-ket-qua-cham-thi' ,
	standalone : true ,
	imports    : [ GradingAssigmentResultsComponent ] ,
	template   : '<app-grading-assigment-results heading="Danh sách kết quả chấm thi"></app-grading-assigment-results>'
} )
export class KetQuaChamThiComponent {

}
