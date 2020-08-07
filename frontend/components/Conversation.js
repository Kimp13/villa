import React from "react";

import Loader from "./Loader.js";

import { shortenTextTo } from "../libraries/texts.js";
import { getApiResponse, postApi } from "../libraries/requests.js";

import "../public/styles/components/conversation.module.scss";

export default class Conversation extends React.Component {
  constructor(props) {
    super(props);

    let update = () => {
          if (this.state.opened) {
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
            let elements = document.getElementsByClassName('conversation-content-message'),
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

    this.newMessageHandler = data => {
      if (data.conversationId === this.props.data.id) {
        let container = document.getElementsByClassName('conversation-content')[0],
            newMessage = document.createElement('p');

        this.lastMessage = data;
        this.state.skip += 1;
        this.state.count += 1;

        if (this.state.messages[0] && 
            this.state.messages[0].authorId !== data.authorId) {
          let newAuthor = document.createElement('p');

          newAuthor.classList.add('conversation-content-author');
          newAuthor.innerHTML =
            data.authorId === this.props.socket.user.id ?
            'Вы' :
            this.props.data.participants[data.authorId].name;

          container.append(newAuthor);
        }

        this.state.messages.unshift(data);

        newMessage.classList.add('conversation-content-message');
        newMessage.innerHTML = data.text;

        container.append(newMessage);

        window.requestAnimationFrame(() => newMessage.scrollIntoView());
      }
    };

    this.rooms = new Object();
    
    String.prototype.cleanInside = function() {
      return this.replace(/  +/g, ' ').replace(/\n\n+/g, '\n');
    };

    this.state = {
      opened: false,
      loading: true,
      skip: 0,
      scrollDisabled: false,
      messages: new Array()
    };

    getApiResponse('/villa-user-management/getMessagesCount', {
      ...this.props.auth,
      conversationId: this.props.data.id
    }).then(count => {
      if (count <= 50) {
        this.state.scrollDisabled = true;
      }

      this.componentDidUpdate = update;

      this.state.count = count;
      this.addMessages();
    }, e => console.log(e));

    this.lastMessage = this.props.data.lastMessage;

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
        this.state.skip += 50;
        this.state.messages = this.state.messages.concat(data);

        if (this.state.skip >= this.state.count) {
          this.state.scrollDisabled = true;
        }

        this.state.loading = false;
        this.setState(this.state);
      }, e => console.log(e));
  }

  toggle() {
    if (this.state.opened) {
      this.props.socket.off('newMessage', this.newMessageHandler);
      this.state.opened = false;
      this.state.messages.unshift(...(this.props.newMessages.reverse()));
      this.state.skip += this.props.newMessages.length;
      this.state.count += this.props.newMessages.length;
      this.props.onClosing();
    } else {
      this.props.onOpening();
      this.props.socket.on('newMessage', this.newMessageHandler);
      this.state.opened = true;
    }

    this.setState(this.state);
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

  closeBooking(message, ref, parts) {
    this.createBooking(message.id, false, parts);

    ref.current.children[0].classList.remove('pending');
    ref.current.children[0].classList.add('rejected');
    ref.current.children[0].innerHTML = 'Закрытое бронирование';
    ref.current.children[2].style.display = 'none';

    message.text += '_rejected';
  }

  acceptBooking(message, ref, parts) {
    this.createBooking(message.id, true, parts);

    ref.current.children[0].classList.remove('pending');
    ref.current.children[0].classList.add('accepted');
    ref.current.children[0].innerHTML = 'Принятое бронирование';
    ref.current.children[2].style.display = 'none';

    message.text += '_accepted';
  }

  createMessage(message, key) {
    if (message.type === 'booking') {
      let parts = message.text.split('_'),
          newText,
          elementClassName,
          footer = null,
          messageRef = React.createRef(),
          paragraphText;

      if (this.rooms[parts[0]]) {
        paragraphText = this.rooms[parts[0]];
      } else {
        paragraphText = 'Загрузка номера...';
        getApiResponse(`/rooms/${parts[0]}`).then(room => {
          this.rooms[parts[0]] = room.name;
          messageRef
            .current
            .children[1]
            .children[0]
            .innerHTML = `Номер: ${room.name}`;
        }, e => {
          console.log(e);
          messageRef
            .current
            .children[1]
            .children[0]
            .innerHTML = `Ошибка загрузки комнаты.`;
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
          footer = (
            <div className="conversation-content-message-footer">
              <button
                onClick={() => this.closeBooking(message, messageRef, parts)}
              >
                Закрыть
              </button>
              <button
                onClick={() => this.acceptBooking(message, messageRef, parts)}
              >
                Принять
              </button>
            </div>
          );
        }
      }

      return (
        <div ref={messageRef} className="conversation-content-message booking" key={key}>
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
    }

    return (
      <p className="conversation-content-message" key={key}>
        {message.text}
      </p>
    );
  }

  render() {
    let conversationName = new String(),
        participantsIds = Object.keys(this.props.data.participants);

    for (let key of participantsIds) {
      if (key !== this.props.socket.user.id) {
        if (conversationName.length > 0) {
          conversationName += ', ';
        }

        conversationName += this.state.opened ?
          this.props.data.participants[key].name + ' ' +
          this.props.data.participants[key].surname :
          this.props.data.participants[key].name;

        if (this.props.socket.user.isRoot) {
          conversationName += ` (${this.props.data.participants[key].phoneNumber})`;
        }
      }
    }

    if (this.state.opened) {
      let messages = new Array();
      if (this.state.count > 0) {
        let messagesCount = this.state.messages.length - 1,
            authorId = this.state.messages[messagesCount].authorId,
            authorName;

        if (this.state.loading) {
          messages.push(<Loader key="l"/>);
        }

        authorName = authorId === this.props.socket.user.id ?
                      'Вы' :
                      this.props.data.participants[authorId].name;

        messages.push(
          <p className="conversation-content-author" key="as">
            {authorName}
          </p>
        );

        messages.push(
          this.createMessage(this.state.messages[messagesCount], messagesCount)
        );

        for (let i = messagesCount - 1; i >= 0; i -= 1) {
          authorId = this.state.messages[i].authorId;

          if (authorId !== this.state.messages[i + 1].authorId) {
            messages.push(
              <p className="conversation-content-author" key={'a' + i}>
                {
                  (authorId === this.props.socket.user.id) ?
                    'Вы' :
                    this.props.data.participants[authorId].name
                }
              </p>
            );
          }
          messages.push(
            this.createMessage(this.state.messages[i], i)
          );
        }

        if (this.props.newMessages.length > 0) {
          this.state.skip += this.props.newMessages.length;
          this.state.count += this.props.newMessages.length;

          messages.push(
            <p className="conversation-content-new" key={'new'}>
              Новые сообщения
            </p>
          );

          let authorId = this.props.newMessages[0].authorId;

          messages.push(
            <p className="conversation-content-author" key={'na' + 0}>
              {authorId === this.props.socket.user.id ?
                'Вы' :
                this.props.data.participants[authorId].name}
            </p>
          );

          messages.push(
            this.createMessage(this.props.newMessages[0], 'n' + 0)
          );

          for (let i = 1; i < this.props.newMessages.length; i += 1) {
            authorId = this.props.newMessages[i].authorId;
            if (authorId !== this.props.newMessages[i - 1].authorId) {
              messages.push(
                <p className="conversation-content-author" key={'na' + i}>
                  {
                    (authorId === this.props.socket.user.id) ?
                      'Вы' :
                      this.props.data.participants[authorId].name
                  }
                </p>
              );
            }
            messages.push(
              this.createMessage(this.props.newMessages[i], 'n' + i)
            );
          }
        }
      } else {
        messages = [
          <p className="conversation-content-null" key="0">
            Нет сообщений
          </p>
        ];
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
          <div className="conversation-content" onScroll={this.state.scrollDisabled ? null : this.checkScroll}>
            {messages}
          </div>
          <form className="conversation-send">
            <textarea className="conversation-send-textarea" onKeyUp={this.inputTextarea} />
            <button className="conversation-send-submit" onClick={this.sendMessage}>
              <i className="fas fa-paper-plane" />
            </button>
          </form>
        </div>
      );
    } else {
      let lastMessage,
          newMessagesCounter = null;

      this.lastMessage = this.props.data.lastMessage;

      if (this.state.count > 0) {
        let authorId = this.lastMessage.authorId,
            authorName;

        if (authorId === this.props.socket.user.id) {
          authorName = 'Вы:';
        } else {
          authorName = `${this.props.data.participants[authorId].name}:`;
        }

        if (this.lastMessage.type === 'booking') {
          let parts = this.lastMessage.text.split('_'),
              text,
              elementClassName;

          if (parts[2] === 'rejected') {
            text = `Закрытое бронирование с ${parts[0]} по ${parts[1]}`;
            elementClassName = 'rejected';
          } else if (parts[2] === 'accepted') {
            text = `Принятое бронирование с ${parts[0]} по ${parts[1]}`;
            elementClassName = 'accepted';
          } else {
            text = `Заявка на бронирование с ${parts[0]} по ${parts[1]}`;
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
              {shortenTextTo(this.lastMessage.text, 120)}
            </React.Fragment>
          );
        }
      } else {
        lastMessage = 
          <span className="conversation-last-message-null">Нет сообщений</span>;
      }

      if (this.props.newMessages.length > 0) {
        newMessagesCounter = <div className="conversation-last-counter">
                              {this.props.newMessages.length}
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