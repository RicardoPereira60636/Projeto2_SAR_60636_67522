import { Injectable } from '@angular/core';
import {throwError,  Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { SigninService } from './signin.service';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  private removeItemUrl;

  constructor(private http: HttpClient, private signinService: SigninService) {
    this.removeItemUrl = "/api/removeitem";
  }

  getItems() {
        // add authorization header with jwt token
        let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.signinService.token.token }); // insert tokern in the requests
        let options = { headers: headers };

        // get users from api
        return this.http.get<any[]>('/api/items', options)
              .pipe(
                catchError(this.handleError) // handle error function will return an empty Item[] anf log the error
              );
    }

    //get the sold items from the server
    getSoldItems() {
        // add authorization header with jwt token
        let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.signinService.token.token }); // insert tokern in the requests
        let options = { headers: headers };

        //get sold items from api
        return this.http.get<any[]>('/api/solditems', options)
              .pipe(
                catchError(this.handleError) // handle error function will return an empty Item[] anf log the error
              );
    }


   getUsers() {
        // add authorization header with jwt token
        let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.signinService.token.token }); // insert tokern in the requests
        const options = { headers: headers };

        // get users from api
        return this.http.get<any[]>('/api/users', options)
              .pipe(
                catchError(this.handleError) // handle error function will return an empty Item[] anf log the error
              );
   }

  removeItem (item: any) {
    console.log("auction service removeItem -> Removing an item.");
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.signinService.token.token }); // insert tokern in the requests
    let options = { headers: headers };

    return this.http.post<any>(this.removeItemUrl, item, options)
      .pipe(
        catchError(this.handleError)
      );
  }

     /**
   * Handle Http operation that failed.
   */
   private handleError (error: HttpErrorResponse) {
    let errMsg:string;
    if (error.error instanceof ErrorEvent) {
    // A client-side or network error occurred. Handle it accordingly.
      errMsg = error.error.message ? error.error.message : error.toString()
      console.error(errMsg);
    } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
      errMsg = error.status + ' - ' + error.statusText;
      console.error(errMsg);
    }
    return throwError(()=> new Error (errMsg));
    };

}
