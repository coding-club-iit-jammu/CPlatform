import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { StoreInfoService } from './store-info.service';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private storeInfo: StoreInfoService) { }

  refreshToken(): Observable<{accessToken: string; refreshToken: string}> {
    const refreshToken = this.storeInfo.getRefreshToken();
    return this.http.post<{accessToken: string; refreshToken: string}>
    (this.storeInfo.serverUrl + '/refreshToken',{refreshToken}).pipe(
      tap(response => {
        this.storeInfo.setToken(response.accessToken);
        this.storeInfo.setRefreshToken(response.refreshToken);
      })
    );
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}
