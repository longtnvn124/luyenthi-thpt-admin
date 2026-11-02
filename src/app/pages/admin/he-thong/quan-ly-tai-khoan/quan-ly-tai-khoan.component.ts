import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { ButtonBase } from "@model/button";
import { ConditionOption } from "@model/condition-option";
import { DonVi } from "@model/danh-muc";
import { IctuQueryCondition } from "@model/dto";
import { OvicTableStructure } from "@model/ovic-models";
import { Role } from "@model/role";
import { User } from "@model/user";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "@service/core/auth.service";
import { DonViService } from "@service/core/don-vi.service";
import { HelperService } from "@service/core/helper.service";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { RoleService } from "@service/core/role.service";
import { UserService } from "@service/core/user.service";
import { TnStudentService } from "@service/luyenthithpt/tn-student.service";
import { NotificationService } from "@theme/services/notification.service";
import { UnsubscribeAndCompleteObserversOnDestroy } from "@utilities/decorator";
import { Paginator } from "primeng/paginator";
import { Subscription, Subject, forkJoin, mergeMap, of, Observable, firstValueFrom, map } from "rxjs";

@Component({
    selector: 'app-quan-ly-tai-khoan',
    templateUrl: './quan-ly-tai-khoan.component.html',
    styleUrls: ['./quan-ly-tai-khoan.component.css'],
})

@UnsubscribeAndCompleteObserversOnDestroy()
export class QuanLyTaiKhoanComponent implements OnInit {

    @ViewChild('tplCreateAccount') tplCreateAccount: TemplateRef<any>;

    formSave: FormGroup;

    isUpdateForm: boolean;

    formTitle: string;

    editUserId: number;

    dsNhomQuyen: Role[] = [];

    data: User[] = [];

    cols: OvicTableStructure[] = [
        {
            fieldType: 'media',
            field: ['avatar'],
            rowClass: 'ovic-img-minimal text-center img-child-max-width-30',
            header: 'Avatar',
            placeholder: true,
            sortable: false,
            headClass: 'ovic-w-90px text-center'
        },
        {
            fieldType: 'normal',
            field: ['username'],
            rowClass: '',
            header: 'Tên tài khoản',
            sortable: false,
            headClass: ''
        },
        {
            fieldType: 'normal',
            field: ['display_name'],
            rowClass: '',
            header: 'Tên hiển thị',
            sortable: false,
            headClass: ''
        },
        {
            fieldType: 'normal',
            field: ['email'],
            rowClass: '',
            header: 'Email',
            sortable: false,
            headClass: ''
        },
        {
            fieldType: 'normal',
            field: ['u_role'],
            innerData: true,
            rowClass: '',
            header: 'Vai trò',
            sortable: false,
            headClass: ''
        }
    ];

    formFields = {
        display_name: ['', Validators.required],
        // username     : [ '' , [ Validators.required , Validators.pattern( '^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$' ) ] ] ,
        username: ['', [Validators.required, Validators.pattern('^\\S*$')]],
        // phone: ['', Validators.required],
        phone: [''],
        email: ['', [Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        donvi_id: [0, Validators.required],
        role_ids: [null, Validators.required],
        status: [1, Validators.required],
    };

    /*
     ^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$
     └─────┬────┘└───┬──┘└─────┬─────┘└─────┬─────┘ └───┬───┘
     │         │         │            │           no _ or . at the end
     │         │         │            │
     │         │         │            allowed characters
     │         │         │
     │         │         no __ or _. or ._ or .. inside
     │         │
     │         no _ or . at the beginning
     │
     username is 3-20 characters long
     */

    canEdit: boolean;

    canAdd: boolean;

    canDelete: boolean;

    isAdmin: boolean;

    changPassState: boolean;

    defaultPass: string;

    highestRoleIdUser: any;

    schoolName = '';

    userDonviId: number;

    subscriptions = new Subscription();

    rightContextMenu: any[] = [
        {
            label: 'Xem trước',
            icon: 'fa fa-eye',
            slug: 'preview'
        },
        {
            label: 'Chi tiết',
            icon: 'fa fa-info-circle',
            slug: 'detail'
        },
        {
            label: 'Tải xuống',
            icon: 'fa fa-cloud-download',
            slug: 'download'
        },
        {
            label: 'Share',
            icon: 'fa fa-share-alt',
            slug: 'shared',
            child: [
                { label: 'Công khai', icon: 'fa fa-globe', slug: 'SharedPublic' },
                { label: 'Trong nhóm', icon: 'fa fa-users', slug: 'sharedGroup' },
                { label: 'Chỉ mình tôi', icon: 'fa fa-lock', slug: 'private' }
            ]
        },
        {
            label: 'Link file',
            icon: 'fa fa-link',
            slug: 'linkFile'
        },
        {
            label: 'Xóa file',
            icon: 'fa fa-trash',
            slug: 'deleteFile'
        }
    ];

    currentRoute = 'he-thong/quan-ly-tai-khoan';

    headButtons = [
        // {
        //     label: 'Import',
        //     name: 'ADD_NEW_ROW_FROM_EXCEL',
        //     icon: 'pi-file-excel pi',
        //     class: 'p-button-rounded p-button-success',
        //     tooltip: 'Thêm mới tài khoản từ file excel',
        //     tooltipPosition: 'left'
        // },
        // {
        //     label: 'Refresh',
        //     name: 'REFRESH_LIST',
        //     icon: 'pi-refresh pi',
        //     class: 'p-button-rounded p-button-secondary ml-3',
        //     tooltip: 'Làm mới danh sách',
        //     tooltipPosition: 'left'
        // },
        {
            label: 'Thêm mới',
            name: 'ADD_NEW_ROW',
            icon: 'pi-plus pi',
            class: 'p-button-success ml-2 mr-2',
            tooltip: 'Thêm tài khoản mới',
            tooltipPosition: 'left'

            // label: 'Thêm môn học mới',
            // name: 'BUTTON_ADD_NEW',
            // icon: 'pi-plus pi',
            // class: 'p-button-success ml-3 mr-2',

        }
    ];

    private _reloadData$ = new Subject<any>();

    @ViewChild('paginator', { static: true }) paginator: Paginator;
    object_condition = {};
    pag_first = 1;
    limit_user = 20;
    total_user = 1;
    list_donvi_chuyenmon: DonVi[];
    list_roles: Role[];
    user_profile_id: number;
    user_role_id: number;
    user_profile_ids = [];
    selected_page: number = 1;
    currentPageFirstIndex: number = 0;
    donvi_chuyenmon_id: number;
    isManager = false;
    addDropdown = true;
    hide: boolean = true;
    isLoading: boolean = false;
    constructor(
        private notificationService: NotificationService,
        private roleService: RoleService,
        private userService: UserService,
        private tnStudentService: TnStudentService,
        private fb: FormBuilder,
        private modalService: NgbModal,
        private auth: AuthService,
        private httpHelper: HttpParamsHeplerService,
        private donViService: DonViService,
        private helperService: HelperService,
    ) {
        this.formSave = this.fb.group(this.formFields);
        this.data = [];
        this.isUpdateForm = false;
        this.formTitle = 'Tạo tài khoản';
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.canEdit = this.auth.userCanEdit(this.currentRoute);
        this.canAdd = this.auth.userCanAdd(this.currentRoute);
        this.canDelete = this.auth.userCanDelete(this.currentRoute);
        this.isAdmin = this.auth.userHasRole('admin') || this.auth.userHasRole('admints_dttx');
        this.isManager = this.auth.userHasRole('uni_leader') || this.auth.userHasRole('admin');
        this.userDonviId = this.auth.user.donvi_id;
        this.f['donvi_id'].setValue(this.userDonviId);
        const actions = [];
        if (this.canEdit) {
            this.cols.push({
                fieldType: 'switch',
                field: ['status'],
                rowClass: 'round text-center',
                header: 'Active',
                sortable: false,
                headClass: 'ovic-w-80px text-center'
            });
            actions.push('edit');
        }
        // if (this.canDelete) {
        //     actions.push('delete');
        // }
        if (actions.length) {
            this.cols.push({
                tooltip: 'tài khoản',
                fieldType: 'actions',
                field: actions,
                rowClass: 'text-center',
                header: 'Thao tác',
                sortable: false,
                headClass: 'ovic-w-120px text-center'
            });
        }
        this.loadRolesValid();
    }

    loadRolesValid() {
        const condition = this.httpHelper.paramsConditionBuilder([
            { conditionName: 'status', condition: IctuQueryCondition.notEqual, value: '-1', orWhere: 'and' },
        ]).set("select", "id,title").set("limit", -1).set("orderby", "ordering").set("order", "ASC")

        const condition_donvi = this.httpHelper.paramsConditionBuilder([
            { conditionName: 'status', condition: IctuQueryCondition.notEqual, value: '-1', orWhere: 'and' },
            { conditionName: 'parent_id', condition: IctuQueryCondition.equal, value: this.userDonviId.toString(), orWhere: 'and' },
        ]).set("limit", -1)

        forkJoin([
            this.roleService.getRolesByCols(condition),
            this.donViService.getDonViByCols(condition_donvi),
            this.donViService.getDonViById(this.userDonviId),
        ]).subscribe({
            next: ([_resRoles, _resDonvi, _resUserDonvi]) => {
                this.dsNhomQuyen = _resRoles;

                this.list_donvi_chuyenmon = _resDonvi;
                this.list_roles = _resRoles;


                // this.schoolName = _resUserDonvi.title;
                this.loadPageEvent(1);

            },
            error: () => {
                this.notificationService.isProcessing(false);
                this.notificationService.toastError('Load dữ liệu không thành công');
            }
        })
    }

    loadPageEvent(page) {
        
        const option: ConditionOption = {
            condition: [{ conditionName: 'role_ids', condition: IctuQueryCondition.notLike, value: '%"'.concat(this.auth.user.role_ids[0], '"%'), orWhere: 'and' }],
            // 
            set: [],
            page: page
        }
        const role_ids = []
        // this.auth.user.role_ids[0]
        this.dsNhomQuyen.forEach(f => {
            role_ids.push(f.id);
        })

        const arr_condition_profile = [
            { conditionName: 'teacher', condition: IctuQueryCondition.equal, value: '1', orWhere: 'and' },
        ]

        const filter_label_like = ['display_name', 'email', 'username', 'phone','role_ids'];
        
        Object.keys(this.object_condition).forEach(f => {
            const index_label = filter_label_like.findIndex(i => i === f);
            
            if (index_label !== -1) {
                option.condition.push({ conditionName: f, condition: IctuQueryCondition.like, value: '%'.concat(this.object_condition[f], '%'), orWhere: 'and' })
            } else {
                option.condition.push({ conditionName: f, condition: IctuQueryCondition.equal, value: this.object_condition[f], orWhere: 'and' })
            }
        })

        if (role_ids.length) {
            option.set.push({ label: 'role_ids', value: role_ids.toString() });
        }

        if (this.user_profile_ids.length) {
            option.set.push({ label: "include", value: this.user_profile_ids.toString() });
            option.set.push({ label: "include_by", value: "id" });
        }

        this.userService.getUserByPageNew(option).subscribe({
            next: (_user) => {
                this.total_user = _user.recordsFiltered;
                const start = (page - 1) * 20;
                _user.data.map((u, key) => {
                    const uRoles = [];
                    u['index_'] = start + key + 1;
                    if (u.role_ids && u.role_ids.length) {
                        u.role_ids.forEach(r => {
                            const index = r ? this.dsNhomQuyen.findIndex(i => i.id === parseInt(r, 10)) : -1;
                            if (index !== -1) {
                                uRoles.push('<span class="--user-role-label --role-">' + this.dsNhomQuyen[index].title + '</span>');
                            }
                        }, []);
                    }
                    u.avatar = '/assets/images/404.png'
                    u['u_role'] = uRoles.join(', ');
                    return u;
                });
                this.data = _user.data;

                this.notificationService.isProcessing(false);
                this.isLoading = false;
            },
            error: () => {
                this.notificationService.isProcessing(false);
                this.notificationService.toastError('Load dữ liệu không thành công');
            }
        })
    }

    editUser(id) {
        this.changPassState = false;
        const user = this.data.find(u => u.id === id);

        if (user) {

            // this.f['role_ids'].setValue(this.dsNhomQuyen.filter(q => q.id === user.role_ids.map(i => i)));

            this.editUserId = id;
            this.isUpdateForm = true;
            this.formTitle = 'Cập nhật tài khoản';
            this.f['display_name'].setValue(user.display_name);
            this.f['username'].setValue(user.username);
            this.f['phone'].setValue(user.phone === user.email ? '' : user.phone);
            this.f['email'].setValue(user.email);
            this.f['password'].setValue(user.password);
            this.f['donvi_id'].setValue(user.donvi_id);
            this.f['role_ids'].setValue(user.role_ids.toString());
            this.f['status'].setValue(user.status);
            this.defaultPass = user.password;
            this.notificationService.openSideNavigationMenu({ template: this.tplCreateAccount, size: 700, offsetTop: '0px' });
        }
    }

    switchEvent(id) {
        this.notificationService.isProcessing(true);
        const index = this.data.findIndex(dt => dt.id === id);
        if (index !== -1) {
            const status = this.data[index].status ? 0 : 1;
            const username = this.data[index].username;
            this.userService.updateUserS(id, { status: status }).subscribe({
                next: () => {
                    this.data[index].status = status;
                    this.closeForm();
                    this.notificationService.toastSuccess('Thay đổi trạng thái tài khoản thành công');
                },
                error: () => this.notificationService.toastError('Thay đổi trạng thái thất bại')
            });

            // this.tnStudentService.updateTnStudent()


        }
    }


    async deleteUser(id) {
        this.notificationService.toastWarning("Chức năng này đang tạm khoá!")
       
    }

    async creatUser(frmTemplate) {
        this.changPassState = true;
        this.isUpdateForm = false;
        this.formTitle = 'Tạo tài khoản';
        this.resetForm(this.formSave);
        this.f['status'].setValue(1);

        this.notificationService.openSideNavigationMenu({ template: this.tplCreateAccount, size: 700, offsetTop: '0px' });
    }

    get f() {
        return this.formSave.controls;
    }

    passwordValidator(password) {


        if (!password || !password.trim().match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?!.*?[\s])(?=.*?[#?!@$%^&*-]).{8,30}$/)) {
            return false;
        }

        return true;

    }

    taoTaiKhoan(form: FormGroup) {
   

        
        if(!this.formSave.controls['donvi_id'].value){
            this.formSave.controls['donvi_id'].setValue(this.auth.user.donvi_id);
        }
        // return;
        this.notificationService.isProcessing(true);
        if (this.passwordValidator(form.value.password)) {
            if (form.valid) {
                const data = { ...form.value };

                data['phone'] = data['phone'] && data['phone'].trim() && data['phone'].trim().length !== 0 ? data['phone'] : data['email'];
                // data.role_ids = data.role_ids.split(',').map(elm => parseInt(elm, 10));
                const role_ids = data.role_ids = data.role_ids.split(',').map(elm => parseInt(elm, 10));
                delete data.role_ids;
                this.userService.create(data).pipe(mergeMap((_res_) => {
                    return this.userService.addRoles(_res_, role_ids).pipe(mergeMap(() => {
                        return of(_res_)
                    }))
                })).subscribe({
                    next: () => {
                        this.notificationService.isProcessing(false);
                        this.notificationService.toastSuccess('Thêm mới tài khoản thành công');
                    },
                    error: () => {
                        this.notificationService.isProcessing(false);
                        this.notificationService.toastError('Thêm mới tài khoản thất bại');

                    }
                });

            }
            else {
                if (form.get('role_ids').invalid) {
                    this.notificationService.isProcessing(false);
                    return this.notificationService.toastInfo('Chọn nhóm quyền cho tài khoản');
                }
                if (form.get('email').invalid) {
                    this.notificationService.isProcessing(false);
                    return this.notificationService.toastInfo('Email chưa đúng định dạng');
                }
                form.markAllAsTouched();
                this.notificationService.isProcessing(false);
                this.notificationService.toastError('Vui lòng kiểm tra lại', 'Lỗi nhập liệu');
            }

        }
        else {
            this.notificationService.isProcessing(false);
            this.notificationService.toastError('Vui lòng kiểm tra lại mật khẩu', 'Lỗi nhập liệu');
        }
    }

    capNhatTaiKhoan(form: FormGroup) {


        // this.getRoleIdsValue();

        if (form.valid) {
            const data = { ...form.value };

            if (!this.changPassState) {
                delete data.password;
            } else {
                if (!this.passwordValidator(data.password)) {
                    this.notificationService.toastError('Vui lòng kiểm tra lại mật khẩu', 'Lỗi nhập liệu');
                    return;
                }
            }
            const currentUser = this.data.find(u => u.id === this.editUserId);

            if (!currentUser) { return; }

            if (currentUser.email === data.email) {
                delete data.email;
            }

            if (currentUser.phone === data.phone) {
                delete data.phone;
            }

            const donvi_chuyenmon_id = data.donvi_chuyenmon_id && data.donvi_chuyenmon_id !== '' ? data.donvi_chuyenmon_id : 0;
            const role_ids = data.role_ids.split(",");
            delete data.role_ids;
            const bomon_id = data.bomon_id && data.bomon_id !== '' ? data.bomon_id : 0;
            delete data.donvi_chuyenmon_id;
            delete data.bomon_id;



            let request: Observable<any> = null;
            // if (!this.user_profile_id) {
            //     const data_: ElngUserProfile = {
            //         user_id: this.editUserId,
            //         student_code: data.username,
            //         full_name: data.display_name,
            //         full_name_slug: this.helperService.slugVietnamese(data.display_name),
            //         name: data.display_name.split(" ")[data.display_name.split(" ").length - 1],
            //         birthday: null,
            //         gender: null,
            //         address: null,
            //         social_link: null,
            //         donvi_chuyenmon_id: donvi_chuyenmon_id && donvi_chuyenmon_id !== '' ? donvi_chuyenmon_id : 0,
            //         created_by: this.auth.user.id,
            //         updated_by: this.auth.user.id,
            //         teacher: 1,
            //         bomon_id: bomon_id && bomon_id !== '' ? bomon_id : 0,
            //     }

            //     request = this.elngUserProfileService.addElngUserProfile(data_);
            // } else {
            //     request = this.elngUserProfileService.updateElngUserProfile(this.user_profile_id, { donvi_chuyenmon_id: donvi_chuyenmon_id, bomon_id: bomon_id })
            // }

            forkJoin([
                this.userService.updateUserS(this.editUserId, data),
                // this.userService.addRoles(this.editUserId, role_ids)
                this.userService.deleteRoles(this.editUserId, currentUser.role_ids).pipe(mergeMap(() => {
                    return this.userService.addRoles(this.editUserId, role_ids).pipe(mergeMap(() => {
                        return of(null)
                    }))
                })),
                // request
            ]).subscribe({
                next: () => {
                    this.notificationService.toastSuccess('Cập nhật tài khoản thành công');
                    this.closeForm();
                },
                error: () => this.notificationService.toastError('Cập nhật tài khoản thất bại')
            });
        } else if (form.get('role_ids').invalid) {
            return this.notificationService.toastInfo('Chọn nhóm quyền cho tài khoản');
        }
    }

    resetForm(form: FormGroup) {
        form.reset({ role_ids: null, status: 1 });
        this.dsNhomQuyen.forEach(f => {
            f['checked'] = false;
        })
        // this.f['don_vi'].setValue(this.list_donvi_chuyenmon && this.list_donvi_chuyenmon.length ? this.list_donvi_chuyenmon[0].id : 0);
        this.user_profile_id = null;
    }

    clickChangedPass() {
        const state = this.changPassState;
        this.changPassState = !state;
        if (!this.changPassState) {
            this.f['password'].setValue(this.defaultPass);
        }
    }

    menuItemClick(event: MouseEvent, data) {
        event.preventDefault();
        event.stopPropagation();
    }

    rClick(data) {
    }

    creatUserChangeActive(value: number) {
        this.f['status'].setValue(value);
    }

    userActions(btn: ButtonBase) {

        switch (btn.name) {
            case 'DELETE':
                void this.deleteUser(btn.data);
                break;
            case 'EDIT':
                this.editUser(btn.data);
                break;
            case 'ADD_NEW_ROW':
                // this.getAllTeacher();
                void this.creatUser(this.tplCreateAccount);
                break;
            case 'SWITCH':
                this.switchEvent(btn.data);
                break;
            case 'ADD_NEW_ROW_FROM_EXCEL':
                break;
            case 'REFRESH_LIST':
                this.triggerReloadData();
                break;
            default:
                break;
        }
    }

    triggerReloadData() {
        this._reloadData$.next('');
    }

    // async loadRolesUserCanSet(): Promise<{ roles: Role[], error: boolean }> {
    //     const userRoleIds = this.auth.user.role_ids;
    //     if (Array.isArray(userRoleIds) && userRoleIds.length > 1) {
    //         const u = userRoleIds.map(u => parseInt(u, 10));
    //         const min = Math.min(...u);
    //         const s = u.filter(e => e !== min);
    //         this.notificationService.startLoading();
    //         try {
    //             const error = false;
    //             const roles = await firstValueFrom(this.roleService.listRolesFiltered(s.join(','), 'id,title,realm').pipe(map(r => r.filter(r => r.realm === APP_CONFIGS.realm))));
    //             this.notificationService.stopLoading();
    //             return Promise.resolve({ error, roles });
    //         } catch (e) {
    //             this.notificationService.stopLoading();
    //             return Promise.resolve({ error: true, roles: [] });
    //         }
    //     } else {
    //         return Promise.resolve({ error: false, roles: [] });
    //     }
    // }

    onPageChangeUser(event) {
        
        this.selected_page = event.page ? event.page + 1 : 1;
        this.currentPageFirstIndex = event.first;
        this.isLoading = true;
        this.loadPageEvent(this.selected_page);
    }

    onFirstPageLoad() {
        // if (!this.paginator.empty()) {
        //     this.paginator.changePage(0);
        // } else {

        
        
        this.notificationService.isProcessing(true);
        if (this.selected_page) {
            this.loadPageEvent(this.selected_page);
        } else {
            this.loadPageEvent(1);
        }

        // }
    }

    onChangeDropdownEvent(event: DonVi) {
        // return;
        this.selected_page = 1;
        this.currentPageFirstIndex = 0;
        if (event) {
            // this.object_condition['donvi_id'] = event.id;
            this.object_condition['role_ids'] = event.id;
        } else {
            delete this.object_condition['role_ids'];
        }
        this.onFirstPageLoad();

    }

    onSearchUser(event) {
        
        if (event) {
            this.object_condition['display_name'] = event;
        } else {
            delete this.object_condition['display_name'];
        }
        this.onFirstPageLoad();
    }

    closeForm() {
        this.notificationService.closeSideNavigationMenu();
        this.onFirstPageLoad();
    }

    onChangeCheckRole(event: MatCheckboxChange, role: Role) {
        role['checked'] = event.checked;
    }

    getRoleIdsValue() {
        const id_role = [];
        this.dsNhomQuyen.forEach(f => {
            if (f['checked']) {
                id_role.push(f.id.toString());
            }
        })
        this.f['role_ids'].setValue(id_role);
    }

    getAllTeacher() {
        const data = [];
        this.loopUserStudent(data, 1, 1000)
    }

    loadBomon(event) {
        const arr_condition = [
            { conditionName: 'type', condition: IctuQueryCondition.equal, value: 'bomon', orWhere: 'and' },
            // { conditionName: 'donvi_chuyenmon_id', condition: IctuQueryCondition.equal, value: event.id.toString(), orWhere: 'and' }
        ]
        // const condition_nganh = this.httpHelper.paramsConditionBuilder(arr_condition).set('limit', '-1');
        // this.elnChuyenMucService.getElnChuyenMucByCols(condition_nganh).subscribe({
        //     next: (_nganh_bomon) => {
        //         this.list_bomon = _nganh_bomon;
        //     },
        //     error: () => {

        //     }
        // })
    }


    loopUserStudent(data, page, count) {
        // if (data.length < count) {
        //     const option: ConditionOption = {
        //         condition: [{ conditionName: 'student_code', condition: IctuQueryCondition.equal, value: 'adminift@gmail.com', orWhere: 'and' }],
        //         set: [
        //             // { label: "role_ids", value: "65" }
        //         ],
        //         page: page
        //     }

        //     this.elngUserProfileService.getElngUserProfileByCol('student_code', 'adminift@gmail.com').subscribe({
        //         next: (_resUser) => {
        //             let i = 0;
        //             // this.loopUpdateUser(_resUser[i + 1], _resUser, 0);
        //             // this.loopUserStudent(data.concat(_resUser.data), page + 1, _resUser.recordsFiltered);
        //             this.notificationService.isProcessing(false);
        //         }, error: () => {
        //             this.notificationService.isProcessing(false);
        //             this.notificationService.toastError('Load dữ liệu không thành công');
        //         }
        //     })
        // } else {
        // let i = 0;
        // const data_ = [];
        // data_[i] = [];
        // data.forEach(f => {
        //     if (data_[i].length < 6) {
        //         data_[i].push(f);
        //     } else {
        //         i = i + 1;
        //         data_[i] = [];
        //         data_[i].push(f);
        //     }
        // })

        // this.loopUpdateUser(data_[0], data_, 0);
        // }
    }

    loopUpdateUser(data: User[], datas, i) {
        // if (i < datas.length) {
        //     const request: Observable<any>[] = [];
        //     data.forEach(u => {
        //         let username = u.username;
        //         const index = u.username.indexOf('@');
        //         if (index !== -1) {
        //             username = u.username.split('@')[0];
        //         }
        //         request.push(this.userService.updateUserS(u.id, { username: username.toLowerCase() }));
        //     })
        //     if (request.length) {
        //         forkJoin(request).subscribe({
        //             next: () => {
        //                 this.loopUpdateUser(datas[i + 1], datas, i + 1)
        //             },
        //             error: () => {
        //                 this.loopUpdateUser(datas[i + 1], datas, i + 1)
        //             }
        //         })
        //     } else {
        //         this.loopUpdateUser(datas[i + 1], datas, i + 1)
        //     }
        // }
    }

}
