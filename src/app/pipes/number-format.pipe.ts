import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
  standalone: true
})
export class NumberFormatPipe implements PipeTransform {

  transform(value: number | string, ...args: unknown[]): string {
    if (value == null) return '';

    // Kiểm tra kiểu dữ liệu và chuyển nó về kiểu number nếu là string
    let numberValue = typeof value === 'string' ? parseFloat(value) : value;

    // Sử dụng toLocaleString để chuyển đổi số thành chuỗi với dấu chấm phân cách
    return numberValue.toLocaleString('de-DE'); // 'de-DE' sẽ sử dụng dấu chấm cho hàng nghìn
  }
}
