import React from "react";

import Loader from "./Loader.js";

import { shortenTextTo } from "../libraries/texts.js";

import "../public/styles/components/conversation.module.scss";

export default class Conversation extends React.Component {
  constructor(props) {
    super(props);

    let update = () => {
          if (this.state.opened && !this.state.loading) {
            let messages = document.getElementsByClassName('conversation-content-message');
            if (this.state.skip !== this.initialAmountOfMessages) {
              let element = messages[49];

              element.scrollIntoView();

              this.checkScroll(false, element.parentNode);
            } else {
              messages[this.state.skip - 1].scrollIntoView();
            }
          }
        };
    
    String.prototype.cleanInside = function() {
      return this.replace(/\s\s+/g, ' ');
    };

    this.state = {
      opened: false,
      loading: true,
      skip: 0,
      scrollDisabled: false
    }

    this.getMessages(true)
      .then(data => {
        this.getMessagesCount()
          .then(count => {
            let scrollDisabled = (count <= 50);
            if (scrollDisabled) {
              this.componentDidUpdate = null;
            } else {
              this.componentDidUpdate = update;
            }
            this.setState({
              messages: data[0],
              loading: false,
              skip: data[1],
              opened: this.state.opened,
              count,
              scrollDisabled
            });
            this.participants = Object();
            for (let participant of this.props.data.participants) {
              this.participants[participant.id] = participant;
            }
            this.initialAmountOfMessages = data[1];
          });
      });

    this.toggle = this.toggle.bind(this);
    this.checkScroll = this.checkScroll.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.inputTextarea = this.inputTextarea.bind(this);
  }

  async getMessages(firstTime) {
    let limit = 50;
    if (firstTime) {
      let fontSize = window.innerHeight / 50,
          parentSize = window.innerHeight - 4.5 * fontSize,
          messagesAmount = parseInt(parentSize / fontSize) + 1;

      if (messagesAmount > limit) {
        limit = messagesAmount;
      }
    }
    let response = await fetch(window.location.origin + ':1337/villa-user-management/getMessages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skip: this.state.skip,
          socketId: this.props.socket.id,
          conversationId: this.props.data.id,
          limit
        })
      }
    );
    response = await response.json();
    return firstTime ? [response, limit] : response;
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

  checkScroll(event, element) {
    if (!this.state.loading) {
      if (event) element = event.target;

      if (element.scrollTop < 50) {
        this.state.loading = true;
        this.getMessages().then(newMessages => {
          this.state.messages = this.state.messages.concat(newMessages);
          this.state.loading = false;
          this.setState(this.state);
          this.state.skip += 50;
          if (this.state.skip >= this.state.count) {
            this.componentDidUpdate = null;
            this.state.scrollDisabled = true;
            this.setState(this.state);
            document.getElementsByClassName('conversation-content-message')[this.state.count % 50].scrollIntoView();
          } else {
            this.setState(this.state);
          }
        });
      }
    }
  }

  getNumberOfLines(value) {
    let result = 1;
    for (let i = 0; i < value.length; i += 1) {
      if (value.charAt(i) === '\n') {
        result += 1;
      }
    }
    return result;
  }

  sendMessage(e, value) {
    if (e) value = e.target.previousElementSibling.value.trim().cleanInside();
    if (value.length > 0) {
      this.props.socket.emit('newMessage', {
        author: this.props.socket.user.id
      });
    }
  }

  inputTextarea(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      this.sendMessage(false, e.target.value.trim().cleanInside());
    } else {
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  }

  render() {
    let conversationName;
    for (let participant of this.props.data.participants) {
      if (participant.id !== this.props.socket.user.id) {
        if (conversationName === undefined) {
          conversationName = participant.name;
        } else {
          conversationName = `${conversationName}, ${participant.name}`;
        }
      }
    }
    if (this.state.opened) {
      let messages = Array();
      if (this.state.count > 0) {
        let authorName,
            messagesCount = this.state.messages.length - 1,
            authorId = this.state.messages[messagesCount].authorId; 

        if (this.state.loading) {
          messages.push(<Loader />);
        }

        if (authorId === this.props.socket.user.id) {
          authorName = 'Вы';
        } else {
          authorName = this.participants[authorId].name;
        }
        messages.push(
          <p className="conversation-content-author" key="as">
            {authorName}
          </p>
        );
        messages.push(
          <p className="conversation-content-message" key={messagesCount}>
            {this.state.messages[messagesCount].text}
          </p>
        );
        for (let i = messagesCount - 1; i >= 0; i -= 1) {
          let authorId = this.state.messages[i].authorId;
          if (authorId !== this.state.messages[i + 1].authorId) {
            if (authorId === this.props.socket.user.id) {
              authorName = 'Вы';
            } else {
              authorName = this.participants[authorId].name;
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
          <form className="conversation-send" onSubmit={this.sendMessage}>
            <textarea className="conversation-send-textarea" onKeyUp={this.inputTextarea} />
            <button className="conversation-send-submit" type="submit">
              <i className="fas fa-paper-plane" />
            </button>
          </form>
        </div>
      );
    } else {
      let lastMessage;
      if (this.state.count > 0) {
        let authorId = this.props.data.lastMessage.authorId,
            authorName;

        if (authorId === this.props.socket.user.id) {
          authorName = 'Вы:';
        } else {
          authorName = `${this.participants[authorId].name}:`;
        }

        lastMessage = (
          <React.Fragment>
            <span className="conversation-content-author">{authorName}</span>
            {shortenTextTo(this.props.data.lastMessage.text, 120)}
          </React.Fragment>
        );
      } else {
        lastMessage = <span className="conversation-content-null">Нет сообщений</span>;
      }
        
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