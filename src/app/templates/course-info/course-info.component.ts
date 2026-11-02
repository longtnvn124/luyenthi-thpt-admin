import { Component , EventEmitter , Input , OnDestroy , OnInit , Output } from '@angular/core';
import { CourseExtend , CoursePrice } from '@model/course';
import { LoadCourseThumbnailDirective } from '../../directives/load-course-thumbnail.directive';
import { CommonModule } from '@angular/common';
import { CartService } from '@service/cart.service';
import { Subject , takeUntil } from 'rxjs';
import { LoadingProgressBarComponent } from '../loading-progress-bar/loading-progress-bar.component';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Cart , CartActionEvent } from '@model/cart';
import { NotificationService } from '@appNotification';

export type CourseInfoEventName = 'QUERY_CATEGORY' | 'GET_DETAILS' | 'GET_TO_LEARNING_PANEL' | 'BUY_COURSE';

export interface CourseInfoEvent {
	name : CourseInfoEventName,
	course : CourseExtend,
	category : number
}

@Component( {
	selector    : 'app-course-info' ,
	standalone  : true ,
	templateUrl : './course-info.component.html' ,
	imports     : [ CommonModule , LoadCourseThumbnailDirective , LoadingProgressBarComponent , ButtonModule , RippleModule ] ,
	styleUrls   : [ './course-info.component.css' ]
} )
export class CourseInfoComponent implements OnInit , OnDestroy {

	@Input() set course( course : CourseExtend ) {
		this._course    = course;
		this.cost.price = course.price.toLocaleString( 'vi-VN' , { style : 'currency' , currency : 'VND' } );
		this.cost.sale  = course.price && course.price !== course.sale_price ? course.sale_price.toLocaleString( 'vi-VN' , { style : 'currency' , currency : 'VND' } ) : '';
		this.cost.free  = course.sale_price === 0;
	}

	private _course! : CourseExtend;
	get course() : CourseExtend {
		return this._course;
	}

	@Output() onEvent : EventEmitter<CourseInfoEvent> = new EventEmitter<CourseInfoEvent>();

	protected cost : CoursePrice = { price : '0' , sale : '' , free : false };

	private onDestroy$ : Subject<void> = new Subject<void>();

	loading : boolean = true;

	buildCartFait : boolean = false;

	hasInCart : boolean = false;

	private cart : Cart;

	constructor(
		private cartService : CartService ,
		private notification : NotificationService
	) {}

	ngOnInit() : void {
		this.cartService.buildCart.pipe( takeUntil( this.onDestroy$ ) ).subscribe( ( cart ) => {
			this.cart          = cart;
			this.buildCartFait = !cart;
			this.loading       = false;
			this.hasInCart     = cart ? cart.isItemExistsInCart( this.course.id ) : true;
		} );
		this.cartService.onCartChanges.pipe( takeUntil( this.onDestroy$ ) ).subscribe( ( { items } ) => this.hasInCart = items.reduce( ( find , i ) => find || i.course.id === this.course.id , false ) );
	}

	rebuildCart() {
		this.cartService.reInitCart();
	}

	queryCategory( event : Event , id : number ) {
		event.preventDefault();
		event.stopPropagation();
		this.onEvent.emit( {
			name     : 'QUERY_CATEGORY' ,
			course   : this.course as CourseExtend ,
			category : id
		} );
	}

	putEvent( name : CourseInfoEventName , event? : Event ) {
		if ( event ) {
			event.preventDefault();
			event.stopPropagation();
		}
		this.onEvent.emit( {
			name ,
			course   : this.course as CourseExtend ,
			category : 0
		} );
	}

	putItemToCart( event : Event ) {
		event.preventDefault();
		event.stopPropagation();
		if ( !this.hasInCart ) {
			const res : CartActionEvent = this.cart.addToCart( this.course );
			if ( res.success ) {
				this.notification.toastSuccess( 'Đã thêm sản phẩm vào giở hàng' );
			} else {
				this.notification.toastError( res.message );
			}
		}
	}

	showMiniCart( event : Event ) {
		event.preventDefault();
		event.stopPropagation();
		this.cartService.openMiniCart( 'side' );
	}

	ngOnDestroy() : void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
