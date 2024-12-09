import { User } from 'src/app/models/user';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-social-template',
  templateUrl: './social-template.component.html',
  styleUrls: ['./social-template.component.scss'],
})
export class SocialTemplateComponent implements OnInit {
  @Input() user: User | null;
  @Input() template: string;
  copied = false;

  constructor() {}

  ngOnInit() {    
  }

  onCopy(bio: any) {
    // navigator.clipboard.writeText(bio.innerHTML);
    navigator.clipboard.writeText(bio.innerText);
    this.copied = true;
  }
}
