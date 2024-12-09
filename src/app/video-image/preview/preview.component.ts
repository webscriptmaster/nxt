import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit, OnChanges {
  @Input() preview: any;
  @Output() previewClick: EventEmitter<any> = new EventEmitter();
  showCloseIcon$ = new BehaviorSubject(false);

  ngOnChanges(changes: SimpleChanges): void {
    this.showCloseIcon$.next(false);
    setTimeout(() => {
      this.showCloseIcon$.next(true);
    }, 2000);
  }
  ngOnInit(): void {}

  handleClick() {
    this.preview.url = null;
    this.showCloseIcon$.next(false);
  }

  stopPropagation(e: Event) {
    e.stopPropagation();
  }
}
