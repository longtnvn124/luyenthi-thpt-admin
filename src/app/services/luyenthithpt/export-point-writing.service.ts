import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as exceljs from 'exceljs';
import { TITLE_LEFT } from '@utilities/syscats';

@Injectable({
    providedIn: 'root'
})
export class ExportPointWritingService {

    title_left = TITLE_LEFT;
    constructor() { }

    fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    fileExtension = '.xlsx';

    public exportExcel(
        data: any[],
        header: any[],
        title: string,
        titleFont: any,
        mergerCellsTitle = null,
        rowFont: any,
        headerFont: any,
        tenDonvi: string,
        donviFont: any,
        countbothi: number,
        countDat: number,
        countKhongdat: number,
        tong: number,
        fileName: string,
        colsStyle?: any,
        where?: string,
        date?: string,
        exportNumber?: number,
        shift_name?: string
    ): void {
        const wb = new exceljs.Workbook();
        const ws = wb.addWorksheet('Car', {
            pageSetup: {
                paperSize: 9, // 9 corresponds to A4 size
                orientation: 'portrait', // Change to portrait
                fitToPage: true, // Fit to page
                fitToWidth: 1, // Fit to 1 page wide
                fitToHeight: 0 // Fit to as many pages tall as needed
            }
        });

        // Set margins (in inches)
        ws.pageSetup.margins = {
            left: 0.25,
            right: 0.25,
            top: 0.75,
            bottom: 0.75,
            header: 0.3,
            footer: 0.3
        };

        if (exportNumber === 1) {
            const tenTructhuoc = ws.addRow([this.title_left.donvitructhuoc.toUpperCase(), '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
            const tendonvi = ws.addRow([this.title_left.donvitochuc.toUpperCase(), '', '', '', 'Độc lập - Tự do - Hạnh phúc']);
            tendonvi.font = donviFont;
            tenTructhuoc.font = { name: 'Times New Roman', family: 1, size: 10 };
        } else if (exportNumber === 2) {
            const tenTructhuoc = ws.addRow([this.title_left.donvitructhuoc.toUpperCase(), '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
            const tendonvi = ws.addRow([this.title_left.donvitochuc.toUpperCase(), '', '', '', '', 'Độc lập - Tự do - Hạnh phúc']);
            tenTructhuoc.font = { name: 'Times New Roman', family: 1, size: 10 };
            tendonvi.font = donviFont;
        } else if (exportNumber === 3) {
            const tenTructhuoc = ws.addRow([this.title_left.donvitructhuoc.toUpperCase(), '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
            const tendonvi = ws.addRow([this.title_left.donvitochuc.toUpperCase(), '', '', 'Độc lập - Tự do - Hạnh phúc']);
            tenTructhuoc.font = { name: 'Times New Roman', family: 1, size: 10 };
            tendonvi.font = donviFont;
        }

        if (exportNumber === 1) {
            ws.mergeCells('E1:G1');
            ws.mergeCells('E2:G2');
            ws.getCell('E1', 'G1').font = { name: 'Times New Roman', family: 1, size: 10 };
            ws.getCell('E2', 'G2').font = { name: 'Times New Roman', family: 1, size: 10, underline: true, bold: true };
            ws.getCell('E1', 'G1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.getCell('E2', 'G2').alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (exportNumber === 2) {
            ws.mergeCells('F1:H1');
            ws.mergeCells('F2:H2');
            ws.getCell('F1', 'H1').font = { name: 'Times New Roman', family: 1, size: 10 };
            ws.getCell('F2', 'H2').font = { name: 'Times New Roman', family: 1, size: 10, underline: true, bold: true };
            ws.getCell('F1', 'H1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.getCell('F2', 'H2').alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (exportNumber === 3) {
            ws.mergeCells('D1:F1');
            ws.mergeCells('D2:F2');
            ws.getCell('D1', 'F1').font = { name: 'Times New Roman', family: 1, size: 10 };
            ws.getCell('D2', 'F2').font = { name: 'Times New Roman', family: 1, size: 10, underline: true, bold: true };
            ws.getCell('D1', 'F1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.getCell('D2', 'F2').alignment = { vertical: 'middle', horizontal: 'center' };
        }
        ws.mergeCells('A1:C1');
        ws.getCell('A1', 'C1').alignment = { vertical: 'middle', horizontal: 'center' };
        ws.mergeCells('A2:C2');
        ws.getCell('A2', 'C2').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        ws.addRow([])
        ws.addRow([title]);
        if (mergerCellsTitle) {
            ws.mergeCells(mergerCellsTitle);
            ws.getCell(mergerCellsTitle.split(':')[0]).font = titleFont;
            ws.getCell(mergerCellsTitle.split(':')[0]).alignment = { vertical: 'middle', horizontal: 'center' };
        }

        const row_1 = ws.addRow(['Môn thi: ' + shift_name]);
        const row_2 = ws.addRow([' ']);
        row_1.font = { name: 'Times New Roman', family: 1, size: 12, bold: true };
        row_2.font = { name: 'Times New Roman', family: 1, size: 12, bold: true };
        const headerRow = ws.addRow(header);
        headerRow.font = { name: 'Times New Roman', family: 1, size: 11, bold: true };
        headerRow.eachCell((cell, number) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
                bgColor: { argb: 'FFFFFF' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        ws.getRow(7).height = 31.13;
        ws.getColumn(1).width = 5;
        ws.getColumn(2).width = 15;
        ws.getColumn(3).width = 40;
        ws.getColumn(4).width = 15;
        ws.getColumn(5).width = 10;
        ws.getColumn(6).width = 10;
        ws.getColumn(7).width = 25;

        // Cell Style : Fill and Border
        data.forEach((d, index) => {
            const row = ws.addRow(d);
            row.font = rowFont;
            row.height = 25;
            row.eachCell((cell, number) => {
                if (number !== 3) {
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                }
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        const today = new Date();
        ws.addRow([]);
        if (exportNumber === 1) {
            const nextRowMeg = data.length + 13;
            ws.addRow(['', 'Tổng bài thi: ' + data.length]).font = { name: 'Times New Roman', family: 1, size: 10 };
            ws.addRow([]);
            const date = ws.addRow(['', '', '', '', 'Thái Nguyên, ngày ' + today.getDate() + ' tháng ' + Number(today.getMonth() + 1) + ' năm ' + today.getFullYear()]);
            date.font = { name: 'Times New Roman', family: 1, size: 10 };
            ws.addRow([]);
            const teacher = ws.addRow(['', 'Cán bộ chấm 1', '', '', 'Cán bộ chấm 2']);
            const name = ws.addRow(['', '(ký và ghi rõ họ tên)', '', '', '(ký và ghi rõ họ tên)']);
            teacher.font = { name: 'Times New Roman', family: 1, size: 10, bold: true };
            teacher.alignment = { horizontal: 'center' };
            name.font = { name: 'Times New Roman', family: 1, size: 10, italic: true };
            name.alignment = { horizontal: 'center' }
            ws.mergeCells('B'.concat(nextRowMeg.toString(), ':', 'C', nextRowMeg.toString()));
            ws.mergeCells('E'.concat(nextRowMeg.toString(), ':', 'F', nextRowMeg.toString()));
            ws.mergeCells('B'.concat((nextRowMeg + 1).toString(), ':', 'C', (nextRowMeg + 1).toString()));
            ws.mergeCells('E'.concat((nextRowMeg + 1).toString(), ':', 'F', (nextRowMeg + 1).toString()));
        } else if (exportNumber === 2) {
            const nextRowMeg = data.length + 12;
            ws.addRow(['', 'Tổng bài thi: ' + data.length]).font = { name: 'Times New Roman', family: 1, size: 10 };
            ws.addRow([]);
            const addate = ws.addRow(['', '', '', '', '', 'Thái Nguyên, ngày ' + today.getDate() + ' tháng ' + Number(today.getMonth() + 1) + ' năm ' + today.getFullYear()]);
            const teacher = ws.addRow(['', '', '', '', '', 'TRƯỞNG BAN CHẤM THI']);
            teacher.font = { name: 'Times New Roman', family: 1, size: 10, bold: true };
            teacher.alignment = { horizontal: 'center' };
            addate.font = { name: 'Times New Roman', family: 1, size: 10 };
            addate.alignment = { horizontal: 'center' };
            ws.mergeCells('F'.concat(nextRowMeg.toString(), ':', 'G', nextRowMeg.toString()));
            ws.mergeCells('F'.concat((nextRowMeg - 1).toString(), ':', 'G', (nextRowMeg - 1).toString()));
        } else if (exportNumber === 3) {
            const nextRowMeg = data.length + 12;
            ws.addRow(['', 'Tổng bài chấm: ' + tong]).font = { name: 'Times New Roman', family: 1, size: 10 };
            ws.addRow([]);
            const addate = ws.addRow(['', '', '', 'Thái Nguyên, ngày ' + today.getDate() + ' tháng ' + Number(today.getMonth() + 1) + ' năm ' + today.getFullYear()]);
            const teacher = ws.addRow(['', '', '', 'THƯ KÝ']);
            teacher.font = { name: 'Times New Roman', family: 1, size: 10, bold: true };
            teacher.alignment = { horizontal: 'center' };
            addate.font = { name: 'Times New Roman', family: 1, size: 10 };
            addate.alignment = { horizontal: 'center' };
            ws.mergeCells('D'.concat(nextRowMeg.toString(), ':', 'F', nextRowMeg.toString()));
            ws.mergeCells('D'.concat((nextRowMeg - 1).toString(), ':', 'F', (nextRowMeg - 1).toString()));
        }
        wb.xlsx.writeBuffer().then((data) => {
            this.saveExcelFile(data, fileName);
        });
    }

    private saveExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: this.fileType });
        FileSaver.saveAs(data, fileName + this.fileExtension);
    }
}
