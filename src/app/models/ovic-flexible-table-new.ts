import { OvicChooser } from "./ovic-models";

export interface OvicFlexibleTableNewHeadSearch {
    enable: boolean;
    placeholder?: string;
    button?: string;
}

export interface OvicFlexibleTableNewHeadButton {
    label: string;
    name: string;
    icon?: string;
    class?: string;
}

export interface OvicFlexibleTableNewColumnMenuCondition {
    field: string;
    value: any;
    equal: '>' | '>=' | '=' | '<' | '<=' | '!';
}

export interface OvicFlexibleTableNewColumnMenu {
    label: string;
    slug: string;
    icon?: string;
    class?: string;
    conditions?: {
        display?: OvicFlexibleTableNewColumnMenuCondition,
        hide?: OvicFlexibleTableNewColumnMenuCondition,
    },
    child?: OvicFlexibleTableNewColumnMenu[];
    separator?: boolean;
}

export interface OvicFlexibleTableNewColumn {
    label: string; // head text
    field: string;
    menu?: OvicFlexibleTableNewColumnMenu[];
    innerHtml?: boolean;
    width?: string;
    headClass?: string;
    columnClass?: string;
    isFixed?: boolean;
    fieldClick?: boolean;
}


export interface OvicFlexibleTableState {
    isInit: boolean;
    error: boolean;
    isEmpty: boolean;
    isLoading: boolean;
}

export interface OvicFilterSettings {
	mode : 'input' | 'select'; //input type , select <=> dropdown menu
	inputClass? : string; // css classes of input tag, only work with mode=input
	inputType? : 'number' | 'text' | 'email'; // Type of input tag, only work with mode=input
	inputPlaceholder? : string; // the placeholder text of input tag, only work with mode=input
	selectSearch? : boolean; // enable search on dropdown
	selectType? : 'single' | 'multiple';
	validate? : any;
}


export interface OvicMenu {
	name? : string;
	level? : number;
	cssClass? : string;
	openState : boolean; // trạng thái của menu => dùng cho click open/close
	elements : OvicMenuItem[];
}

export interface OvicMenuItem {
	hint? : string;
	label : string;
	icon : string;
	type : 'handleEvent' | 'link' | 'route';
	eventName? : string;
	link? : string;
	route? : string;
	cssClass? : string;
	liCssClass? : string;
	child? : OvicMenu;
	visibleDependOn? : string; // field used for checking
	visibleConditions? : string[]; // values used for checking eg: ['gia-tri-so-sanh-1','gia-tri-so-sanh-2']
	isHidden? : boolean; // used to force hidden menu
	hiddenConditions? : string[]; // used to force hidden menu
	hiddenConditionsField? : string; // Name of checking field
}


export interface OvicFlexibleColumn {
	header : string;
	field : string[];
	width : string;
	separator? : string;
	headerClass : string;
	rowClass : string;
	dataType : 'text' | 'text-innerHTML' | 'reference' | 'state' | 'state-innerHTML' |'state-progessBar';
	enableFilter : boolean;
	data? : any;
	referenceData? : any; /*dùng convert trong nội hàm ovicFlexible Compontent*/
	dataOvicChooser? : OvicChooser[]; /*dùng convert trong nội hàm ovicFlexible Compontent*/
	dataIndexField? : string;
	dataLabelField? : string;
	filterSetting? : OvicFilterSettings;
	menu? : OvicMenu;
	states? : OvicColumnStatus[];
}


export interface OvicColumnStatus {
	key? : string; // it's used for filter
	class : string;
	value : string;
	filterValue? : string; // it's used in case dataType=state-innerHTML
}

export interface OvicFlexibleTopbarRight {
	type : 'openRightBox' | 'handleEvent'; /*openRightBox | handleEvent*/
	eventName : string; /*used for handleEvent type*/
	label : string;
	icon : string;
	btnClass : string;
	templateName : string;
}
