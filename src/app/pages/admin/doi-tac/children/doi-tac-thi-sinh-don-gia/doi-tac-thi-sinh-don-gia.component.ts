import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ComponentBaseState,
  IctuBasePermissionClass,
  IctuDropdownField,
  IctuDropdownOption,
  IctuTableComponent,
} from '@model/commons';

import { Sidebar, SidebarModule } from 'primeng/sidebar';

import { IctuFormControl } from '@model/ictu-form-control';
import {
  DataTableEvent,
  DataTableEventName,
  IctuDataTable,
} from '@model/ictu-data-table';
import { filter, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { NotificationService } from '@appNotification';
import { IctuDeleteAnimationControl } from '@model/ictu-delete-animation-control';
import { DtoObject } from '@model/dto';
import { MonHocService } from '@service/luyenthithpt/mon-hoc.service';
import { InputTextModule } from 'primeng/inputtext';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IctuPaginatorComponent } from '@theme/components/ictu-paginator/ictu-paginator.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { HelperService } from '@service/core/helper.service';
import { DropdownModule } from 'primeng/dropdown';
import { DotThi } from '@model/dotthi';
import { DotThiService } from '@service/luyenthithpt/dotthi.service';
import { DoiTacService } from '@service/luyenthithpt/doi-tac.service';
import { DoiTac } from '@model/doi-tac';
import { MatMenuModule } from '@angular/material/menu';
import { DoiTacThiSinhComponent } from '../doi-tac-thi-sinh/doi-tac-thi-sinh.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
type ModeCaThiDoiTac = 'listDF' | 'single';
@Component({
  selector: 'app-doi-tac-thi-sinh-don-gia',
  templateUrl: './doi-tac-thi-sinh-don-gia.component.html',
  styleUrls: ['./doi-tac-thi-sinh-don-gia.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    SidebarModule,
    InputTextModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    IctuPaginatorComponent,
    ReactiveFormsModule,
    InputTextareaModule,
    DropdownModule,
    MatMenuModule,
   
  ],
})
export class DoiTacThiSinhDonGiaComponent
  extends IctuBasePermissionClass
  implements OnInit, OnDestroy, IctuTableComponent<DotThi>
{
  readonly optionStates: IctuDropdownOption<number>[] = [
    { value: 0, label: 'Không kích hoạt' },
    { value: 1, label: 'Kích hoạt' },
  ];
private readonly dotthiService: DotThiService =
    inject<DotThiService>(DotThiService);
  dotthiDropdownField: IctuDropdownField = new IctuDropdownField(
    this.dotthiService.loadOptions(),
    'Lọc theo môn'
  );
  subjectSelect: number = 0;
  private readonly service: DotThiService =
    inject<DotThiService>(DotThiService);
  private readonly doitacService: DoiTacService =
    inject<DoiTacService>(DoiTacService);
  private readonly notification: NotificationService =
    inject<NotificationService>(NotificationService);

  private readonly helperService: HelperService =
    inject<HelperService>(HelperService);

  readonly state: WritableSignal<ComponentBaseState> =
    signal<ComponentBaseState>('loading');

  private readonly fb: FormBuilder = inject(FormBuilder);

  search: string = '';

  readonly formControl: IctuFormControl<DotThi>;

  private readonly formGroup: FormGroup = this.fb.group({});

  @ViewChild(Sidebar, { static: true }) _sidebar: Sidebar;

  dataTable: IctuDataTable<DotThi> = new IctuDataTable<DotThi>();

  private readonly eventObserver$: Subject<DataTableEvent<DotThi>> =
    new Subject<DataTableEvent<DotThi>>();

  private readonly onDestroy$: Subject<string> = new Subject<string>();

  private readonly handelEvent: Record<
    DataTableEventName,
    (data: DotThi) => void
  > = {
    OPEN_FORM_ADD: (): void => {},
    OPEN_FORM_UPDATE: (data: DotThi): void => {},
    DELETE_SINGLE_ROW: ({ id }: DotThi): void => {},
    DELETE_SELECTED_ROWS: (): void => {},
    SUBMIT_FORM: (): void => {
      if (this.formControl.canSubmit) {
      }
    },
  };

  private _temp: { paged: number; resetPaginator: boolean } = {
    paged: 1,
    resetPaginator: true,
  };
  dotthi :any;
  mode: WritableSignal<ModeCaThiDoiTac> = signal<ModeCaThiDoiTac>('listDF');
  setMode(mode: ModeCaThiDoiTac, dotthi: any) {
    switch (mode) {
      case 'listDF':
        this.mode.set('listDF');
        break;
      case 'single':
        this.mode.set('single');
        this.dotthi = dotthi;
        break;
    }
  }
  updateMode(event: { mode: ModeCaThiDoiTac }) {
    this.mode.set(event.mode);
  }
  getIds(list: any[]) {
    return Array.from(new Set(list.map((item) => item.form_id))).join(',');
  }
  constructor() {
    super('dot-thi');
    this.formControl = new IctuFormControl({
      formGroup: this.formGroup,
      objectName: 'đợt thi',
      dropdownFields: [],
      sidebar: this._sidebar,
    });

    this.eventObserver$
      .asObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(({ name, data }: DataTableEvent<DotThi>): void =>
        this.handelEvent[name](data)
      );

    // this.formField('name')
    //   .valueChanges.pipe(
    //     takeUntil(this.onDestroy$),
    //     filter(
    //       (): boolean =>
    //         !this.formField('id').value && this.formField('id').valid
    //     )
    //   )
    //   .subscribe((value: string): void => {
    //     this.formField('slug').setValue(
    //       value ? this.helperService.sanitizeVietnameseTitle(value) : ''
    //     );
    //     this.formField('slug').markAsTouched();
    //   });
  }
  formatDateHTML(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN');
  }
  ngOnInit(): void {
    this.loadData(1, true);
  }

  formField(name: keyof DotThi): AbstractControl {
    return this.formControl.formGroup.get(name);
  }

  onDrawerHide(): void {
    if (this.formControl.submitted) {
      this.loadData(1, true);
    }
  }

  private requestDeletingData(ids: number[]): void {
    // this.notification.confirmDelete2( ids.length ).pipe(
    //   filter( ( confirm : boolean ) : boolean => confirm ) ,
    //   map( () : IctuDeleteAnimationControl<DotThi> => new IctuDeleteAnimationControl( ids , this.service ) ) ,
    //   switchMap( ( deleteController : IctuDeleteAnimationControl<DotThi> ) : Observable<boolean> => {
    //     deleteController.run();
    //     return this.notification.startDeleting( deleteController.progress );
    //   } )
    // ).subscribe( {
    //   next  : ( success : boolean ) : void => {
    //     if ( success ) {
    //       this.notification.toastSuccess( 'Xóa thành công' );
    //     }
    //     this.loadData( 1 , true );
    //   } ,
    //   error : () : void => {
    //     this.notification.toastError( 'Xóa thất bại' );
    //   }
    // } );
  }

  dataTableDoiTac: IctuDataTable<DoiTac> = new IctuDataTable<DoiTac>();

  donvi_id: number = 0;
  get UserId(): number {
    return this.auth.user.id;
  }

  loadData(paged: number = 1, resetPaginator: boolean = true): void {
    this.state.set('loading');
    this._temp = { paged, resetPaginator };

    this.doitacService.load(this.UserId).subscribe({
      next: (res: DtoObject<DoiTac[]>): void => {
        const data = resetPaginator
          ? this.dataTableDoiTac.paginator.setupPaginator(res)
          : (this.dataTableDoiTac.paginator.changePage(paged), res.data);

        this.dataTableDoiTac.fillData(data);

        if (this.dataTableDoiTac.data().length > 0) {
          this.donvi_id = this.dataTableDoiTac.data()[0].donvi_id;

          this.service
            .load(this.search, this.donvi_id, {
              limit: this.dataTable.paginator.rows(),
              paged,
            })
            .subscribe({
              next: (res: DtoObject<DotThi[]>): void => {
                const data = resetPaginator
                  ? this.dataTable.paginator.setupPaginator(res)
                  : (this.dataTable.paginator.changePage(paged), res.data);
                this.dataTable.fillData(data);
                this.state.set('success');
              },
              error: (err): void => {
                this.state.set('error');
              },
            });
        }
      },
      error: (err): void => {
        console.error(err);
      },
    });
  }

  deleteRow(data: DotThi): void {
    this.eventObserver$.next({ name: 'DELETE_SINGLE_ROW', data });
  }

  deleteSelectedRows(): void {
    this.eventObserver$.next({ name: 'DELETE_SELECTED_ROWS', data: null });
  }

  editRow(data: DotThi): void {
    this.eventObserver$.next({ name: 'OPEN_FORM_UPDATE', data });
  }

  reload(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.loadData(this._temp.paged, this._temp.resetPaginator);
  }

  addNewItem(): void {
    this.eventObserver$.next({ name: 'OPEN_FORM_ADD', data: null });
  }

  submitForm(): void {
    this.eventObserver$.next({ name: 'SUBMIT_FORM', data: null });
  }

  onChangePage(paged: number): void {
    this.loadData(paged, false);
  }

  onSearchData(): void {
    this.loadData(1, true);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next('OnDestroy');
    this.onDestroy$.complete();
  }

  identify(_: number, subject: DotThi): number | string {
    return subject.id;
  }
}
