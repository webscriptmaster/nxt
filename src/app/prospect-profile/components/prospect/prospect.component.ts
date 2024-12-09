import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Category, ProspectProfile } from 'src/app/models/prospect';
import { ProfileService } from 'src/app/shared/profile.service';
import { ProspectService } from 'src/app/shared/prospect.service';

@Component({
  selector: 'app-prospect',
  templateUrl: './prospect.component.html',
  styleUrls: ['./prospect.component.scss'],
})
export class ProspectComponent implements OnInit {
  @Output() dataChange = new EventEmitter<string>();
  listProfile: any[] = [];
  listMyProfile: any[] = [];
  isViewAll: boolean = false;
  mainCategories: any[] = [];
  listTab: any[] = [
    { name: 'Profiles', activeTab: 0 },
    { name: 'Videos', activeTab: 1 },
    { name: 'Graphics', activeTab: 2 },
  ];
  @Input() activeTab: string;
  activeTab2 = '0';
  activeTab3 = '-1';
  guideLink: string;
  myProspectProfile: string[] = [];
  prospectCategories: ProspectProfile[] = [];

  highlightCategories = [];

  graphicCategories: Category[] = [];
  user$;
  constructor(
    private _graphicService: ProspectService,
    private _profileService: ProfileService,
    private route: ActivatedRoute,
    private _router: Router,
    private _auth: AuthService
  ) {
    const navigation = this._router.getCurrentNavigation();
    this.user$ = this._auth.user$;
    this.activeTab2 = '0';
    this.activeTab = this.route.snapshot.data['activeTab'].toString();
    if (navigation?.extras.state) {
      const data = navigation.extras.state;
      this.activeTab2 = data['activeTab2'] || '0';
    }
    this.isViewAll = false;
    this.loadData(this.activeTab);
  }
  private loadData(activeTab: string): void {
    switch (activeTab) {
      case '0':
        this._profileService.getProspectProfiles().subscribe((res) => {
          this.handleResponse(res);
        });
        break;
      case '2':
      case '3':
        this._graphicService.getAllGraphic().subscribe((res) => {
          this.handleResponse(res);
        });
        break;
      default:
        break;
    }
  }

  private handleResponse(res: any): void {
    this.mainCategories = res;
    this.listProfile = this.mainCategories;
    this.guideLink = this.mainCategories[0]?.guideLink;
    this.emitData();
    this.selectProfileType(this.mainCategories, this.activeTab3);
  }

  ngOnInit() {}

  emitData() {
    this.dataChange.emit(this.guideLink);
  }

  onTabChange(event: any) {
    this.activeTab3 = event;
    this.selectProfileType(
      this.mainCategories[this.activeTab3],
      this.activeTab3
    );
  }

  selectProfileType(category: any, tab: string) {
    this.activeTab3 = tab;
    if (this.activeTab3 !== '-1') {
      this.listProfile = [];
      this.listProfile.push(category);
      this.isViewAll = true;
      return;
    }
    this.isViewAll = false;
    this.listProfile = this.mainCategories;
  }

  findOrMy(tab: string) {
    this.activeTab2 = tab.toString();
    const filteredCategories = this.mainCategories
      .map((profile) => ({
        ...profile,
        list: profile.list?.filter((item) =>
          this.myProspectProfile.includes(item.id)
        ),
      }))
      ?.filter((profile) => profile.list?.length > 0);
    this.listMyProfile = [...filteredCategories];
  }
}
