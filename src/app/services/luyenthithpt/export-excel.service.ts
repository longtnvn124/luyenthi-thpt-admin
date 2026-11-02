import { Injectable } from "@angular/core";
import * as FileSaver from "file-saver";
import * as exceljs from "exceljs";
import * as XLSX from "xlsx";
import { count } from "rxjs/operators";
import { TITLE_LEFT } from "@utilities/syscats";

@Injectable({
  providedIn: "root",
})
export class ExportExcelService {
  title_left = TITLE_LEFT;

  constructor() {}

  fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  fileExtension = ".xlsx";

  public exportExcelV2(
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
    where?: string
  ): void {
    const wb = new exceljs.Workbook();
    const ws = wb.addWorksheet("Car", {
      pageSetup: {
        paperSize: 9, // 9 corresponds to A4 size
        orientation: "portrait", // Change to portrait
        fitToPage: true, // Fit to page
        fitToWidth: 1, // Fit to 1 page wide
        fitToHeight: 0, // Fit to as many pages tall as needed
      },
    });

    // Set margins (in inches)
    ws.pageSetup.margins = {
      left: 0.25,
      right: 0.25,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    };

    const tenTructhuoc = ws.addRow([
      this.title_left.donvitructhuoc.toUpperCase(),
      "",
      "",
      "",
      "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",
    ]);
    const tendonvi = ws.addRow([
      this.title_left.donvitochuc.toUpperCase(),
      "",
      "",
      "",
      "Độc lập - Tự do - Hạnh phúc",
    ]);

    tendonvi.font = donviFont;
    tenTructhuoc.font = { name: 'Times New Roman', family: 1, size: 10 };

    // style cho tên trực thuộc và đơn vị
    ws.mergeCells("A1:C1");
    ws.getCell("A1", "C1").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    ws.getCell("A1", "C1").font = {
        name: "Times New Roman",
        family: 1,
        size: 10,
      };

    ws.mergeCells("A2:C2");
    ws.getCell("A2", "C2").alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    ws.getCell("A2", "C2").font = {
        name: "Times New Roman",
        family: 1,
        size: 10,
        underline: true,
        bold: true,
      };


    // style cho quốc hiệu - tiêu ngữ
    ws.mergeCells("E1:G1");
    ws.mergeCells("E2:G2");
    ws.getCell("E1", "G1").font = {
      name: "Times New Roman",
      family: 1,
      size: 10,
    };
    ws.getCell("E2", "G2").font = {
      name: "Times New Roman",
      family: 1,
      size: 10,
      underline: true,
      bold: true,
    };
    ws.getCell("E1", "G1").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    ws.getCell("E2", "G2").alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // cách 1 dòng
    ws.addRow([]);

    // tiêu đề
    ws.addRow([title]);
    ws.mergeCells("A4:G4");
    ws.getCell("A4").font = titleFont;
    ws.getCell("A4").alignment = { vertical: "middle", horizontal: "center" };

    // cách 1 dòng
    ws.addRow([]);

    // table
    
    const headerRow = ws.addRow(header);
    headerRow.font = {
      name: "Times New Roman",
      family: 1,
      size: 11,
      bold: true,
    };
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF" },
        bgColor: { argb: "FFFFFF" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });


    ws.getRow(6).height = 31.13;
    ws.getColumn(1).width = 5;
    ws.getColumn(2).width = 15;
    ws.getColumn(3).width = 30;
    ws.getColumn(4).width = 15;
    ws.getColumn(5).width = 10;
    ws.getColumn(6).width = 30;
    ws.getColumn(7).width = 25;

    // Cell Style : Fill and Border
    data.forEach((d, index) => {
      const row = ws.addRow(d);
      row.font = rowFont;
      row.height = 25;
      row.eachCell((cell, number) => {
        if (number !== 3) {
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          };
        }
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // nội dung phần dưới bảng

    // cách 1 dòng

    // ws.addRow([]);
    // const today = new Date();

    // const nextRowMeg = data.length + 13;
    // ws.addRow(["", "Tổng thí sinh: " + data.length]).font = {
    //   name: "Times New Roman",
    //   family: 1,
    //   size: 10,
    // };
    // ws.addRow([]);
    // const date = ws.addRow([
    //   "",
    //   "",
    //   "",
    //   "",
    //   "Thái Nguyên, ngày " +
    //     today.getDate() +
    //     " tháng " +
    //     Number(today.getMonth() + 1) +
    //     " năm " +
    //     today.getFullYear(),
    // ]);
    // date.font = { name: "Times New Roman", family: 1, size: 10 };

    wb.xlsx.writeBuffer().then((data) => {
      this.saveExcelFile(data, fileName);
    });
  }

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
    where?: string
  ): void {
    const wb = new exceljs.Workbook();
    const ws = wb.addWorksheet("Car", {
      pageSetup: {
        paperSize: 9, // 9 corresponds to A4 size
        orientation: "portrait", // Change to portrait
        fitToPage: true, // Fit to page
        fitToWidth: 1, // Fit to 1 page wide
        fitToHeight: 0, // Fit to as many pages tall as needed
      },
    });

    // Set margins (in inches)
    ws.pageSetup.margins = {
      left: 0.25,
      right: 0.25,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    };

    const tenTructhuoc = ws.addRow([
      this.title_left.donvitructhuoc.toUpperCase(),
      "",
      "",
      "",
      "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",
    ]);
    const tendonvi = ws.addRow([
      this.title_left.donvitochuc.toUpperCase(),
      "",
      "",
      "",
      "Độc lập - Tự do - Hạnh phúc",
    ]);

    //const titleRow     = ws.addRow( [ '' , '' , title ] );
    //titleRow.font      = titleFont;
    tendonvi.font = donviFont;
    tenTructhuoc.font = { name: "Times New Roman", family: 1, size: 11 };
    ws.mergeCells("A1:C1");
    ws.getCell("A1", "C1").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    ws.mergeCells("A2:C2");
    ws.getCell("A2", "C2").alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    if (mergerCellsTitle) {
      ws.mergeCells(mergerCellsTitle);
      ws.getCell(
        mergerCellsTitle.split(":")[0],
        mergerCellsTitle.split(":")[1]
      ).font = titleFont;
      ws.getCell(
        mergerCellsTitle.split(":")[0],
        mergerCellsTitle.split(":")[1]
      ).alignment = { vertical: "middle", horizontal: "center" };
    }
    const headerRow = ws.addRow(header);
    headerRow.font = headerFont;
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F2F2F2" },
        bgColor: { argb: "F2F2F201" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      //const col      = ws.getColumn( number );
      cell.border = {
        top: { style: "thin", color: { argb: "333333" } },
        left: { style: "thin", color: { argb: "333333" } },
        bottom: { style: "thin", color: { argb: "333333" } },
        right: { style: "thin", color: { argb: "333333" } },
      };
      //ws.getRow( number ).hidden = true;
      //col.width = 30;
    });
    if (!where) {
      ws.getRow(2).height = 37.5;
      ws.getRow(3).height = 31.13;
      ws.getColumn(1).width = 5.28;
      ws.getColumn(2).width = 20.14;
      ws.getColumn(3).width = 36.53;
      ws.getColumn(4).width = 14.03;
      ws.getColumn(5).width = 19.03;
      ws.getColumn(6).width = 22.78;
      ws.getColumn(7).width = 35.14;
      ws.getColumn(8).width = 14.03;
      ws.getColumn(9).width = 14.03;
      ws.getColumn(10).width = 14.03;
      ws.getColumn(11).width = 14.03;
      ws.getColumn(12).width = 17.78;
      ws.getColumn(13).width = 17.78;
    } else {
      ws.getRow(2).height = 37.5;
      ws.getRow(3).height = 31.13;
      ws.getColumn(1).width = 5.28;
      ws.getColumn(2).width = 20.14;
      ws.getColumn(3).width = 20.14;
      ws.getColumn(4).width = 20.14;
      ws.getColumn(5).width = 20.14;
      ws.getColumn(6).width = 20.14;
      ws.getColumn(7).width = 20.14;
      ws.getColumn(8).width = 20.14;
      ws.getColumn(9).width = 20.14;
      ws.getColumn(10).width = 20.14;
      ws.getColumn(11).width = 20.14;
      ws.getColumn(12).width = 20.14;
      ws.getColumn(13).width = 20.14;
    }

    // Cell Style : Fill and Border
    data.forEach((d, index) => {
      const row = ws.addRow(d);
      row.font = rowFont;
      row.height = 31.13;
      row.eachCell((cell, number) => {
        if (number !== 3) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }
        cell.border = {
          top: { style: "thin", color: { argb: "333333" } },
          left: { style: "thin", color: { argb: "333333" } },
          bottom: { style: "thin", color: { argb: "333333" } },
          right: { style: "thin", color: { argb: "333333" } },
        };
      });
    });
    if (!where) {
      // ws.addRow([]);
      // const bothi = ws.addRow(['', 'Bỏ thi:', countbothi + ' - ' + countbothi / tong * 100 + '%']);
      // const dat = ws.addRow(['', 'Đạt:', countDat + ' - ' + countDat / tong * 100 + '%']);
      // const khongdat = ws.addRow(['', 'Không Đạt:', countKhongdat + ' - ' + countKhongdat / tong * 100 + '%']);
      // const total = ws.addRow(['', 'Tổng:', tong]);
      // bothi.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' };
      // dat.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' };
      // khongdat.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' };
      // total.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' };
      // bothi.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      // dat.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      // khongdat.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      // total.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      // bothi.font = rowFont;
      // dat.font = rowFont;
      // khongdat.font = rowFont;
      // total.font = rowFont;
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
