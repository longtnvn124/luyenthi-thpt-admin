import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'incrementNodeNumber',
  standalone : true
})
export class IncrementNodeNumberPipe implements PipeTransform {
  // định dạng truyền vào : 10-15
  transform(nodeNumber: string, index: number): string {
    
    
    // Tách phần đầu tiên của nodeNumber 
    const [start, end] = nodeNumber.split('-').map(Number);
    
    // Kiểm tra nếu phần đầu có thể chuyển thành số
    if (!isNaN(start)) {
      // Tăng dần giá trị theo index
      const newValue = start + index;
      // return `${newValue}-${end}`;
      return newValue.toString();
    }

    
    // Trả về giá trị gốc nếu không chuyển đổi được
    return nodeNumber;
  }
}
