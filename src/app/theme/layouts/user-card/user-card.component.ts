import { Component, OnInit } from '@angular/core';
import { AuthService } from '@service/core/auth.service';
import { SharedModule } from '@sharedModule';
import { Subject, takeUntil } from 'rxjs';
import { SafeUrlPipe } from "../../../pipes/safe-url.pipe";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css'],
  standalone: true,
  imports: [SharedModule, SafeUrlPipe,RouterLink]
})
export class UserCardComponent implements OnInit {

  userDisplay: string = 'unknown';

  roleName: string = 'unknown';

  avatar: string = 'assets/images/user/avatar-2.jpg';

  private onDestroy$: Subject<string> = new Subject<string>();

  constructor(
    private auth: AuthService
  ) {
    this.auth.onUserSetup.pipe(takeUntil(this.onDestroy$)).subscribe((user) => {
      this.userDisplay = user.display_name;
      this.avatar = user.avatar;
    });
    this.roleName = 'Admin';
  }

  ngOnInit() {
  }
  ngOnDestroy(): void {
    this.onDestroy$.next('');
    this.onDestroy$.complete();
  }

}
