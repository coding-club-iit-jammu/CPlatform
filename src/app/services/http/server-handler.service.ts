import { environment } from './../../../environments/environment';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { LanguageTable } from 'src/models/languages/languages';
import { StoreInfoService } from '../store-info.service';

@Injectable()
export class ServerHandlerService {
    constructor (private http: HttpService,
                private storeInfo: StoreInfoService) { }

    public getAllSupportedLangs() {
        const queryUrl = this.storeInfo.serverUrl + '/langs/';
        return this.http.get<{langs: LanguageTable}>(queryUrl)
                    .pipe(map(body => body.langs));
    }
    public postCodeToRun(code: string, language: {id: string, version: string}, 
                        input: string, fields: string) {
        const queryUrl = this.storeInfo.serverUrl + '/run/';
        const requestBody = {program: code, lang: language.id, version: language.version, 
                            input: input, fields: fields};
        return this.http.post<{runResult: any}>(queryUrl, requestBody)
                    .pipe(map(body => body.runResult));

    }
}