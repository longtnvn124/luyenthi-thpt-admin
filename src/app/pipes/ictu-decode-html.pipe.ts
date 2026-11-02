import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {Helper, HelperClass} from "@utilities/helper";

@Pipe({
  name: 'ictuDecodeHtml',
  standalone:true
})
export class IctuDecodeHtmlPipe implements PipeTransform {

  constructor( private domSanitizer : DomSanitizer) {}

  transform( value : string ) : SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml( Helper.decodeHTML(value) );
  }

}
