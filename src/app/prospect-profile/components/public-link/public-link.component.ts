import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { ProspectService } from 'src/app/shared/prospect.service';

@Component({
  selector: 'app-public-link',
  templateUrl: './public-link.component.html',
  styleUrls: ['./public-link.component.scss'],
})
export class PublicLinkComponent {
  graphicLink: string;
  graphicContent: string;
  graphicName: string;
  email: string;
  userName: string;

  constructor(
    private route: ActivatedRoute,
    private prospectService: ProspectService,
    private elRef: ElementRef
  ) {
    this.route.params.subscribe((params) => {
      console.log('Route params:', params); // Log route parameters

      this.userName = params['userName'];
      this.graphicName = params['graphicName'];
      this.email = params['email'];

      if (!this.userName || !this.graphicName || !this.email) {
        console.error('Missing route parameters:', {
          userName: this.userName,
          graphicName: this.graphicName,
          email: this.email,
        });
        return;
      }

      const data = {
        userName: this.userName,
        graphicName: this.graphicName,
        email: this.email,
      };

      console.log('Sending data to getGraphicName:', data);

      this.prospectService.getGraphicName(data).subscribe({
        next: (res) => {
          this.graphicLink = res?.replace('.svg', '.png');
          console.log('Received graphic link:', this.graphicLink);

          if (this.graphicLink) {
            this.prospectService
              .fetchSVGContent(this.graphicLink)
              .pipe(
                tap((svgContent) => {
                  this.graphicContent = svgContent;
                  const parser = new DOMParser();
                  const svgDoc = parser.parseFromString(
                    this.graphicContent,
                    'image/svg+xml'
                  );
                  const svgElement = svgDoc.documentElement;

                  const container =
                    this.elRef.nativeElement.querySelector('#svgContainer');
                  container.appendChild(svgElement);
                })
              )
              .subscribe();
          }
        },
        error: (err) => {
          console.error('Error fetching graphic name:', err);
        },
      });
    });
  }
}

console.log();
