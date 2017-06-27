import { Component, OnInit } from '@angular/core';
import { App, IonicPage, NavController, NavParams, Events } from 'ionic-angular';


import { TopicService } from '../../service/topic.service';
import { UtilService } from '../../service/util.service';
import { MessageService } from '../../service/message.service';
import { HomeDetailPage } from './home-detail';
import { LoginPage } from '../login/login';
import { AccountPage } from '../account/account';
import { HomeAddPage } from './home-add';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  tab: string;
  topics: any[];
  params: any;
  user: any;
  messageCount: number;

  constructor(private appCtrl: App, private navCtrl: NavController, private navParams: NavParams, private events: Events, private topicService: TopicService, private utilService: UtilService, private messageService: MessageService) {
    this.tab = this.navParams.get('tab');
    this.params = {
      page: 1,
      tab: this.tab || 'all',
      limit: 20,
      mdrender: false
    }
    events.subscribe('messageCount', (data) => {
      this.messageCount = data;
    });
    events.subscribe('topicPush', (data) => {
      this.topics.unshift(data);
    });
  }

  GetTopics() {
    this.topicService.getTopics(this.params).subscribe(
      data => this.topics = data.data
    );
  }

  doRefresh(refresher) {
    this.params.page = 1;
    setTimeout(() => {
      this.topicService.getTopics(this.params).subscribe(
        data => {
          this.topics = data.data;
          refresher.complete();
        }
      );
    }, 2000);
  }

  doInfinite(infiniteScroll) {
    this.params.page++;
    setTimeout(() => {
      this.topicService.getTopics(this.params).subscribe(
        data => {
          if (data) {
            this.topics.push(...data.data);
            infiniteScroll.complete();
          }
          else {
            infiniteScroll.enable(false);
          }
        }
      );
    }, 500);
  }

  openPage(id: string) {
    this.appCtrl.getRootNav().push(HomeDetailPage, { id: id });
  }

  login() {
    if (this.user) {
      this.appCtrl.getRootNav().push(AccountPage);
    }
    else {
      this.appCtrl.getRootNav().push(LoginPage);
    }
  }

  addTopic() {
    if (this.user) {
      this.navCtrl.push(HomeAddPage);
    }
    else {
      this.utilService.toast('请登录后发帖');
    }
  }

  getMesssge() {
    this.messageService.GetMessageCount({ accesstoken: this.user.accesstoken }).subscribe(data => this.messageCount = data.data)
  }

  ngOnInit() {
    this.utilService.getLoginStatus().then((data) => {
      this.user = data;
    }).then(() => {
      if (this.user) {
        this.getMesssge();
      }
    }).then(() => this.GetTopics());
  }
}
