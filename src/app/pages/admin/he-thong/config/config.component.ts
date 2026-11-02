import { AfterViewInit, Component, OnInit } from "@angular/core";
import { EXAM_RULES_MODE, EXAM_VIEW_MODE, SAVE_METHOD } from "@model/config";
import { SystemConfig } from "@model/system-config";
import { SysConfigsService } from "@service/core/sys-configs.service";
import { finalize } from "rxjs";

@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.css"],
})
export class ConfigComponent implements AfterViewInit, OnInit {
  titleSavetest: string = `
    <div class="d-flex align-item-center">
      <i class="fa fa-floppy-o" ></i>
      <div class="title ml-2">
          Cách thức lưu bài
      </div>
  </div>
  `;

  titleScreen: string = `
    <div class="d-flex align-item-center">
      <i class="fa fa-desktop" ></i>
      <div class="title ml-2">
          Chế độ hiển thị bài thi
      </div>
  </div>
  `;

  titleThirdpartyapplications: string = `
    
  `;

  // Text content
  largeText = "Đại Học Thái Nguyên";
  smallText =
    "Từ khát vọng đến thành công, chỉ cần sự quyết tâm và cố gắng không ngừng nghỉ.";
  private hasTypingEffectRun = false;

  listData: SystemConfig[] = [];
  isLoading: boolean = true;
  constructor(private sysConfigsService: SysConfigsService) {}

  ngOnInit(): void {
    this.hasTypingEffectRun = false;

    this.loadData();
  }

  ngAfterViewInit(): void {
    // Only run the typing effect if it hasn't been run before
    if (!this.hasTypingEffectRun) {
    }
  }

  private startTypingEffect(): void {
    this.typeText("headline", this.largeText, 90, () => {
      this.typeText("subtext", this.smallText, 60, () => {
        this.removeCursor();
      });
    });
  }

  private typeText(
    elementId: string,
    text: string,
    speed: number,
    callback?: () => void
  ): void {
    const element = document.getElementById(elementId);
    if (!element) return;

    let index = 0; // Start typing from the first character

    // Create typing effect
    const interval = setInterval(() => {
      element.innerHTML += text[index];
      index++;

      // Check if typing is complete
      if (index === text.length) {
        clearInterval(interval); // Stop typing
        if (callback) callback(); // Call the next step
      }
    }, speed);
  }

  // Remove cursor after typing effect is done
  private removeCursor(): void {
    const elements = document.querySelectorAll("#headline, #subtext");
    elements.forEach((el) => {
      el.classList.remove("typing-cursor"); // Remove the cursor class
    });
  }

  // ============================= load data =============================
  loadData() {
    this.isLoading = true;
    this.sysConfigsService
      .getAllAppConfigs()
      .pipe(
        finalize(() => {
          this.startTypingEffect();
          this.hasTypingEffectRun = true;
        })
      )
      .subscribe({
        next: (res: SystemConfig[]) => {
          if (res.length > 0) {
            this.listData = res.map((item: SystemConfig) => {
              item["title_converted"] = `
              <div class="d-flex align-item-center">
                  <i class="${item.icon}" ></i>
                  <div class="title ml-2">
                      ${item.title}
                  </div>
              </div>
            `;

              return item;
            });
          } else {
            this.listData = [];
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error(error);
          
          this.isLoading = false;
        },
      });
  }

  // ============================ SAVE_METHOD ==========================
  changeConfigMode(config: SystemConfig, value: string | number): void {
    if (config.value == value) return;
    if (config && value) {
      this.isLoading = true;
      this.sysConfigsService
        .update(config.id, { value: value })
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (res) => {
            this.listData = this.listData.map((item) => {
              if (item.id == config.id)
                item["value"] = parseInt(value.toString());
              return item;
            });
          },
          error: (err) => {
          },
        });
    }
  }
}


