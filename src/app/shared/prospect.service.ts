import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import {
  BehaviorSubject,
  Observable,
  Subject,
  first,
  firstValueFrom,
  map,
  shareReplay,
  filter,
  EMPTY,
  switchMap,
  from,
} from 'rxjs';
import { Category, GraphicElement } from '../models/prospect';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ProspectService {
  private graphicProCollection: AngularFirestoreCollection;
  graphicProCollection$: Observable<Category[]>;

  private elementsShapeCollection: AngularFirestoreCollection;
  elementsShapeCollection$: Observable<GraphicElement[]>;

  private elementsVectorCollection: AngularFirestoreCollection;
  elementsVectorCollection$: Observable<GraphicElement[]>;

  private elementsImageCollection: AngularFirestoreCollection;
  elementsImageCollection$: Observable<GraphicElement[]>;

  private fontsCollection: AngularFirestoreCollection;
  fontsCollection$: Observable<any[]>;

  constructor(private _afs: AngularFirestore, private http: HttpClient) {
    this.graphicProCollection = this._afs.collection('GraphicPro');
    this.elementsShapeCollection = this._afs.collection('ElementsShape');
    this.elementsVectorCollection = this._afs.collection('ElementsVector');
    this.elementsImageCollection = this._afs.collection('ElementsImage');
    this.fontsCollection = this._afs.collection('Fonts');
  }

  getAllGraphic() {
    if (!this.graphicProCollection$) {
      this.graphicProCollection$ = this.graphicProCollection
        .snapshotChanges()
        .pipe(
          map((actions) => {
            return actions
              .map((action: any) => {
                return {
                  id: action.payload.doc.id,
                  ...action.payload.doc.data(),
                };
              })
              .sort((a: any, b: any) => {
                return a.order - b.order;
              });
          })
        );
    }
    return this.graphicProCollection$;
  }

  getCategoryById(categoryId: string, templateId: string): Observable<any> {
    return this.graphicProCollection
      .doc(categoryId)
      .snapshotChanges()
      .pipe(
        map((action: any) => {
          const data = action.payload.data();
          const catgegory = data || [];
          return catgegory ? { categoryId, templateId, ...catgegory } : null;
        })
      );
  }

  markAsFavorited(cateId: string, data: Category) {
    this.graphicProCollection.doc(cateId).update(data);
  }

  getSvg(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' });
  }

  fetchSVGContent(queryUrl: string): Observable<string> {
    const url = `${environment.apiURL}/video/graphic-pro/fetch-svg`;
    return this.http.post<string>(url, { queryUrl });
  }

  private getCollection(collectionName: string): Observable<GraphicElement[]> {
    const collectionKey = `elements${collectionName}Collection$`;

    if (!this[collectionKey]) {
      const collection = this._afs.collection(`Elements${collectionName}`);
      this[collectionKey] = collection.snapshotChanges().pipe(
        first(),
        map((actions) => {
          return actions
            .map((action: any) => ({
              id: action.payload.doc.id,
              ...action.payload.doc.data(),
            }))
            .sort((a: any, b: any) => a.no - b.no);
        })
      );
    }

    return this[collectionKey];
  }

  getAllShape(): Observable<GraphicElement[]> {
    return this.getCollection('Shape');
  }

  getAllVector(): Observable<GraphicElement[]> {
    return this.getCollection('Vector');
  }

  getAllImage(): Observable<GraphicElement[]> {
    return this.getCollection('Image');
  }

  getAllFonts(): Observable<any[]> {
    if (!this.fontsCollection$) {
      this.fontsCollection$ = this.fontsCollection.snapshotChanges().pipe(
        map((actions) => {
          return actions.map((action: any) => {
            return {
              id: action.payload.doc.id,
              ...action.payload.doc.data(),
            };
          });
        })
      );
    }
    return this.fontsCollection$;
  }

  urlToBase64(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      switchMap((blob) => {
        return from(
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
        );
      })
    );
  }

  /*  todo: this code is duplicated here and in template.component.ts
      it needs refactoring
  */
  embedFonts(fontFaces, isFontFamilyUsedFunc): Promise<any> {
    let fontEmbedPromises = [];

    for (let ff of fontFaces) {
      // getting URL of the font used in the SVG by analyzing @font-face from the styles
      const fontUrls = ff.originalFontFace.match(/url\(([^)]+)\)/g);

      if (!fontUrls || fontUrls.length == 0) {
        // skipping @font-face CSS rule if the src is missing or the format is not supported
        continue;
      }

      const fontFamilyRules =
        ff.originalFontFace.match(/font-family:([^;]+)/gim); // global multiline case-insensitive search

      const fontFamilyRule =
        fontFamilyRules && fontFamilyRules.length > 0
          ? fontFamilyRules[0]
          : null;

      if (!fontFamilyRule) {
        // skipping @font-face CSS rule if the font-family rule is missing
        continue;
      }

      ff.fontFamily = fontFamilyRule
        .replace(/font-family/gi, '')
        .replaceAll('"', '')
        .replaceAll(':', '')
        .trim();

      if (isFontFamilyUsedFunc(ff.fontFamily)) {
        // getting a clean and valid URL of the font file and downloading it
        const fontUrl = fontUrls[0]
          .substring(4, fontUrls[0].length - 1)
          .replaceAll('&amp;', '&');

        fontEmbedPromises.push(
          fetch(fontUrl)
            .then((resp) => resp.blob())
            .then((blob) => {
              let promise = new Promise((resolve, reject) => {
                let fileReader = new FileReader();
                fileReader.onload = (e) => resolve(fileReader.result);
                fileReader.onerror = reject;
                fileReader.readAsDataURL(blob);
              }).then((dataUrl: string) => {
                // replacing the URL of the font file in the CSS rule with the data URL (embedding the font into CSS)
                ff.embeddedFontFace = ff.originalFontFace.replace(
                  fontUrls[0],
                  `url(${dataUrl})`
                );
                ff.isUsed = true;

                return ff;
              });

              return promise;
            })
        );
      } else {
        // no need to download the font if it is not being used
        fontEmbedPromises.push(
          new Promise((resolve, reject) => {
            ff.isUsed = false;
            resolve(ff);

            return ff;
          })
        );
      }
    }

    return Promise.all(fontEmbedPromises);
  }

  downloadSvgAsPng(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' }).pipe(
      switchMap((svgString) => {
        return from(
          new Promise<string>((resolve, reject) => {

            // loading all available fonts
            return firstValueFrom(this.getAllFonts())
              .then((fonts) => {
                let fontFaceStyles = '';

                // adding @font-face for all available fonts to SVG
                for(const font of fonts) {

                  const fileExtension =
                    font.fileExtension === '.ttf'
                      ? 'truetype'
                      : font.fileExtension === '.otf'
                        ? 'opentype'
                        : font.fileExtension.replace('.', '');

                    fontFaceStyles += `
                        @font-face {
                          font-family: "${font.name}";
                          src: url(${font.url}) format("${fileExtension}");
                        }
                      `;
                }

                // inserting @font-faces before the first ending </style> tag
                svgString = svgString.replace('</style>', fontFaceStyles + '</style>');

                // getting all font faces
                const fontFaces = svgString.match(/@font-face {([^}]+)}/g).map(
                  (ff: string) => {
                    return {
                      originalFontFace: ff,
                      embeddedFontFace: null,
                    };
                  }
                );

                this.embedFonts(fontFaces, (fontFamily: string) => {
                  const regEx = new RegExp(
                    `(font-family:\\s*['"]?(${fontFamily})['"]?[,;])|(font-family=['"](${fontFamily})['"])|(font-family\\s*:\\s*[^;]*,\\s*["']*${fontFamily}["']*[^;}]*;)`,
                    'gmi'
                  );
                  const matches = svgString.match(regEx);
                  return matches && matches.length > 1;
                }).then((fontFacesMappings: any[]) => {
                
                  for (let fontFacesMapping of fontFacesMappings) {
                    if (fontFacesMapping.isUsed) {
                      svgString =
                        svgString.replace(
                          fontFacesMapping.originalFontFace,
                          fontFacesMapping.embeddedFontFace
                        );
                    } else {
                      // removing unused font family
                      svgString =
                        svgString.replaceAll(
                          fontFacesMapping.originalFontFace,
                          ''
                        );
                    }
                  }

                  const svgBlob = new Blob([svgString], {
                    type: 'image/svg+xml;charset=utf-8',
                  });

                  const url = URL.createObjectURL(svgBlob);

                  const img = new Image();
                  img.crossOrigin = 'anonymous';

                  img.onload = () => {
                    setTimeout(() => {
                      const canvas = document.createElement('canvas');
                      canvas.width = img.width;
                      canvas.height = img.height;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0);

                      const pngUrl = canvas.toDataURL('image/png');
                      resolve(pngUrl);
                      URL.revokeObjectURL(url);
                    }, 2000);
                  };

                  img.onerror = (error) => {
                    URL.revokeObjectURL(url);
                    reject(error);
                  };

                  img.src = url;
                });
              });
          })
        );
      })
    );
  }

  getGraphicName(data): Observable<string> {
    const url = `${environment.apiURL}/graphic-pro/graphic-name`;
    return this.http.post<string>(url, data);
  }
}
