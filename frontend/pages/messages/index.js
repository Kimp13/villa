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

    this.jwt = getCookie("jwt");
    
    if (!(this.props.socket.user.isAuthenticated && (this.jwt !== null))) {
      window.location.href = '/auth';
    }

    this.state = {
      conversations: null,
      loading: true,
      skip: 0
    }

    this.checkScroll = this.checkScroll.bind(this);

    getApiResponse("/villa-user-management/getConversationsCount", {
      jwt: this.jwt
    })
      .then(count => {
        count = parseInt(count);

        if (count > 0) {
          this.createConversations(true);
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

  initialLoading() {
    let element = document.getElementsByClassName('conversations-content')[0];

    if (
      this.state.skip < this.state.count &&
      element.scrollHeight - (element.scrollTop + element.clientHeight) <= 50
    ) this.createConversations(true);
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

  createConversations(initial = false) {
    this.state.loading = true;
    this.setState(this.state);

    getApiResponse('/villa-user-management/getConversations', {
      jwt: this.jwt
    })
      .then(data => {
        let conversations = new Array();

        for (let i = 0; i < data.length; i += 1) {
          conversations.push(<Conversation socket={this.props.socket} data={data[i]} key={this.state.skip + i} />);
        }

        this.state.conversations =
          this.state.conversations.concat(this.createConversations(data));
        this.state.skip += 10;
        this.state.loading = false;
        this.setState(this.state);

        if (initial) this.initialLoading();
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