import { Injectable } from '@angular/core';

//importing http client to make requests
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Cookie } from 'ng2-cookies';
import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class AppService {

  private baseUrl = 'http://api.issuetrackingtool.online/api/v1';
  //private url = "http://localhost:3000/api/v1";
  constructor(public http: HttpClient) { }


  public getUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'))
  }

  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  public signUpFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('mobileNumber', data.mobileNumber)
      .set('email', data.email)
      .set('password', data.password)

    return this.http.post(`${this.baseUrl}/users/signup`, params)
  }

  public signInFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password);

    return this.http.post(`${this.baseUrl}/users/signin`, params)
  }

  public logout(): Observable<any> {

    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
    let userdetails = this.getUserInfoFromLocalStorage();

    return this.http.post(`${this.baseUrl}/users/logout/${userdetails.userId}`, params);

  } 

  //------------------------ dashboard ----------------------------------
  public getAllIssues(userId): Observable<any> {
    return this.http.get(`${this.baseUrl}/issue/getAllIssues/${userId}?authToken=${Cookie.get("authToken")}`)
  }


  //-------------------- issue description ---------------------------------
  public getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/issue/getAllUsers?authToken=${Cookie.get("authToken")}`);
  }

  public getIssueById(issueId): Observable<any> {
    return this.http.get(`${this.baseUrl}/issue/selectedIssue/${issueId}?authToken=${Cookie.get("authToken")}`);
  }

  public createNewIssue(data): Observable<any> {
    const params = new HttpParams().set('authToken', Cookie.get('authToken'))
      .set('title', data.title)
      .set('description', data.description)
      .set('reporter', data.reporter)
      .set('reporterId', data.reporterId)
      .set('assignee', data.assignee)
      .set('assigneeId', data.assigneeId)
      .set('status', data.status)
    return this.http.post(`${this.baseUrl}/issue/createNew`, params);
  }

  public editIssue(issueId, data): Observable<any> {
    return this.http.put(`${this.baseUrl}/issue/edit/${issueId}?authToken=${Cookie.get('authToken')}`, data);
  }

  public addNewComment(issueId, data): Observable<any> {
    return this.http.put(`${this.baseUrl}/issue/addComment/${issueId}?authToken=${Cookie.get('authToken')}`, data);
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error)
      errorMessage = 'An error occurred ${err.error.message}';
  }
}