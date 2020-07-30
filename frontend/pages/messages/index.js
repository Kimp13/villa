import React from "react";
import Loader from "../../components/Loader.js";
import Conversation from "../../components/Conversation.js";

import { getApiResponse } from "../../libraries/requests";
import { getCookie } from "../../libraries/cookies";

import "../../public/styles/pages/messages/index.module.scss";

export async function getStaticProps() {
  return {
    props: {
      title: 'Сообщения'
    }
  }
}

class Messages extends React.Component {
  constructor(props) {
    super(props);

    let jwt = getCookie("jwt"),
        a = getCookie("a");

    if (a && this.props.socket.user.isAnonymous) {
      this.auth = {a};
    } else if (jwt && this.props.socket.user.isAnonymous === false) {
      this.auth = {jwt};
    } else {
      window.loaction.href = '/auth';
    }

    this.state = {
      conversations: new Array(),
      loading: true,
      skip: 0
    }

    this.checkScroll = this.checkScroll.bind(this);

    getApiResponse("/villa-user-management/getConversationsCount", this.auth)
      .then(count => {
        count = parseInt(count);

        if (count > 0) {
          this.state.skip = 0;
          this.state.loading = false;
          this.state.count = count;
          this.checkScroll(
            false,
            document.getElementsByClassName('conversations-content')[0]
          );
        } else {
          this.setState({
            loading: false,
            conversations: [
              <p className="conversations-content-null" key="0">
                Нет разговоров
              </p>
            ],
            skip: 0,
            count
          });
        }
      }, e => console.log(e));
  }

  checkScroll(event, element) {
    if (event) element = event.target;

    if (this.state.skip < this.state.count) {
      if (element.scrollHeight - (element.scrollTop + element.clientHeight) <= 50) {
        this.createConversations();
      }
    } else {
      document.getElementsByClassName('conversations-content')[0].onscroll = null;
    }
  }

  createConversations() {
    this.state.loading = true;
    this.setState(this.state);
    let element = document.getElementsByClassName('conversations-content')[0];

    getApiResponse('/villa-user-management/getConversations', {
      ...this.auth,
      _skip: this.state.skip
    })
      .then(data => {
        let conversations = new Array();

        for (let i = 0; i < data.length; i += 1) {
          conversations.push(/*
          <Conversation socket={this.props.socket} data={data[i]} key={this.state.skip + i} />
          */
          <p>
            {data[i].lastMessage.text}
          </p>
         );
        }

        this.state.conversations =
          this.state.conversations.concat(conversations);
        this.state.skip += 10;
        this.state.loading = false;

        this.setState(this.state);
      }, e => console.log(e));
  }

  render() {
    return (
      <div className="conversations">
        <div className="conversations-header">
          Сообщения
        </div>
        <div className="conversations-content" onScroll={this.checkScroll}>
          {this.state.conversations}
          {this.state.loading ? <Loader itemsCount={4} animationDuration={2000} animationDelay={100}/> : null }
        </div>
      </div>
    );
  }
}

export default Messages;