import React from "react";

import Loader from "./Loader.js";

import { shortenTextTo } from "../libraries/texts.js";

import "../public/styles/components/conversation.module.scss";

export default class Conversation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      loading: true,
      skip: 0,
      scrollDisabled: false
    }

    this.getMessages()
      .then(data => {
        this.getMessagesCount()
          .then(count => {
            this.setState({
              messages: data,
              loading: false,
              skip: 50,
              count,
              opened: this.state.opened,
              scrollDisabled: (count <= 50)
            });
          });
      });

    this.toggle = this.toggle.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.checkScroll = this.checkScroll.bind(this);
  }

  async getMessages() {
    let response = await fetch(window.location.origin + ':1337/villa-user-management/getMessages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skip: this.state.skip,
          socketId: this.props.socket.id,
          conversationId: this.props.data.id
        })
      }
    );
    response = await response.json();
    return response;
  }

  async getMessagesCount() {
    let response = await fetch(window.location.origin + ':1337/villa-user-management/getMessagesCount',
      {
        method: 'POST',
        body: this.props.data.id
      }
    );
    return parseInt(await response.text());
  }

  toggle() {
    this.state.opened = !this.state.opened;
    this.setState(this.state);
  }

  componentDidUpdate() {
    if (this.state.opened && this.state.skip > 0 && this.state.count > 0) {
      if (this.state.skip > this.state.count) {
        document.getElementsByClassName('conversation-content-message')[this.state.count % 50].scrollIntoView();
      } else {
        document.getElementsByClassName('conversation-content-message')[49].scrollIntoView();
      }
    }
  }

  checkScroll(event, element) {
    if (event) element = event.target;

    if (this.state.skip < this.state.count) {
      if (element.scrollTop < 50) {
        this.state.loading = true;
        this.setState(this.state);
        this.getMessages().then(newMessages => {
          this.state.messages = this.state.messages.concat(newMessages);
          this.state.loading = false;
          this.state.skip += 50;
          this.setState(this.state);
        });
      }
    } else {
      this.state.scrollDisabled = true;
      this.setState(this.state);
    }
  }

  render() {
    let conversationName;
    if (this.props.data.requesterId === 0) {
      conversationName = this.props.data.participants[1].name;
      for (let j = 2; j < this.props.data.participants.length; j += 1) {
        conversationName += ', ' + this.props.data.participants[j];
      }
    } else {
      conversationName = this.props.data.participants[0].name;
      for (let j = 1; j < this.props.data.requesterId; j += 1) {
        conversationName += ', ' + this.props.data.participants[j];
      }
      for (let j = this.props.data.requesterId + 1; j < this.props.data.participants.length; j += 1) {
        conversationName += ', ' + this.props.data.participants[j];
      }
    }
    if (this.state.opened) {
      let messages = Array();
      if (this.state.count > 0) {
        if (this.state.skip === 0) return <Loader />;
        let authorName,
            messagesCount = this.state.messages.length;
        if (this.state.messages[messagesCount - 1].authorId === this.props.data.requesterId) {
          authorName = 'Вы';
        } else {
          authorName = this.props.data.participants[this.state.messages[messagesCount - 1].authorId].name;
        }
        messages.push(
          <p className="conversation-content-author" key="astart">
            {authorName}
          </p>
        );
        messages.push(
          <p className="conversation-content-message" key={messagesCount - 1}>
            {this.state.messages[messagesCount - 1].text}
          </p>
        );
        for (let i = messagesCount - 2; i >= 0; i -= 1) {
          if (this.state.messages[i].authorId !== this.state.messages[i + 1].authorId) {
            if (this.state.messages[i].authorId === this.props.data.requesterId) {
              authorName = 'Вы';
            } else {
              authorName = this.props.data.participants[this.state.messages[i].authorId].name;
            }
            messages.push(
              <p className="conversation-content-author" key={'a' + i}>
                {authorName}
              </p>
            );
          }
          messages.push(
            <p className="conversation-content-message" key={i}>
              {this.state.messages[i].text}
            </p>
          );
        }
      } else {
        messages = [];
      }

      return (
        <div className="conversation opened">
          <h3 className="conversation-header">
            {'Чат с: ' + shortenTextTo(conversationName, 50)}
            <button className="opened" onClick={this.toggle}>
              <i className="fas fa-times"/>
            </button>
          </h3>
          <div className="conversation-content" onScroll={this.state.scrollDisabled ? null : this.checkScroll}>
            {messages}
          </div>
          <form className="conversation-send">
            
          </form>
        </div>
      );
    } else {
      let lastMessage = (this.state.count > 0) ?
        (
          <React.Fragment>
            <span className="conversation-content-author">
              {
                this.props.data.lastMessage.authorId === this.props.data.requesterId ?
                  'Вы:' :
                  this.props.data.participants[this.props.data.lastMessage.authorId].name + ':'
              }
            </span>
            {shortenTextTo(this.props.data.lastMessage.text, 120)}
          </React.Fragment>
        ) :
        <span className="conversation-content-null">Нет сообщений</span>;

      return (
        <div className={"conversation"} onClick={this.toggle}>
          <h3 className="conversation-header">
            {'Чат с: ' + shortenTextTo(conversationName, 50)}
            <button>
              <i className="fas fa-times"/>
            </button>
          </h3>
          <div className="conversation-content">
            {lastMessage}
          </div>
        </div>
      );
    }
  }
}