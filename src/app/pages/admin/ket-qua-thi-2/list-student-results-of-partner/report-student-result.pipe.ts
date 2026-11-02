import { Pipe , PipeTransform } from '@angular/core';
import { TestSubject , TestSubjectReport } from "@pages/admin/ket-qua-thi-2/list-student-results-of-partner/list-student-results-of-partner.component";

@Pipe( {
	name       : 'reportStudentResult' ,
	standalone : true
} )
export class ReportStudentResultPipe implements PipeTransform {

	transform ( results : TestSubjectReport[] , subject : TestSubject ) : string {
		return results.reduce( ( reducer : string , testReport : TestSubjectReport ) : string => {
			return subject.id === testReport.id ? `<span style="width: 48px;">${ testReport.attempt }</span>|<span style="width: 48px;">${ testReport.lastScore }</span>` : reducer;
		} , '<span style="width: 48px;">0</span>|<span style="width: 48px;">0</span>' )
	}

}
