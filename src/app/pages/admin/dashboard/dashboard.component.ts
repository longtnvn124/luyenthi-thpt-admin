// angular import
import { Component , OnInit , ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";


import { ChartDB } from "../../../fake-data/chartDB";

// third party
import { ApexAnnotations , NgApexchartsModule } from "ng-apexcharts";
import {
	ApexAxisChartSeries ,
	ApexNonAxisChartSeries ,
	ApexChart ,
	ChartComponent ,
	ApexDataLabels ,
	ApexPlotOptions ,
	ApexYAxis ,
	ApexTitleSubtitle ,
	ApexXAxis ,
	ApexFill ,
	ApexTooltip ,
	ApexStroke ,
	ApexGrid ,
	ApexLegend ,
	ApexResponsive ,
} from "ng-apexcharts";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { UsersSystemComponent } from "./components/users-system/users-system.component";
import { NumberOfPurchasesComponent } from "./components/number-of-purchases/number-of-purchases.component";
import { RevenueComponent } from "./components/revenue/revenue.component";
import { CompleteTheTestComponent } from "./components/complete-the-test/complete-the-test.component";
import { ColumnWithRotatedLabelsComponent } from "./components/column-with-rotated-labels/column-with-rotated-labels.component";
import { TnQLCathi } from "@model/tn-ql-ca-thi";
import { TnQLCathiService } from "@service/luyenthithpt/tn-ql-ca-thi.service";
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from "@angular/forms";
import { TnShiftStudentTestService } from "@service/luyenthithpt/tn-shift-student-tests.service";
import { ButtonModule } from "primeng/button";
import { TnShiftTestControlService } from "@service/luyenthithpt/tn-shift-test-control.service";

export type ChartOptions = {
	series : ApexAxisChartSeries | ApexNonAxisChartSeries;
	chart : ApexChart | undefined;
	dataLabels : ApexDataLabels;
	plotOptions : ApexPlotOptions;
	yaxis : ApexYAxis;
	xaxis : ApexXAxis;
	fill : ApexFill;
	title : ApexTitleSubtitle;
	tooltip : ApexTooltip;
	colors : string[];
	stroke : ApexStroke;
	grid : ApexGrid;
	labels : string[];
	responsive : ApexResponsive[];
	legend : ApexLegend;
	annotations : ApexAnnotations;
};

@Component( {
	selector    : "app-dashboard" ,
	standalone  : true ,
	imports     : [
		CommonModule ,
		MatButtonModule ,
		MatMenuModule ,
		MatProgressBarModule ,
		MatTabsModule ,
		MatTooltipModule ,
		NgApexchartsModule ,
		UsersSystemComponent ,
		NumberOfPurchasesComponent ,
		RevenueComponent ,
		CompleteTheTestComponent ,
		ColumnWithRotatedLabelsComponent ,
		DropdownModule ,
		FormsModule ,
		ButtonModule
	] ,
	templateUrl : "./dashboard.component.html" ,
	styleUrls   : [ "./dashboard.component.scss" ] ,
} )
export class DashboardComponent implements OnInit {
	// public props
	@ViewChild( "chart" ) chart! : ChartComponent;
	earningChart : Partial<ChartOptions>;
	pageViewChart : Partial<ChartOptions>;
	totalTaskChart : Partial<ChartOptions>;
	downloadChart : Partial<ChartOptions>;
	monthlyRevenueChart : Partial<ChartOptions>;
	totalTasksChart : Partial<ChartOptions>;
	pendingTasksChart : Partial<ChartOptions>;
	totalIncomeChart : Partial<ChartOptions>;

	scoreSpectrumChart : Partial<ChartOptions>;

	// eslint-disable-next-line
	chartDB : any;

	// graph color change with theme color mode change
	preset = [ "#4680FF" ];
	monthlyColor = [ "#4680FF" , "#8996a4" ];
	incomeColors = [ "#4680FF" , "#E58A00" , "#2CA87F" , "#b5ccff" ];

	isLoading = true;

	// constructor

	listOptions : { name : string, value : string }[] = [
		{
			name  : 'Tất cả' ,
			value : 'all'
		} ,
		{
			name  : 'Đang mở' ,
			value : 'active'
		} ,
		{
			name  : 'Đã thi xong' ,
			value : 'complete'
		} ,
		{
			name  : 'Mới nhất' ,
			value : 'new'
		}
	]

	selectedOption : 'all' | 'active' | 'complete' | 'new' = 'active'

	constructor (
		private tnQLCathiService : TnQLCathiService ,
		private tnShiftStudentTestService : TnShiftStudentTestService ,
		private tnShiftTestControlService : TnShiftTestControlService
	) {
		this.chartDB = ChartDB;
		const {
			earningChart ,
			totalTaskChart ,
			downloadChart ,
			totalTasksChart ,
			pageViewChart ,
			monthlyRevenueChart ,
			pendingTasksChart ,
			totalIncomeChart ,
		} = this.chartDB;
		this.earningChart = earningChart;
		this.pageViewChart = pageViewChart;
		this.totalTaskChart = totalTaskChart;
		this.downloadChart = downloadChart;
		this.monthlyRevenueChart = monthlyRevenueChart;
		this.totalTasksChart = totalTasksChart;
		this.pendingTasksChart = pendingTasksChart;
		this.totalIncomeChart = totalIncomeChart;
	}


	// public method
	project = [
		{
			title : "Invoice Generator" ,
		} ,
		{
			title : "Package Upgrades" ,
		} ,
		{
			title : "Figma Auto Layout" ,
		} ,
	];

	List_transaction = [
		{
			icon            : "AI" ,
			name            : "Apple Inc." ,
			time            : "#ABLE-PRO-T00232" ,
			amount          : "$210,000" ,
			amount_position : "ti ti-arrow-down-left" ,
			percentage      : "10.6%" ,
			amount_type     : "text-warn-500" ,
		} ,
		{
			icon            : "SM" ,
			tooltip         : "10,000 Tracks" ,
			name            : "Spotify Music" ,
			time            : "#ABLE-PRO-T10232" ,
			amount          : "- 10,000" ,
			amount_position : "ti ti-arrow-up-right" ,
			percentage      : "30.6%" ,
			amount_type     : "text-success-500" ,
		} ,
		{
			icon            : "MD" ,
			bg              : "text-primary-500 bg-primary-50" ,
			tooltip         : "143 Posts" ,
			name            : "Medium" ,
			time            : "06:30 pm" ,
			amount          : "-26" ,
			amount_position : "ti ti-arrows-left-right" ,
			percentage      : "5%" ,
			amount_type     : "text-warning-500" ,
		} ,
		{
			icon            : "U" ,
			tooltip         : "143 Posts" ,
			name            : "Uber" ,
			time            : "08:40 pm" ,
			amount          : "+210,000" ,
			amount_position : "ti ti-arrow-up-right" ,
			percentage      : "10.6%" ,
			amount_type     : "text-success-500" ,
		} ,
		{
			icon            : "OC" ,
			bg              : "text-warning-500 bg-warning-50" ,
			tooltip         : "143 Posts" ,
			name            : "Ola Cabs" ,
			time            : "07:40 pm" ,
			amount          : "+210,000" ,
			amount_position : "ti ti-arrow-up-right" ,
			percentage      : "10.6%" ,
			amount_type     : "text-success-500" ,
		} ,
	];

	income_card = [
		{
			background : "bg-primary-500" ,
			item       : "Income" ,
			value      : "$23,876" ,
			number     : "+$763,43" ,
		} ,
		{
			background : "bg-warning-500" ,
			item       : "Rent" ,
			value      : "$23,876" ,
			number     : "+$763,43" ,
		} ,
		{
			background : "bg-success-500" ,
			item       : "Download" ,
			value      : "$23,876" ,
			number     : "+$763,43" ,
		} ,
		{
			background : "bg-primary-200" ,
			item       : "Views" ,
			value      : "$23,876" ,
			number     : "+$763,43" ,
		} ,
	];

	listShift : TnQLCathi[] = [];

	ngOnInit () : void {
		this.loadShiftData();
	}

	loadShiftData () : void {
		this.tnQLCathiService.getShiftByOptionDashborad( this.selectedOption ).subscribe( {
			next : ( res ) => {
				this.listShift = res.data ?? [];
			}
		} )


	}

	changeOption () {
		this.loadShiftData();
	}

}

/*

 ngOnInit(): void {
 this.scoreSpectrumChart = {
 series: [
 {
 name: "Nam",
 data: this.generateFakeData(150) // Số lượng tương ứng với categories
 },
 {
 name: "Nữ",
 data: this.generateFakeData(150)
 },
 {
 name: "Khác",
 data: this.generateFakeData(150)
 }
 ],
 chart: {
 type: "bar",
 height: 350,
 stacked: true,
 toolbar: {
 show: true
 },
 zoom: {
 enabled: true
 }
 },
 responsive: [
 {
 breakpoint: 480,
 options: {
 legend: {
 position: "bottom",
 offsetX: -10,
 offsetY: 0
 }
 }
 }
 ],
 plotOptions: {
 bar: {
 horizontal: false
 }
 },
 xaxis: {
 type: "category",
 categories: Array.from({ length: 150 }, (_, i) => (i + 1).toString()) // Tạo mảng từ 1 đến 150
 },
 legend: {
 position: "right",
 offsetY: 40
 },
 fill: {
 opacity: 1
 }
 };
 }

 // Hàm tạo dữ liệu giả ngẫu nhiên
 generateFakeData(length: number): number[] {
 return Array.from({ length }, () => Math.floor(Math.random() * 100)); // Giá trị random từ 0-100
 }
 */
