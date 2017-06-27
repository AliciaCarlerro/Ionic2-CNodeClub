import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TopicService } from '../../service/topic.service';
import { CollectService } from '../../service/collect.service';
import { RepliesService } from '../../service/replies.service';
import { UtilService } from '../../service/util.service';

@IonicPage()
@Component({
  selector: 'page-home-detail',
  templateUrl: 'home-detail.html'
})
export class HomeDetailPage implements OnInit {
  id: string;
  topicParams: any;
  topic: any;
  replyParams: any;
  collectParams: any;
  user: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private topicService: TopicService, private collectService: CollectService, private repliesService: RepliesService, private utilService: UtilService) {
    this.id = this.navParams.get('id');
    this.topic = {
      author: {
        loginname: '',
        avatar_url: ''
      },
      create_at: '',
      last_reply_at: '',
      content: '',
      visit_count: '',
      reply_count: '',
      replies: []
    }
    this.topicParams = {
      mdrender: true,
      accesstoken: ''
    }
    this.replyParams = {
      accesstoken: '',
      content: '',
      replyId: ''
    }
    this.collectParams = {
      accesstoken: '',
      topic_id: ''
    }
  }

  getTopicDetail() {
    this.topicService.getTopicDetail(this.id, this.topicParams).subscribe(
      data => this.topic = data.data
    );
  }

  collect(topic_id: string) {
    if (this.user) {
      this.collectParams.topic_id = topic_id;
      this.collectService.PostCollect(this.collectParams).subscribe(
        data => {
          if (data.success) {
            this.utilService.toast('收藏成功');
          }
          else {
            this.utilService.toast('收藏失败或已经收藏');
          }
        });
    }
    else {
      this.utilService.toast('请登录后进行操作');
    }
  }

  replieUps(replyId: string) {
    if (this.user) {
      this.repliesService.PutRepliesUps(replyId, { accesstoken: this.user.accesstoken }).subscribe(data => {
        if (data.success) {
          if (data.action === 'down') {
            this.utilService.toast('取消成功');
          }
          else {
            this.utilService.toast('点赞成功');
          }
        }
        else {
          this.utilService.toast('操作失败');
        }
      }, data => {
        this.utilService.toast(data.error_msg);
      })
    }
  }

  reReply(replyId: string, loginname: string) {
    this.replyParams.content = '@' + loginname + ' ';
    this.replyParams.replyId = replyId;
  }

  saveReply() {
    if (this.user) {
      if (this.replyParams.content.indexOf('@') < 0) {
        this.replyParams.reply_id = '';
      }
      this.repliesService.PostReplies(this.id, this.replyParams).subscribe((data) => {
        if (data.success) {
          let replie = {
            author: {
              loginname: this.user.loginname,
              avatar_url: this.user.avatar_url
            },
            content: '<div class=\"markdown-text\"><p>' + this.replyParams.content + '</p>\n</div>',
            id: data.reply_id
          };
          this.topic.replies.unshift(replie);
          this.utilService.toast('回复成功');
          this.replyParams.content = '';
        }
      });
    } else {
      this.utilService.toast('请登录后进行操作');
    }
  }

  ngOnInit() {
    this.utilService.getLoginStatus().then((logined) => {
      this.user = logined;
      if (logined) {
        this.topicParams.accesstoken = logined.accesstoken;
        this.replyParams.accesstoken = logined.accesstoken;
        this.collectParams.accesstoken = logined.accesstoken;
      }
    }).then(() => this.getTopicDetail());
  }
}