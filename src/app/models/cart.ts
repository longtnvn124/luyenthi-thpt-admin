import { Course } from '@model/course';
import { Order } from '@model/order';
import { Observable , Subject } from 'rxjs';

export type CartChangeEvent = Pick<Cart , 'items' | 'order' | 'templateTotalAmount' | 'total' | 'totalAmount'>;

export interface CartActionEvent {
	success : boolean;
	message : string;
}

export class Cart {

	private _total : number; // number of total items in cart

	get total() : number {
		return this._total;
	}

	private _totalAmount : number;

	get totalAmount() : number {
		return this._totalAmount;
	}

	private _templateTotalAmount : string;

	get templateTotalAmount() : string {
		return this._templateTotalAmount;
	}

	private _items : CartItem[];

	get items() : CartItem[] {
		return [ ... this._items.map( u => Object.seal( u ) ) ];
	}

	private _order : Order;

	get order() : Order {
		return this._order;
	}

	private observeChanges : Subject<CartChangeEvent> = new Subject<CartChangeEvent>();

	get onChanges() : Observable<CartChangeEvent> {
		return this.observeChanges.asObservable();
	}

	constructor( courses : Course[] ) {
		this._items = courses.map<CartItem>( course => new CartItem( course ) );
		this.__cartChanges();
	}

	private __cartChanges( trigger : boolean = false ) {
		this._total               = this.items.length;
		this._totalAmount         = this.items.reduce( ( total , item ) => total + item.getLastPrice() , 0 );
		this._templateTotalAmount = '<div class="wrap-price wrap-price--total-amount"><bdi>' + showPrice( this.totalAmount ) + '</bdi></div>';
		if ( trigger ) {
			this.observeChanges.next( {
				order               : this.order ,
				items               : this.items ,
				total               : this.total ,
				totalAmount         : this.totalAmount ,
				templateTotalAmount : this.templateTotalAmount
			} );
		}
	}

	addToCart( course : Course ) : CartActionEvent {
		const state : CartActionEvent = { success : false , message : '' };
		if ( this.isItemExistsInCart( course.id ) ) {
			state.success = false;
			state.message = 'Khóa học đã tồn tại trong giỏ hàng';
		} else {
			this._items.push( new CartItem( course ) );
			state.success = true;
			state.message = 'Thêm khóa học vào giỏ hàng thành công';
			this.__cartChanges( true );
		}
		return state;
	}

	removeItem( courseId : number ) : CartActionEvent {
		const state : CartActionEvent = { success : false , message : '' };
		if ( this.isItemExistsInCart( courseId ) ) {
			this._items = this._items.filter( item => courseId !== item.course.id );
			this.__cartChanges( true );
			state.success = true;
			state.message = 'Xóa khóa học thành công';
		} else {
			state.success = false;
			state.message = 'Khóa học không tồn tại trong giỏ hàng';
		}
		return state;
	}

	clear() : CartActionEvent {
		this._items = [];
		this.__cartChanges( true );
		return { success : true , message : '' };
	}

	isItemExistsInCart( id : number ) : boolean {
		return this.items.findIndex( item => item.course.id === id ) !== -1;
	}
}

export const showPrice : ( price : number ) => string = ( price : number ) : string => {
	return price.toLocaleString( 'vi-VN' , { style : 'currency' , currency : 'VND' } );
};

export class CartItem {

	private readonly _course : Course;

	get course() : Course {
		return this._course;
	}

	constructor( course : Course ) {
		this._course = course;
	}

	get isSale() : boolean {
		return this.course ? this.course.sale_price !== this.course.price : false;
	}

	get title() : string {
		return this.course ? this.course.title : '';
	}

	get templatePrice() : string {
		return this.course ? this.isSale ? '<div class="wrap-price wrap-price--sale"><del><bdi>' + this.show( this.course.price ) + '</bdi></del><ins><bdi>' + this.show( this.course.sale_price ) + '</bdi></ins></div>' : '<div class="wrap-price"><bdi>' + this.show( this.course.sale_price ) + '</bdi></div>' : '';
	}

	get templateOrgPrice() : string {
		return '<div class="wrap-price wrap-price--sale"><bdi>' + this.show( this.course.price ) + '</bdi></div>';
	}

	get templateSalePrice() : string {
		return '<div class="wrap-price wrap-price--sale"><bdi>' + this.show( this.course.sale_price ) + '</bdi></div>';
	}

	getLastPrice() : number {
		return this.course.sale_price;
	}

	get templateLastPrice() : string {
		return '<div class="wrap-price wrap-price--sale"><bdi>' + this.show( this.getLastPrice() ) + '</bdi></div>';
	}

	private show( price : number ) : string {
		return showPrice( price );
	}
}

export interface Coupon {
	id : number,
	code : string;
	desc : string;
	amount : number, 		// Value of the coupon (unit vnd)
	applied_date : string;  // Ngày bắt đầu áp dụng
	expiry_date : string;   // Ngày hết hạn
	usage_limits : number,  // Giới hạn số lượng coupon
	course_ids : string;    // ids của course áp dụng
	created_by : number,
	is_deleted : number,
	deleted_by : number,
	created_at : string;
	updated_at : string;
}

export interface CartStored {
	items : number[];
}
