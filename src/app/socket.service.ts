import { Injectable } from '@angular/core'
//importing socket io
import * as io from 'socket.io-client'
import { Observable, throwError } from 'rxjs'

//for http requests - GET, POST, PUT etc.
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { HttpErrorResponse, HttpParams } from '@angular/common/http'


@Injectable({
  providedIn: 'root'
})

export class SocketService {

  private baseUrl = 'http://api.issuetrackingtool.online/api/v1';
  //private baseUrl = "http://localhost:3000/api/v1";
  private socket
  constructor(public http: HttpClient) {
    // console.log("inside socket constructor")
    //first step where connection is established. i.e. Handshake moment
    this.socket = io(this.baseUrl)
  }

  //-----------------events to be listened-----------------------

  public authError = () => {
    return Observable.create((observer) => {

      this.socket.on('auth-error', (data) => {

        observer.next(data)

      })//end socket

    })//end observer

  }//end authError
  public verifyUser = () => {

    return Observable.create((observer) => {

      this.socket.on('verifyUser', (data) => {

        observer.next(data)

      })//end socket

    })//end return of Observable

  }//end verifyUser
  public setUser = (authToken) => {

    this.socket.emit("set-user", authToken)

  }//end setUser 
  // when a user requests for following an issue
  public followIssue = (followerData) => {
    this.socket.emit('follow-issue', followerData)
  }

  public unFollowIssue = (unFollowerData) => {
    this.socket.emit('unfollow-issue', unFollowerData)
  }

  public emitGetFollowersList = (issueId) => {

    this.socket.emit('get-all-followers', issueId)
  }

  public getFollowersList(issueId): any {

    return Observable.create((observer) => {
      this.socket.on(issueId, (data) => {
        observer.next(data)
      })
    })
  }

  public notifyFollowers = (data) => {
    console.log("Inside notify emit")
    this.socket.emit('notify-all-followers', data)
  }

  public receiveNotification(): any {

    return Observable.create((observer) => {
      this.socket.on('notification', (data) => {
        // console.log("New notification received!")
        observer.next(data)
      })
    })
  }

  public startRoom = () => {
    return Observable.create((observer) => {
      this.socket.on('startUserRoom', (data) => {
        observer.next(data);
      });
    });
  }
  public emitJoinRoom = (data) => {
    this.socket.emit('joinUserRoom', data)
  }


  public notifyNewAssigneeOfNewIssue = (data) => {
    this.socket.emit('notify-assignee-new-issue',data)
  } 
  
  public updateIssueList = () => {
    return Observable.create((observer) => {
      this.socket.on('update-issue-list', (data) => {
        observer.next(data)
      })
    })
  }

  public disconnect = (userId) => {
    this.socket.disconnect(userId)
  }

}
