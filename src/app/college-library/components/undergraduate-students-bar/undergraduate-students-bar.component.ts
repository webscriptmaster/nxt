import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-college-card-undergraduate-students-bar',
  templateUrl: './undergraduate-students-bar.component.html',
  styleUrls: ['./undergraduate-students-bar.component.scss'],
})
export class CollegeCardUndergraduateStudentsBarComponent implements OnInit {
  @Input() undergradsNo: any;

  constructor() {}

  ngOnInit() {
    if (typeof this.undergradsNo === 'string') {
      this.undergradsNo = this.undergradsNo.replace(/,/g, '');
    }
  }
}
