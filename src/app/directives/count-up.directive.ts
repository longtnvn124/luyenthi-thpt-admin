import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  interval,
  animationFrameScheduler,
  switchMap,
  map,
  takeWhile,
  distinctUntilChanged,
  endWith,
  takeUntil,
} from 'rxjs';
import { Destroy } from './destroy';

/**
 * Quadratic Ease-Out Function: f(x) = x * (2 - x)
 */
const easeOutQuad = (x: number): number => x * (2 - x);

@Directive({
  selector: '[countUp]',
  providers: [Destroy],
  standalone: true
})
export class CountUpDirective implements OnInit {
  private readonly count$ = new BehaviorSubject(0);
  private readonly duration$ = new BehaviorSubject(2000);

  private readonly currentCount$ = combineLatest([
    this.count$,
    this.duration$,
  ]).pipe(
    switchMap(([count, duration]) => {
      const startTime = animationFrameScheduler.now();

      return interval(0, animationFrameScheduler).pipe(
        map(() => animationFrameScheduler.now() - startTime), // elapsed time
        map((elapsedTime) => elapsedTime / duration), // progress
        takeWhile((progress) => progress <= 1, true), // ensure complete
        map(easeOutQuad), // ease out effect
        map((progress) => Math.round(progress * count)), // current value
        distinctUntilChanged(),
        endWith(count)
      );
    })
  );

  @Input('countUp')
  set count(count: number) {
    this.count$.next(count);
  }

  @Input()
  set duration(duration: number) {
    this.duration$.next(duration);
  }

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2,
    private readonly destroy$: Destroy
  ) {}

  ngOnInit(): void {
    this.displayCurrentCount();
  }

  private displayCurrentCount(): void {
    const formatter = new Intl.NumberFormat('en-US'); // Format with commas
    this.currentCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentCount) => {
        this.renderer.setProperty(
          this.elementRef.nativeElement,
          'innerHTML',
          formatter.format(currentCount) // Apply formatting
        );
      });
  }
}
