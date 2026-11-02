import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'ovic-groups-radio-custom',
    templateUrl: './ovic-groups-radio-custom.component.html',
    styleUrls: ['./ovic-groups-radio-custom.component.css'],
    standalone: true,
    imports:[ CommonModule ]
})
export class OvicGroupsRadioCustomComponent implements OnInit, OnChanges {

    version: '1.0.1';

    constructor(protected sanitizer: DomSanitizer) { }

    @Input() options: any;

    @Input() ortherDefault: any;

    @Input() classOrther: string;

    @Input() default: any;

    @Input() disabled: boolean;

    @Input() optionId: string;

    @Input() classes: string; //elearning-style

    @Input() optionLabel: string;

    @Input() formField: AbstractControl;

    @Input() rawHtml = false;

    @Input() require = true;

    @Input() verticalMode = false;

    @Input() columns: 1 | 2 | 3 | 4 = 1;

    @Input() isCorrect: boolean;

    @Output() onChange = new EventEmitter<any>();


    active: any;
    index: number[] = [];
    indexOther: number[] = [];

    ngOnInit(): void {
        if (this.default) {
            this.index = this.default.split(',').map(Number);
        } else {
            this.index = [];
        }

        if (this.ortherDefault) {
            this.indexOther = this.ortherDefault.split(',').map(Number);
        } else {
            this.indexOther = [];
        }

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['default']) {
            if (this.default) {
                this.active = this.default;
                this.index = this.default.split(',').map(Number);
                
            } else {
                this.index = [];
                this.active = null;
            }
        }
        if (changes['ortherDefault']) {
            if (this.ortherDefault) {
                this.indexOther = this.ortherDefault.split(',').map(Number);
                
            } else {
                this.indexOther = [];
            }
        }
    }

    transform(inputHtml: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(inputHtml);
    }

    updateValue(value: any, index: number) {
        if (!this.require) {
            if (!this.index.includes(index)) {
                this.index = [index];
                this.active = value;
            } else {
                this.index = null;
                this.active = null;
            }
        } else {
            this.index = [index];
            this.active = value;
        }
        if (this.formField) {
            this.formField.setValue(this.active);
        }
        
        this.onChange.emit(this.active);
    }

    setActiveLi(i: number): string {
       
        
        
        let classLi = this.index.includes(i) ? 'active_li' : null;
        if (this.indexOther.includes(i) && !this.index.includes(i)) {
            classLi = 'orther-active';
        }
        if (this.isCorrect && this.index.includes(i)) {
            classLi += ' checkmark';
        } else if (!this.isCorrect && this.index.includes(i)) {
            classLi += ' crossmark';
        }
        return classLi;
    }

    setActiveOrtherAnwser(i: number): string {
        let classLi = this.indexOther.includes(i) && this.index.includes(i) ? '' : 'has-other-answer';
        if (this.isCorrect && this.indexOther.includes(i)) {
            classLi += ' checkmark';
        } else if (!this.isCorrect && this.indexOther.includes(i)) {
            classLi += ' crossmark';
        }
        return classLi;
    }

    convertToNumber(value: any): number {
        return parseInt(value);
    }

}
