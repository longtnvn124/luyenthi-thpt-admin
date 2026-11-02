import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatVndCurrency',
  standalone: true
})
export class FormatVndCurrencyPipe implements PipeTransform {

  transform(value: number): string {
    if (value == null) return ''; // Xử lý trường hợp giá trị null hoặc undefined
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }

}
