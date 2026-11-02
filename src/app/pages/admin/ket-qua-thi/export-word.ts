// import { layouts } from "chart.js";
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TabStopPosition, TabStopType, TextRun, BorderStyle, Table, TableCell, TableRow, WidthType, Alignment, HeightRule, PageSize, PageOrientation, VerticalAlign, Indent } from "docx";
import { Session } from "inspector";

export class DocumentCreator {


    public create(data, skill?, name?, shift?): Document {
        //let content = '';

        const fullcontent = [
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    this.paragraph('ĐẠI HỌC THÁI NGUYÊN', false, false, 24, AlignmentType.CENTER, 200, 0, 60),
                                    this.paragraph('Trường đại học CNTT & TT', true, false, 22, AlignmentType.CENTER, 200, 60, 100),
                                    new Paragraph({
                                        thematicBreak: true,
                                        indent: {
                                            left: 800,
                                            right : 800,
                                        },
                                        spacing: {
                                            before: 0,
                                            after: 0,
                                            line: 10
                                        },
                                        alignment: AlignmentType.CENTER,
                                    }) 
                                ],
                                width: {
                                    size: 3500,
                                    type: WidthType.DXA,
                                },
                                borders: {
                                    left: {
                                        style: BorderStyle.NONE,
                                        size: 3,
                                        color: "333333",
                                    },
                                    right: {
                                        style: BorderStyle.NONE,
                                        size: 3,
                                        color: "333333",
                                    },
                                    top: {
                                        style: BorderStyle.NONE,
                                        size: 3,
                                        color: "333333",
                                    },
                                    bottom: {
                                        style: BorderStyle.NONE,
                                        size: 3,
                                        color: "333333",
                                    },
                                },
                            }),
                            new TableCell({
                                children: [
                                    this.paragraph('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', true, false, 24, AlignmentType.CENTER, 200, 0, 60),
                                    this.paragraph('Độc lập – Tự do – Hạnh phúc', true, false, 22, AlignmentType.CENTER, 200, 60, 100),
                                    new Paragraph({
                                        thematicBreak: true,
                                        indent: {
                                            left: 1600,
                                            right: 1600,
                                        },
                                        spacing: {
                                            before: 0,
                                            after: 0,
                                            line: 10
                                        },
                                        alignment: AlignmentType.CENTER,
                                    })
                                ],
                                width: {
                                    size: 5500,
                                    type: WidthType.DXA,
                                },
                                borders: {
                                    left: {
                                        style: BorderStyle.NONE,
                                        size: 3,
                                        color: "333333",
                                    },
                                    right: {
                                        style: BorderStyle.NONE,
                                        size: 3,
                                        color: "333333",
                                    },
                                    top: {
                                        style: BorderStyle.NONE,
                                        size: 3,
                                        color: "333333",
                                    },
                                    bottom: {
                                        style: BorderStyle.NONE,
                                        size: 3,
                                        color: "333333",
                                    },
                                },
                            }),
                        ],
                    }),
                ],
                alignment: AlignmentType.CENTER,
                width: {
                    size: 9000,
                    type: WidthType.DXA,
                }

            }),
            this.paragraph('', true, false, 26, AlignmentType.CENTER, 300, 40, 40),
            this.paragraph('BÀI THI ĐÁNH GIÁ NĂNG LỰC TIẾNG ANH A2', true, false, 24, AlignmentType.CENTER, 300, 40, 40),
            this.paragraph('', true, false, 26, AlignmentType.CENTER, 300, 40, 40),
            this.paragraph('Họ tên: '.concat(shift['display_name'], "                           MSV: ", shift['student_code']), false, false, 24, AlignmentType.LEFT, 300, 40, 40),
            this.paragraph('Ca thi: '.concat(name), false, false, 24, AlignmentType.LEFT, 300, 40, 40),
            this.paragraph(data['80'][0]['question_direction'], false, false, 24, AlignmentType.LEFT, 300, 40, 40),
        ]
        const document = new Document({
            sections: [{
                children: fullcontent,
            }],


        });

        return document;

    }


    public createContactInfo(phoneNumber: string, profileUrl: string, email: string): Paragraph {
        return new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun(`Mobile: ${phoneNumber} | Website URL: ${profileUrl} | Email: ${email}`),
                new TextRun(""),
            ],
        });
    }

    public createContent(): Paragraph {
        return new Paragraph({
            children: [
                new TextRun({
                    text: 'Dạng bài thi:',
                    size: 24,
                }),

                new TextRun({
                    text: ' VSTEP 3-5		 	',
                    size: 24,
                }),

                new TextRun({
                    text: 'Tập bài số: ……………………',
                    size: 24,
                }),
                new TextRun({
                    text: 'Trọng số…………………',
                    size: 24,
                })
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
                line: 300,
                after: 200
            },
            indent: {
                left: -500,
                right: -500
            }

        });
    }

    public educationtext(skill): Paragraph {
        const title = skill['value'] === 'listening' ? 'PHIẾU CHẤM TỔNG HỢP KẾT QUẢ CHẤM THI KĨ NĂNG NÓI' : 'PHIẾU CHẤM TỔNG HỢP KẾT QUẢ CHẤM THI KĨ NĂNG VIẾT';
        return new Paragraph({
            children: [
                new TextRun({
                    text: title,
                    bold: true,
                    size: 24
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
                line: 300,
                after: 40,
                before: 40,
            },
        });


    }

    paragraph(text: string, bold: boolean, italic: boolean, textSize: number, alignment?: any, line?: number, after?: number, before?: number, indent_left?: number, indent_right?: number) {
        const result = new Paragraph({
            children: [
                new TextRun({
                    text: text,
                    bold: bold,
                    italics: italic,
                    size: textSize
                })
            ],
            alignment: alignment,
            spacing: {
                line: line,
                after: after,
                before: before
            },
            indent: {
                left: indent_left ? indent_left : 0,
                right: indent_right ? indent_right : 0,
            }
        });
        return result;
    }

    tabelCell(text: any, textSize: number, width: number, alignment: any, bold: boolean, italic: boolean, rowSpan: number, margins_left: number, margins_right: number, verticalAlign?: any) {
        const cell = new TableCell({
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: text,
                            bold: bold,
                            italics: italic,
                            size: textSize
                        })
                    ],
                    alignment: alignment,
                }),
            ],
            width: {
                size: width,
                type: WidthType.DXA,
            },
            rowSpan: rowSpan,
            verticalAlign: verticalAlign ? verticalAlign : VerticalAlign.CENTER,
            margins: {
                left: margins_left,
                right: margins_right,
            },
            
            // borders: {
            //     left: {
            //         style: borderStyle ? borderStyle : BorderStyle.DOT_DOT_DASH,
            //         size: 3,
            //         color: "333333",
            //     },
            //     right: {
            //         style: borderStyle ? borderStyle : BorderStyle.DOT_DOT_DASH,
            //         size: 3,
            //         color: "333333",
            //     },
            //     top: {
            //         style: borderStyle ? borderStyle : BorderStyle.DOT_DOT_DASH,
            //         size: 3,
            //         color: "333333",
            //     },
            //     bottom: {
            //         style: borderStyle ? borderStyle : BorderStyle.DOT_DOT_DASH,
            //         size: 3,
            //         color: "333333",
            //     },
            // },

        })
        return cell
    }

    public createContent_1(data): Paragraph {
        return new Paragraph({
            children: [
                new TextRun({
                    text: 'Họ và tên thí sinh: ' + data['student']['hoten'],
                    size: 26,
                }),

                new TextRun({
                    text: '                   Ngày sinh: ' + data['student']['ngaysinh_convert'],
                    size: 26,
                }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
                line: 300,
                after: 60,
                before: 60,
            },
        });
    }

    public createContent_2(data, shift): Paragraph {
        return new Paragraph({
            children: [
                new TextRun({
                    text: 'Số báo danh: ' + data['code'],
                    size: 26,
                }),

                new TextRun({
                    text: '                                          Ngày thi: ' + shift['time_start_format'],
                    size: 26,
                }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
                line: 300,
                after: 60,
                before: 60
            },
        });
    }

    public createContent_4(): Paragraph {
        return new Paragraph({
            children: [
                new TextRun({
                    text: 'CÁN BỘ RÀ SOÁT ĐIỂM 1              ',
                    size: 28,
                    bold: true,

                }),

                new TextRun({
                    text: 'CÁN BỘ RÀ SOÁT ĐIỂM 2',
                    size: 28,
                    bold: true,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
                line: 300,
                after: 60,
                before: 60
            },
        });
    }
}