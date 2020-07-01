import { Component, OnInit, ViewChild, Inject, LOCALE_ID } from '@angular/core'
import { AppService } from 'src/app/app.service'
import { SocketService } from 'src/app/socket.service'
import { Router, ActivatedRoute } from '@angular/router'
import { ToastrService } from 'ngx-toastr'
import { Cookie } from 'ng2-cookies/ng2-cookies'
import { Location } from '@angular/common'
//for accessing form fields in component
import { NgForm } from '@angular/forms';
//for formatting date
import { formatDate } from '@angular/common';
import { empty } from 'rxjs'

@Component({
  selector: 'app-issue-description',
  templateUrl: './issue-description.component.html',
  styleUrls: ['./issue-description.component.css']
})

export class IssueDescriptionComponent implements OnInit {

  public authToken: any
  public userInfo: any
  public userName: any
  public issueId: any
  public allUsers: any = []
  public currentIssue: any = ''
  public tempIssueData: any = ''

  public editBlock: boolean = false
  public hasChanges: boolean = false
  public show: boolean = false;

  // Fileds for Creating New Issue

  public titleText: any
  public reporterText: any
  public assigneeText: any = ''
  public statusText: any = ''
  public descriptionText: any

  // -----------------------

  public isChecked: boolean = false;
  public isComment: boolean = false;
  public followersList: any = []
  public commentsList: any = []
  public comments: any = ''

  constructor(private location: Location, public appService: AppService, public socketService: SocketService, public router: Router, public toastr: ToastrService, private activatedRoute: ActivatedRoute, @Inject(LOCALE_ID) private locale: string) { }

  ngOnInit() {

    this.authToken = Cookie.get("authToken")
    this.userName = Cookie.get("receiverName")
    this.userInfo = this.appService.getUserInfoFromLocalStorage()

    if (this.activatedRoute.snapshot.paramMap.get('issueId')) {
      this.issueId = this.activatedRoute.snapshot.paramMap.get('issueId')
    }

    this.getallUsers()

    if (!(this.issueId === null || this.issueId === undefined || this.issueId === '' || this.issueId.length === 0)) {
      this.editBlock = true
      this.isComment=true
      this.getSelectedIssue()
      this.getSelectedIssueFollowers()
    }

  }

  public goBack: any = () => {
    this.location.back()
  }

  public toggle() {

    this.show = !this.show;

    setTimeout(() => {

      this.show = !this.show;

    }, 3000);

  }

  public getallUsers = () => {

    this.appService.getAllUsers().subscribe((data) => {
      if (data.status === 200) {
        // console.log("Get all Users List:" + JSON.stringify(data.data))
        this.allUsers = data.data
      } else {
        console.log("Failed pulling Users List :" + data.message)
      }
    })

  }



  public getSelectedIssue = () => {

    this.appService.getIssueById(this.issueId).subscribe((data) => {
      // console.log(data)
      if (data.status === 200) {
        this.currentIssue = data.data
        // if we do this.tempIssueData = data.data then it will point to the same location as 
        // this.currentIssue hence changes in one will impact the other var too.
        // so make a deep copy like below
        this.tempIssueData = Object.assign({}, data.data)

        //below code stmt is for assigning assigneeId to tempisData assignee
        // so that while tracking form changes comparision is made b/w id
        this.tempIssueData.assignee = data.data.assigneeId

        // format date to short date
        this.currentIssue.createdOn = formatDate(this.currentIssue.createdOn, 'yyyy-MMMM-dd', this.locale)
        this.commentsList = data.data.comments.reverse()
        
        //  console.log("Current issue: " + JSON.stringify(this.currentIssue))

      } else {
        // console.log(data.message)
      }
    })
  }

  public getSelectedIssueFollowers = () => {
    this.socketService.emitGetFollowersList(this.issueId)
    this.socketService.getFollowersList(this.issueId).subscribe((data) => {
      // console.log("inside getFollowersList: " + JSON.stringify(data))
      for (let key in data) {
        // console.log("followers list key:" + key)
        if (key === this.userInfo.userId) {
          this.isChecked = true;
        }
        this.followersList.push({ followerName: data[key] })
      }
      // console.log("followers list: " + this.followersList)

    })
  }

  followCheckBox(event: any) {
    if (event === 'Y') {
      // console.log("following")
      let followerData = {
        issueId: this.issueId,
        userId: this.userInfo.userId,
        userName: this.userName,
        issueTitle: this.currentIssue.title
      }
      this.socketService.followIssue(followerData)
      this.getSelectedIssueFollowers()
    } else if (event === 'N') {
      let unFollowData = {
        issueId: this.issueId,
        userId: this.userInfo.userId
      }
      this.socketService.unFollowIssue(unFollowData)
      this.getSelectedIssueFollowers()
    }
  }

  // click event - to create a new issue
  createNewIssue = () => {

    let createAndFollow = () => {
      return new Promise((resolve, reject) => {

        let assigneeName: any
        for (let user of this.allUsers) {
          if (user.userId === this.assigneeText) {
            assigneeName = user.firstName + ' ' + user.lastName
          }
        }

        let newIssueData = {
          title: this.titleText,
          description: this.descriptionText,
          reporter: this.userName,
          reporterId: this.userInfo.userId,
          assignee: assigneeName,
          assigneeId: this.assigneeText,
          status: this.statusText,
          createdOn: Date.now
        }

        // console.log("New Issue data:" + JSON.stringify(newIssueData))

        this.appService.createNewIssue(newIssueData).subscribe((data) => {
          if (data.status === 200) {
            this.toastr.success("New Issue created sucessfully!")

            // when a new issue is created, 2 followers will always be there i.e:
            // reporter & assignee
            let reporterFollowerData = {
              issueId: data.data.issueId,
              userId: data.data.reporterId,
              userName: data.data.reporter,
              issueTitle: data.data.title
            }

            let assigneeFollowerData = {
              issueId: data.data.issueId,
              userId: data.data.assigneeId,
              userName: data.data.assignee,
              issueTitle: data.data.title
            }

            this.socketService.followIssue(reporterFollowerData)
            this.socketService.followIssue(assigneeFollowerData)
            resolve(data)

          } else {
            this.toastr.error(data.message, "Error")
            reject(data.message)
          }
        })
      })
    }


    let sendNotif = (data) => {
      return new Promise((resolve, reject) => {

        let notifData = {
          assigneeId: data.data.assigneeId,
          issueId: data.data.issueId,
          newIssueTitle: data.data.title,
          newReporterName: data.data.reporter,
          editedContent: 'new issue'
        }
        console.log("After creating new issue, new issue data: " + data.data.assigneeId)

        this.socketService.notifyNewAssigneeOfNewIssue(notifData)
        this.router.navigate(['dashboard'])
        resolve()
        // this.socketService.notifyNewAssigneeOfNewIssue(notifData)
      })
    }

    createAndFollow()
      .then(sendNotif)
      .then(() => {
        console.log("Inside final resolve, Notification sent")
      }).catch((err) => {
        console.log(err)
      })
  }


  // click event - to edit an existing issue
  editIssue = (form: NgForm) => {
    // ----- custom logic to track form field changes and specify which field changed --------
    this.hasChanges = false
    let whatChanged: any = []
    console.log(form)
    for (let prop in form) {

      if (prop !== 'follow' && prop !== 'assignee') {

        if (this.tempIssueData[prop] !== form[prop]) {

          this.hasChanges = true;
          whatChanged.push(prop)
          this.tempIssueData[prop] = form[prop]
        }
      }
      if (prop === 'assignee' && this.tempIssueData['assignee'] !== form['assignee']) {
        this.hasChanges = true;
        whatChanged.push('assignee')
        this.tempIssueData['assignee'] = form['assignee']
        console.log("New assignee: " + this.currentIssue.assigneeId + form['assignee'])
        let followData = {
          issueId: this.issueId,
          userId: form['assignee'],
          userName: this.userName
        }

        this.socketService.followIssue(followData)

        let notifData = {
          assigneeId: form['assignee'],
          issueId: this.issueId,
          newIssueTitle: form['title'],
          newReporterName: this.userName,
          editedContent: 'new issue'
        }

        this.socketService.notifyNewAssigneeOfNewIssue(notifData)
      }
    }

    if (this.hasChanges === true) {
      console.log("called !")
      this.appService.editIssue(this.issueId, this.currentIssue).subscribe((data) => {
        console.log(data.status)
        if (data.status === 200) {
          this.toastr.success("Edited successfully")
          //console.log("whatchanged: " + whatChanged)
          let notifData = {
            editedBy: this.userName,
            editedContent: whatChanged,
            issueTitle: this.currentIssue.title,
            issueId: this.issueId
          }
          this.socketService.notifyFollowers(notifData)
          this.router.navigate(['dashboard'])
          for (let x in whatChanged) {
            //       console.log("what cahnged: " +whatChanged[x])
            if (whatChanged[x] === 'assignee') {
              //       console.log("Inside notif loop")
              let notifNewAssigneeData = {
                newIssueTitle: this.currentIssue.title,
                newReporterName: this.userName
              }
              this.socketService.notifyNewAssigneeOfNewIssue(notifNewAssigneeData)
            }
          }
        } else {
          this.toastr.error(data.message)
        }
      })
    } else {
      this.toastr.error("No changes made!")
    }
  }


  // click event - to add a new comment to an issue
  addNewComment = () => {
    if (this.comments === null || this.comments === '' || this.comments.length === 0) {
      this.toastr.error("Comment can't be blank!")
    } else {

      let commentData = {
        commenterId: this.userInfo.userId,
        commenterName: this.userName,
        commentText: this.comments
      }

      this.appService.addNewComment(this.issueId, commentData).subscribe((data) => {
        if (data.status === 200) {

          this.commentsList = data.data.comments.reverse()

          this.comments = ''

          let notifData = {
            editedBy: this.userName,
            editedContent: 'comment',
            issueTitle: this.currentIssue.title,
            issueId: this.issueId
          }

          this.socketService.notifyFollowers(notifData)
        } else {
          this.toastr.error(data.message)
        }
      })
    }

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

}