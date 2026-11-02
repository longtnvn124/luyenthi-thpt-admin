import { Component , Input , OnChanges , OnDestroy , SimpleChanges } from "@angular/core";
import { Location , LocationStrategy } from "@angular/common";
import { NavigationItem } from "@theme/types/navigation";
import { NotificationService } from "@appNotification";
import { AuthService } from "@service/core/auth.service";
import { Subject , takeUntil } from "rxjs";
import { PickRole } from "@model/role";
import { User } from "@model/user";

@Component( {
	selector    : "app-vertical-menu" ,
	templateUrl : "./vertical-menu.component.html" ,
	styleUrls   : [ "./vertical-menu.component.scss" ]
} )
export class VerticalMenuComponent implements OnDestroy , OnChanges {

	@Input() menus : NavigationItem[];

	userDisplay : string = "unknown";

	roleName : string = "unknown";

	avatar : string = "assets/images/user/avatar-2.jpg";

	private onDestroy$ : Subject<string> = new Subject<string>();

	dashboardMenu : NavigationItem[] = [];

	/*********************************************
	 * => session: Ngân hàng
		   - Danh sách môn học
		  - Quản lý ngân hàng câu hỏi
		  - Form đề thi
		  - Ca thi
	 */
	bankMenu : NavigationItem[] = [];

	/*********************************************
		   => session: quản lý thi
		   - Theo dõi ca thi
		   - Kết quả thi
		   - Xem bài thi
	 */
	shiftMenu : NavigationItem[] = [];

	/*********************************************
      => session: Thanh toán
      - Đơn giá
      - Lịch sử thanh toán
	 */
	paymentMenu : NavigationItem[] = [];

	systemMenu : NavigationItem[] = [];

	/*********************************************
		=> session: Đối tác
		- quản lý
		- Quản lý tài khoản
		- Thông tin tài khoản
	 */
	doitacMenu : NavigationItem[] = [];

	/*********************************************
		=> session: Giảng viên
		- Chấm thi
		- Kết quả chấm
	 */
	teacher : NavigationItem[] = [];

	/*********************************************
		=> session: Giảng viên
		- Chấm thi
		- Kết quả chấm
	 */
	assignments : NavigationItem[] = [];

	constructor (
		private location : Location ,
		private locationStrategy : LocationStrategy ,
		private notification : NotificationService ,
		private auth : AuthService
	) {
		this.auth.onUserSetup.pipe( takeUntil( this.onDestroy$ ) ).subscribe( ( user : User ) : void => {
			this.userDisplay = user.display_name;
			this.avatar      = user.avatar;
		} );

		this.roleName = this.auth.permission.data.roles.find( ( dt : PickRole ) : string => dt.name ).title;
	}

	ngOnChanges ( changes : SimpleChanges ) : void {
		if ( changes[ "menus" ] ) {
			this.handleMenus();
		}
	}

	handleMenus () : void {
		this.menus.forEach( ( item : NavigationItem ) : void => {
			switch ( true ) {
				case  ( item.id === "dashboard" ):
					this.dashboardMenu.push( item );
					break;
				case ( item.id.startsWith( 'giao-vien' ) ):
					this.teacher.push( item );
					break;
				case ( item.id.startsWith( 'ngan-hang/' ) || [ "mon-hoc" , "form-de-thi" ].includes( item.id ) ) :
					this.bankMenu.push( item );
					break;
				case ( [ 'phan-quyen-cham-thi' , 'ket-qua-cham-thi' ].includes( item.id ) ):
					this.assignments.push( item );
					break;
				case ( [ 'dot-thi' , "theo-doi-ca-thi" , "ket-qua-thi" , "xem-bai-thi" , 'ca-thi' , 'danh-sach-thi-sinh' , 'thong-ke' ].includes( item.id ) ):
					this.shiftMenu.push( item );
					break;
				case ( [ "quan-ly-thi-sinh" , "he-thong" ].includes( item.id ) ):
					this.systemMenu.push( item );
					break;
				case ( [ "goi-dich-vu" , "lich-su-thanh-toan" , "khuyen-mai" ].includes( item.id ) ):
					this.paymentMenu.push( item );
					break;
				case item.id === 'danh-sach-doi-tac' :
					this.doitacMenu.push( item );
					break;
				case ( item.id.startsWith( 'doi-tac' ) ):
					this.doitacMenu.push( item );
					break;
			}
		} );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( "" );
		this.onDestroy$.complete();
	}

	fireOutClick () : void {
		let current_url : string = this.location.path();
		const baseHref : string  = this.locationStrategy.getBaseHref();
		if ( baseHref ) {
			current_url = baseHref + this.location.path();
		}
		const link : string = "a.nav-link[ href='" + current_url + "' ]";
		const ele : Element = document.querySelector( link );
		if ( ele !== null && ele !== undefined ) {
			const parent : HTMLElement      = ele.parentElement;
			const up_parent : HTMLElement   = parent?.parentElement?.parentElement;
			const last_parent : HTMLElement = up_parent?.parentElement;
			if ( parent?.classList.contains( "coded-hasmenu" ) ) {
				parent.classList.add( "coded-trigger" );
				parent.classList.add( "active" );
			}
			else if ( up_parent?.classList.contains( "coded-hasmenu" ) ) {
				up_parent.classList.add( "coded-trigger" );
				up_parent.classList.add( "active" );
			}
			else if ( last_parent?.classList.contains( "coded-hasmenu" ) ) {
				last_parent.classList.add( "coded-trigger" );
				last_parent.classList.add( "active" );
			}
		}
	}

	confirmLogout () : void {
		this.notification.confirmSignOut();
	}
}
