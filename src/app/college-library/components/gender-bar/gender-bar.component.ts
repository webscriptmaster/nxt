
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-college-card-gender-bar',
  templateUrl: './gender-bar.component.html',
  styleUrls: ['./gender-bar.component.scss'],
})
export class CollegeCardGenderBarComponent implements OnInit {
  @Input() male: any;
  @Input() female: any;

  public doughnutChartLabels: string[] = ['Female', 'Male'];
  public doughnutChartDatasets: any = [];

  constructor() {}

  ngOnInit() {
    if (typeof this.male === 'string' && this.male.includes('%')) {
      this.male = parseFloat(this.male.replace('%', ''));
    }

    if (typeof this.female === 'string' && this.female.includes('%')) {
      this.female = parseFloat(this.female.replace('%', ''));
    }
    this.doughnutChartDatasets = [{ data: [this.female, this.male], backgroundColor: ['#707070', '#BFED05'], cutout: 33 }];
  }
}
