import React from "react";

import Loader from "./Loader";

import { shortenTextTo } from "../libraries/texts.js";
import { getApiResponse, postApi } from "../libraries/requests.js";

import "../public/styles/components/conversation.module.scss";

class RejectConfirmation extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let styleObject;

    if (this.props.shown) {
      styleObject = {};
    } else {
      styleObject = {display: 'none'};
    }

    return (
      <div
        className="confirmation-wrapper"
        style={{
          display: this.props.shown ?
                   'block' :
                   'none'
        }}
      >
        <div className="confirmation">
          You really want to reject it? Have you thought twice?
        </div>
      </div>
    );
  }
}

export default class Conversation extends React.Component {
  constructor(props) {
    super(props);

    let update = () => {
          if (this.state.opened && !this.state.rejectConfirmation) {
            if (!this.state.loading && this.state.count > 0) {
              let messages = 
                    document.getElementsByClassName('conversation-content-message'),
                  element;
              
              if (this.state.skip > this.state.count) {
                element = messages[(this.state.count - 1) % 50];
              } else {
                element = messages[49];
              }

              element.scrollIntoView();
            }
          } else {
            let elements = 
                  document.getElementsByClassName('conversation-content-message'),
                length = elements.length;

            for (let i = 0; i < length; i += 1) {
              elements[0].remove();
            }

            elements = document.getElementsByClassName('conversation-content-author');
            length = elements.length;

            for (let i = 0; i < length; i += 1) {
              elements[0].remove();
            }
          }
        };

    this.props.socket.on('newMessage', data => {
      if (data.conversationId === props.data.id) {
        this.setState((state, props) => {
          if (state.opened) {
            this.pushMessages([data], state, props);
          } else {
            state.newMessages.push(data);
          }
          console.log(data);
          state.lastMessage = data;
          return state;
        });
      }
    });

    this.rooms = new Object();
    
    String.prototype.cleanInside = function() {
      return this.replace(/  +/g, ' ').replace(/\n\n+/g, '\n');
    };

    this.state = {
      opened: false,
      rejectConfirmation: false,
      loading: true,
      scrollDisabled: false,
      skip: 0,
      lastMessage: this.props.data.lastMessage,
      messages: new Array(),
      newMessages: new Array()
    };

    getApiResponse('/villa-user-management/getMessagesCount', {
      ...this.props.auth,
      conversationId: this.props.data.id
    }).then(count => {
      if (count > 0) {
        if (count <= 50) {
          this.state.scrollDisabled = true;
          if (count === 0) {
            this.state.messages = [

            ];
          }
        }

        this.componentDidUpdate = update;

        this.state.count = count;
        this.addMessages();
      } else {
        this.setState((state, props) => {
          state.scrollDisabled = true;
          state.messages = [
            <p className="conversation-content-null" key="n">
              Нет сообщений
            </p>
          ];
          state.count = 0;
          return state;
        });
      }
    }, e => console.log(e));

    this.toggle = this.toggle.bind(this);
    this.checkScroll = this.checkScroll.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.inputTextarea = this.inputTextarea.bind(this);
  }

  addMessages() {
    this.state.loading = true;
    this.setState(this.state);

    getApiResponse('/villa-user-management/getMessages', {
      ...this.props.auth,
      _skip: this.state.skip,
      conversationId: this.props.data.id
    })
      .then(data => {
        if (data) {
          data = data.reverse();
        }

        this.setState((state, props) => {
          this.pushMessages(data, state, props);

          state.skip += 50;

          if (state.skip >= this.state.count) {
            state.scrollDisabled = true;
          }

          state.loading = false;
          return state;
        });
      }, e => console.log(e));
  }

  toggle() {
    this.setState((state, props) => {
      if (state.opened) {
        state.opened = false;
      } else {
        state.opened = true;
      }

      return state;
    });
  }

  checkScroll(event, element) {
    if (!this.state.loading) {
      if (event) element = event.target;

      if (element.scrollTop < 50) this.addMessages();
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

  sendMessage(e, field) {
    if (e) {
      e.preventDefault();
      let target = e.target;

      while (target.nodeName !== 'BUTTON') {
        target = target.parentNode;
      }

      field = target.previousElementSibling;
    }

    let value = field.value.trim().cleanInside();

    if (value.length > 0) {
      this.props.socket.emit('newMessage', {
        ...this.props.auth,
        text: value,
        conversationId: this.props.data.id
      });
    }

    field.value = '';
  }

  inputTextarea(e) {
    if (e.key === 'Enter') {
      if (!(e.ctrlKey || e.shiftKey)) {
        this.sendMessage(false, e.target);
      }
    }
    e.target.style.height = `${this.getNumberOfLines(e.target.value) * 1.5}rem`;
  }

  createBooking(messageId, accepted, parts) {
    postApi('/villa-user-management/createBooking', {
      ...this.props.auth,
      messageId,
      accepted,
      roomId: parts[0],
      from: parts[1],
      to: parts[2]
    });
  }

  closeBooking(index, data, parts) {
    //this.createBooking(message.id, false, parts);

    this.setState((state, props) => {
      data.text += '_rejected';
      state.messages[index] = this.createMessage(data, state.messages[index].key);
      return state;
    });
  }

  acceptBooking(index, data, parts) {
    //this.createBooking(message.id, true, parts);
    this.setState((state, props) => {
      data.text += '_accepted';
      state.messages[index] = this.createMessage(data, state.messages[index].key);
      return state;
    });
  }

  createMessage(data, key) {
    if (data.type === 'booking') {
      let parts = data.text.split('_'),
          footer = null,
          newText,
          elementClassName,
          paragraphText;

      if (this.rooms[parts[0]]) {
        paragraphText = this.rooms[parts[0]];
      } else {
        paragraphText = 'Загрузка номера...';
        getApiResponse(`/rooms/${parts[0]}`).then(room => {
          this.rooms[parts[0]] = room.name;
        }, e => {
          console.log(e);
        });
      }

      if (parts[3] === 'rejected') {
        newText = `Бронирование закрыто`;
        elementClassName = 'rejected';
      } else if (parts[3] === 'accepted') {
        newText = `Бронирование принято`;
        elementClassName = 'accepted';
      } else {
        newText = `Заявка на бронирование`;
        elementClassName = 'pending';
        if (this.props.socket.user.isRoot) {
          let length = this.state.messages.length;
          footer = (
            <div className="conversation-content-message-footer">
              <button
                onClick={
                  () => this.closeBooking(length, data, parts)
                }
              >
                Закрыть
              </button>
              <button
                onClick={
                  () => this.acceptBooking(length, data, parts)
                }
              >
                Принять
              </button>
            </div>
          );
        }
      }

      return (
        <div
          className="conversation-content-message booking"
          data-author-id={data.authorId}
          key={key}
        >
          <div className={elementClassName}>
            {newText}
          </div>
          <div>
            <p>
              {paragraphText}
            </p>
            <p>
              {`Заезд: ${parts[1]}`}
            </p>
            <p>
              {`Отъезд: ${parts[2]}`}
            </p>
          </div>
          {footer}
        </div>
      );
    } else {
      return (
        <p
          className="conversation-content-message"
          data-author-id={data.authorId} 
          key={key}
        >
          {data.text}
        </p>
      );
    }
  }

  pushMessages(messages, state, props) {
    for (let i = 0; i < messages.length; i += 1) {
      let key = state.skip + i;

      if (key === 0 ||
          state.messages[state.messages.length - 1].props['data-author-id'] !==
          messages[i].authorId) {
        state.messages.push(
          <p className="conversation-content-author" key={'a' + key}>
            {messages[i].authorId === props.socket.user.id ?
              'Вы' :
              props.data.participants[messages[i].authorId].name}
          </p>
        );
      }

      state.messages.push(this.createMessage(messages[i], key));
    }
  }

  render() {
    let conversationName = new String(),
        participantsIds = Object.keys(this.props.data.participants);

    for (let key of participantsIds) {
      if (key !== this.props.socket.user.id) {
        let participant = this.props.data.participants[key];

        if (conversationName.length > 0) {
          conversationName += ', ';
        }

        conversationName += this.state.opened ?
          participant.name + ' ' +
          participant.surname :
          participant.name;

        if (this.props.socket.user.isRoot) {
          conversationName += ` (${participant.phoneNumber})`;
        }
      }
    }

    if (this.state.opened) {
      if (this.state.newMessages.length > 0) {
        this.state.messages.push(
          <p className="conversation-content-null">
            Новые сообщения
          </p>
        );

        this.pushMessages(this.state.newMessages, this.state, this.props);
        this.state.newMessages = new Array();
      }

      return (
        <div className="conversation opened">
          <h3 className="conversation-header">
            {
              (participantsIds.length > 2 ? 'Чат с: ' : '') +
                shortenTextTo(conversationName, 256)
            }
            <button className="opened" onClick={this.toggle}>
              <i className="fas fa-times"/>
            </button>
          </h3>
          <div
            className="conversation-content"
            onScroll={this.state.scrollDisabled ? null : this.checkScroll}
          >
            {this.state.messages}
          </div>
          <form className="conversation-send">
            <textarea
              className="conversation-send-textarea"
              placeholder="Напишите сообщение..."
              onKeyUp={this.inputTextarea}
            />
            <button className="conversation-send-submit" onClick={this.sendMessage}>
              <i className="fas fa-paper-plane" />
            </button>
          </form>
          <RejectConfirmation
            shown={this.state.rejectConfirmation}
          />
        </div>
      );
    } else {
      let lastMessage,
          newMessagesCounter = null;

      this.state.lastMessage = this.props.data.lastMessage;

      if (this.state.count > 0) {
        let authorId = this.state.lastMessage.authorId,
            authorName;

        if (authorId === this.props.socket.user.id) {
          authorName = 'Вы:';
        } else {
          authorName = `${this.props.data.participants[authorId].name}:`;
        }

        if (this.state.lastMessage.type === 'booking') {
          let parts = this.state.lastMessage.text.split('_'),
              text,
              elementClassName;

          if (parts[2] === 'rejected') {
            text = `Закрытое бронирование с ${parts[1]} по ${parts[2]}`;
            elementClassName = 'rejected';
          } else if (parts[2] === 'accepted') {
            text = `Принятое бронирование с ${parts[1]} по ${parts[2]}`;
            elementClassName = 'accepted';
          } else {
            text = `Заявка на бронирование с ${parts[1]} по ${parts[2]}`;
            elementClassName = 'pending';
          }

          lastMessage = (
            <React.Fragment>
              <span className="conversation-last-message-author">{authorName}</span>
              <span className={`conversation-last-message-booking ${elementClassName}`}>
                {text}
              </span>
            </React.Fragment>
          );
        } else {
          lastMessage = (
            <React.Fragment>
              <span className="conversation-last-message-author">{authorName}</span>
              {shortenTextTo(this.state.lastMessage.text, 120)}
            </React.Fragment>
          );
        }
      } else {
        lastMessage = 
          <span className="conversation-last-message-null">Нет сообщений</span>;
      }

      if (this.state.newMessages.length > 0) {
        newMessagesCounter = <div className="conversation-last-counter">
                              {this.state.newMessages.length}
                             </div>
      }
        
      return (
        <div className={"conversation"} onClick={this.toggle}>
          <h3 className="conversation-header">
            {
              (participantsIds.length > 2 ? 'Чат с: ' : '') +
                shortenTextTo(conversationName, 80)
            }
            <button>
              <i className="fas fa-times"/>
            </button>
          </h3>
          <div className="conversation-last">
            <div className="conversation-last-message">
              {lastMessage}
            </div>
            {newMessagesCounter}
          </div>
        </div>
      );
    }
  }
}