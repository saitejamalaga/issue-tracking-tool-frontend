import { Component, OnInit } from '@angular/core'
import { AppService } from 'src/app/app.service'
import { SocketService } from 'src/app/socket.service'
import { Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'
import { Cookie } from 'ng2-cookies'


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  sortType: string
  public page : number =1
  public sortDesc: boolean = false
  public searchText: any
  public authToken: any
  public userInfo: any
  public userName: any
  public disconnectedSocket: boolean
  public allIssues: any = []
  public issueTitle: any
  public assignee: any
  public issueDescription: any
  public notifCounter: number = 0
  public notifData: any = []
  public issueEdited: boolean = false
  public notify : boolean = false

  constructor(public appService: AppService, public socketService: SocketService,
    public router: Router, public toastr: ToastrService) {
    // console.log("Inside dashboard constructor")
  }

  ngOnInit() {

    this.authToken = Cookie.get("authToken")
    
    this.userName = Cookie.get("receiverName")

    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    console.log(this.userName)
    
    this.getAllIssues()
    this.verifyUserAndJoinIssues()
    this.joinChatRoom()

    // for listening to update when a new issue is assigned to this user.
    this.socketService.updateIssueList().subscribe((data) => {
      this.getAllIssues()
      this.toastr.info(`A new issue ${data.newIssueTitle} has been assigned to you by ${data.newReporterName}`, 'New notification')
    })

    this.socketService.receiveNotification().subscribe((data) => {

      if (data.editedContent == 'comment') {
        this.issueEdited = false
        this.notifCounter++
        if (Array.isArray(this.notifData)) {
          this.notifData.push(data)
        } else {
          this.notifData = []
          this.notifData.push(data)
        }
        this.toastr.success(`Open notifications panel for details`, 'New Notification')
      }

      else {
        this.issueEdited = true
        this.notifCounter++
        if (Array.isArray(this.notifData)) {
          this.notifData.push(data)
        } else {
          this.notifData = []
          this.notifData.push(data)
        }
        this.toastr.success(`Open notifications panel for details`, 'New Notification')
      }
    })
    this.authError()
  }

  public getAllIssues: any = () => {
    this.appService.getAllIssues(this.userInfo.userId).subscribe((data) => {
      if (data.status == 200) {
        this.allIssues = data['data']
        // console.log("All Issues: " + JSON.stringify(this.allIssues[0].issueId))
      }

      else if (data.status == 404) {
        // console.log("All issue in err:" + this.allIssues.length)
        this.toastr.info("No issues found!")
      }
    }
    )
  }

  //verify the logged-in user & join all issues room which have been assigned to the user
  public verifyUserAndJoinIssues: any = () => {

    this.socketService.verifyUser()
      .subscribe((data) => {

        this.disconnectedSocket = false

        this.socketService.setUser(this.authToken)

      })//end subscribe
  }//end verifyUserAndJoinIssues

  // for creating and joining a unique socket room for every user
  // for receiving update if a new issue is assigned.
  public joinChatRoom: any = () => {
    let roomData = {
      roomId: this.userInfo.userId,
      userId: this.userInfo.userId,
      userName: this.userName
    }

    this.socketService.startRoom().subscribe(
      data => {
        this.socketService.emitJoinRoom(roomData)
      }
    )
  }


  // click user-event: for sorting issues
  // sortType/property: which column to sort
  // sortDesc: to track whether to sort in descending order or not. Also for toggling icon in table header
  // in Array.prototype.sort(): -1 is for ascending & 1 is for descending sort order
  public sortIssues(property) {
    this.sortType = property
    this.sortDesc = !this.sortDesc
    this.allIssues.sort(this.dynamicSort(property))
  }

  public dynamicSort(property) {
  
    let sortOrder = -1

    //sortDesc: for changing the order of sorting i.e ascending or descending
    if (this.sortDesc)
      sortOrder = 1

    return function (a, b) {
      let result = (a[property].toLowerCase() < b[property].toLowerCase()) ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1 : 0
      // to make result the opposite i.e toggle between ascending/descending
      return result * sortOrder
    }
  }

  public showNotifications(){

    this.notify = !this.notify;

    setTimeout(() => {

      this.notify = !this.notify;

    }, 3000);

  }

  public selectedIssue: any = (issueId) => {
    this.router.navigate(['/issue', issueId])
  }


  public logout: any = () => {

    this.appService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          Cookie.delete('authToken');
          Cookie.delete('userId');
          Cookie.delete('userName');

          this.socketService.disconnect(this.userInfo.userId);
          this.router.navigate(['/']);//navigating to signin page
        }
        else {
          this.toastr.error(apiResponse.message);
        }
      }, (err) => {
        this.toastr.error('some error occured');
      })
  }//end logout

  public authError: any = () => {
    this.socketService.authError().subscribe(
      data => {
        this.toastr.error(data.error)
      }
    )
  }

}