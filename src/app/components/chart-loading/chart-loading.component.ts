import { Component , ElementRef , OnInit , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component( {
	selector    : 'app-chart-loading' ,
	standalone  : true ,
	imports     : [ CommonModule ] ,
	templateUrl : './chart-loading.component.html' ,
	styleUrls   : [ './chart-loading.component.scss' ]
} )
export class ChartLoadingComponent implements OnInit {
	@ViewChild( 'chartLoader' , { static : false } ) chartLoader! : ElementRef;
	
	bars : number[]    = [];
	height : string    = '300px';
	yLabels : string[] = [ '100' , '75' , '50' , '25' , '0' ];
	xLabels : string[] = [];
	
	ngOnInit () {
		this.calculateBars();
		this.generateRandomHeights();
	}
	
	randomHeights : string[] = [];
	
	generateRandomHeights () {
		this.randomHeights = this.bars.map( () => `${ Math.random() * 60 + 20 }%` );
	}
	
	calculateBars () {
		const barCount = 20;
		this.bars      = new Array( barCount ).fill( 0 );
		this.xLabels   = this.bars.map( ( _ , i ) => `${ i + 1 }` );
	}
	
	// Helper method để tạo chiều cao ngẫu nhiên cho mỗi cột
	getRandomHeight () : string {
		return `${ Math.random() * 60 + 20 }%`;
	}
}