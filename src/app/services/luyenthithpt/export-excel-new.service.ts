import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as exceljs from 'exceljs';

@Injectable({
    providedIn: 'root'
})
export class ExportExcelNewService {

    constructor() { }

    fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    fileExtension = '.xlsx';

    public exportExcel(
        objectExcel = {},
        cols = {},
        objectColWidth,
        rowFont?,
        fileName?,
    ): void {
        const wb = new exceljs.Workbook();
        Object.keys(objectExcel).forEach((fo, okey) => {
            const ws = wb.addWorksheet(fo, { pageSetup: { paperSize: 9, orientation: 'portrait' } });
            ws.pageSetup.margins = {
                left: 0.5, right: 0.6,
                top: 0.4, bottom: 0.4,
                header: 0.3, footer: 0.3
            };
            objectExcel[fo]['header'].forEach((d, index) => {
                const row = ws.addRow(d);
                row.eachCell((cell, number) => {
                    cell.font = { name: 'Arial', family: 1, size: 9 };
                });
            })
            objectExcel[fo]['tableHeader'].forEach((d, index) => {
                const row = ws.addRow(d);
                row.worksheet.pageSetup.showRowColHeaders = true;
                row.eachCell((cell, number) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFF' },
                        bgColor: { argb: 'FFFFFF' },
                    };
                    cell.font = { name: 'Arial', family: 1, size: 8, bold: true };
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    cell.border = {
                        top: { style: 'thin', color: { argb: '333333' } },
                        left: { style: 'thin', color: { argb: '333333' } },
                        bottom: { style: 'thin', color: { argb: '333333' } },
                        right: { style: 'thin', color: { argb: '333333' } }
                    };
                });
            })
            objectExcel[fo]['dataTable'].forEach((d, index) => {
                const row = ws.addRow(d);
                row.font = rowFont;
                row.height = 31.13;
                if (index < objectExcel[fo]['dataTable'].length - 1) {
                    row.eachCell((cell, number) => {
                        if (number >= 7 && number <= 11 || number < 3 || number === 6) {
                            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        } else {
                            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                        }
                        // ... rest of the cell styling logic
                    });
                } else {
                    row.eachCell((cell, number) => {
                        if (number >= 7 && number <= 11 || number < 3 || number === 6) {
                            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        } else {
                            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                        }
                        // ... rest of the cell styling logic
                    });
                }
            });
            // ... rest of the code remains the same
        })

        wb.xlsx.writeBuffer().then((_data) => {
            this.saveExcelFile(_data, fileName);
        });
    }


    private saveExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: this.fileType });
        FileSaver.saveAs(data, fileName + this.fileExtension);
    }

    setFont(ws, cols: {}) {
        Object.keys(cols).forEach((f, key) => {
            ws.getCell(cols[f]['name']).font = cols[f]['font'];
            ws.getCell(cols[f]['name']).alignment = {
                ...cols[f]['alignment'],
                wrapText: cols[f]['alignment'].shrinkToFit
            };
        })
    }

    setColWidth(ws, cols: {}) {
        Object.keys(cols).forEach((f, key) => {
            ws.getColumn(Number(f)).width = cols[f];
        })
    }

}
