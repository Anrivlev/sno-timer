import { Component, OnDestroy } from '@angular/core';
import { Duration } from 'luxon';
import { Subscription, interval, takeUntil, takeWhile, tap } from 'rxjs';
import { CONSTS } from './CONSTS';
import { DynamicBackgroundColor } from './model/DynamicBackgroundColor';
import { TimerQueue } from './model/TimerQueue';
import { queue1 } from './queueConfigs/queue1';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  remainingTimeString: string;
  remainingTime: Duration;
  backgroundColor: DynamicBackgroundColor;
  timerSubscription: Subscription;
  timerQueue?: TimerQueue;

  redDiff: number;
  blueDiff: number;
  greenDiff: number;

  isActive?: boolean;

  constructor(

  ) {
    this.timerSubscription = new Subscription();
    this.remainingTime = Duration.fromObject({ seconds: 0 });
    this.remainingTimeString = this.remainingTime.toFormat(`mm:ss`);
    this.backgroundColor = {
      red: 255,
      green: 255,
      blue: 255,
      string: `rgb(255, 255, 255)`,
    };
    this.redDiff = 0;
    this.blueDiff = 0;
    this.greenDiff = 0;

    this.setTimer(0, 10);

    this.startTimer();
    this.timerQueue = queue1;
  }
  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }

  stopTimer() {
    this.isActive = false;
    this.timerSubscription.unsubscribe();
  }

  setTimer(minutes: number, seconds: number) {
    this.remainingTime = Duration.fromObject({ minutes: minutes, seconds: seconds });
    this.remainingTimeString = this.remainingTime.toFormat(`mm:ss`);
    this.backgroundColor = CONSTS.GREEN;
    this.redDiff = (CONSTS.RED.red - CONSTS.GREEN.red) / (minutes * 60 + seconds);
    this.greenDiff = (CONSTS.RED.green - CONSTS.GREEN.green) / (minutes * 60 + seconds);
    this.blueDiff = (CONSTS.RED.blue - CONSTS.GREEN.blue) / (minutes * 60 + seconds);
  }

  startTimer() {
    this.isActive = true;
    this.timerSubscription =
      interval(1000)
        .pipe(
          takeWhile(() => this.remainingTime.as(`seconds`) > 0),
          tap(() => {
            this.remainingTime = this.remainingTime.minus(Duration.fromObject({ seconds: 1 }));
            this.remainingTimeString = this.remainingTime.toFormat(`mm:ss`);
            this.backgroundColor = {
              red: this.backgroundColor.red + this.redDiff,
              green: this.backgroundColor.green + this.greenDiff,
              blue: this.backgroundColor.blue + this.blueDiff,
              string: `rgb(${this.backgroundColor.red + this.redDiff},${this.backgroundColor.green + this.greenDiff},${this.backgroundColor.blue + this.blueDiff})`
            }
          }),
        )
        .subscribe()
  }
}
