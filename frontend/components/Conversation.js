import React, { useState } from "react";

import Loader from "./Loader";
import ChooseDate from "./ChooseDate";

import { shortenTextTo } from "../libraries/texts.js";
import { getApiResponse, postApi } from "../libraries/requests.js";

import "../public/styles/components/conversation.module.scss";

function RejectConfirmation(props) {
  function makeDateString(date) {
    return `${date.day}.${date.month}.${date.year}`;
  }

  if (props.data) {
    let dateFrom = new Date();
    dateFrom.setTime(dateFrom.getTime() - 2160000000);
    let dateTo = new Date(dateFrom.getTime() + 17280000000);

    dateFrom = {
      day: dateFrom.getDate(),
      month: dateFrom.getMonth() + 1,
      year: dateFrom.getFullYear()
    };
    dateTo = {
      day: dateTo.getDate(),
      month: dateTo.getMonth() + 1,
      year: dateTo.getFullYear()
    };

    let [state, setState] = useState({
          phase: 0,
          from: null,
          to: null
        }),
        phaseContents = [
          (
            <React.Fragment>
              <p className="confirmation-content-label">
                Вы действительно хотите закрыть бронирование?
              </p>
              <button className="confirmation-content-button no" onClick={props.close}>
                Нет
              </button>
              <button
                className="confirmation-content-button yes"
                onClick={() => {
                  props.data.reject();
                  setState({phase: 1});
                }}
              >
                Да
              </button>
            </React.Fragment>
          ),
          (
            <React.Fragment>
              <p className="confirmation-content-label">
                Создать бронирование, которое закрывает дату?
              </p>
              <button className="confirmation-content-button no" onClick={props.close}>
                Нет
              </button>
              <button
                className="confirmation-content-button maybe"
                onClick={() => {
                  setState({phase: 2})
                }}
              >
                Ввести дату вручную
              </button>
              <button
                className="confirmation-content-button yes"
                onClick={() => {
                  props.data.book();
                  props.close();
                }}
              >
                Да
              </button>
            </React.Fragment>
          ),
          (
            <React.Fragment>
              <p className="confirmation-content-label">
                Введите дату:
              </p>
              <ChooseDate
                bookings={new Array()}
                from={dateFrom}
                to={dateTo}
                setData={(from, to) => {
                  setState({
                    from,
                    to,
                    phase: state.phase
                  });
                }}
              />
              <button
                className="confirmation-content-button no"
                onClick={() => {
                  setState({phase: 1})
                }}
              >
                Назад
              </button>
              {state.from && state.to ?
                <button
                  className="confirmation-content-button yes"
                  onClick={() => {
                    props.data.book(
                      makeDateString(state.from),
                      makeDateString(state.to)
                    );
                  }}
                >
                  Создать
                </button> :
                null}
            </React.Fragment>
          )
        ];


    return (
      <div className="confirmation-wrapper">
        <div className="confirmation">
          <button className="confirmation-close" onClick={props.close}>
            <i className="fas fa-times" />
          </button>
          <div className="confirmation-content">
            {phaseContents[state.phase]}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default class Conversation extends React.Component {
  constructor(props) {
    super(props);

    this.updateAtScroll = () => {
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
      }
    };

    this.updateAtNewMessage = () => {
      let element = document.getElementsByClassName('conversation-content')[0];

      if (element.scrollHeight - element.scrollTop - element.clientHeight <= 50) {
        element.lastElementChild.scrollIntoView();
      }
    };

    this.componentDidUpdate = () => {
      if (this.state.opened) {
        document.getElementsByClassName('conversation-content')[0]
          .lastElementChild
          .scrollIntoView();
      }
    };

    this.props.socket.on('newMessage', data => {
      if (data.conversationId === props.data.id) {
        this.setState((state, props) => {
          this.componentDidUpdate = this.updateAtNewMessage;


          state.skip += 1;
          state.count += 1;
          state.lastMessage.authorId = data.authorId;
          state.lastMessage.created_at = data.created_at;
          state.lastMessage.text = data.text;
          state.lastMessage.type = data.type;

          if (state.opened) {
            state.messages.push(this.createMessage(
              data,
              (data.authorId === this.props.socket.user.id) ?
                't' :
                'r'
            ));
          } else {
            state.newMessages.push(data);
          }

          return state;
        });
      }
    });

    this.rooms = new Object();
    this.auth = this.props.auth.substring(0, 4) === 'Anon' ? {
      jwta: this.props.auth.substring(5)
    } : {
      jwt: this.props.auth.substring(7)
    };

    this.state = {
      opened: false,
      rejectConfirmation: false,
      loading: true,
      scrollDisabled: false,
      skip: 0,
      pendingMessagesCount: 0,
      lastMessage: this.props.data.lastMessage,
      messages: new Array(),
      newMessages: new Array()
    };

    getApiResponse('/villa/getMessagesCount', {
      conversationId: this.props.data.id
    }, this.props.auth).then(count => {
      if (count > 0) {
        if (count <= 50) {
          this.state.scrollDisabled = true;
        }

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

    getApiResponse('/villa/getMessages', {
      _skip: this.state.skip,
      conversationId: this.props.data.id
    }, this.props.auth)
      .then(data => {

        this.setState((state, props) => {
          this.unshiftMessages(data, state, props);

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
        state.messages[this.findByKey("null")] = null;
      } else {
        state.opened = true;
      }

      return state;
    });
  }

  checkScroll(event, element) {
    if (!this.state.loading) {
      if (event) element = event.target;

      if (element.scrollTop < 50) {
        this.componentDidUpdate = this.updateAtScroll;
        this.addMessages();
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

  sendMessage(e, field) {
    if (e) {
      e.preventDefault();
      let target = e.target;

      while (target.nodeName !== 'BUTTON') {
        target = target.parentNode;
      }

      field = target.previousElementSibling;
    }

    let value = field.value.trim().replace(/  +/g, ' ').replace(/\n\n+/g, '\n');

    if (value.length > 0) {
      this.setState((state, props) => {
        let message = new Object();

        message.authorId = this.props.socket.user.id;
        message.text = value;
        message.id = 'd' + Date.now();
        message.type = 'text';

        state.messages.push(this.createMessage(message, 'd'));

        postApi('/villa/sendMessage', {
          text: value,
          conversationId: this.props.data.id,
          ...this.auth
        })
          .then(res => {
            this.setState((state, props) => {
              let index = this.linearReverseFindByKey(message.id);

              if (this.findByKey(res.id) === -1) {
                if (res.ok) {
                  message.id = res.statusText;

                  state.messages[index] = this.createMessage(message, 's');
                } else {
                  let count = document.getElementsByClassName('fa-exclamation-circle').length;
                  message.id = 'e' + count;

                  state.messages[index] = this.createMessage(message, 'e');
                }
              } else {
                state.messages.splice(index, 1);
              }

              state.pendingMessagesCount -= 1;
              return state;
            });
          }, e => {
            console.log(e);
          });

        return state;
      })
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

  linearReverseFindByKey(key) {
    key = String(key);

    for (let i = this.state.messages.length - 1; i >= 0; i -= 1) {
      if (this.state.messages[i].key === key) {
        return i;
      }
    }

    return -1;
  }

  findByKey(key) {
    key = parseInt(key, 10);

    let l = 0, r = this.state.messages.length, m, num;

    while (r - l > 0) {
      m = parseInt((l + r) / 2, 10);

      if (this.state.messages[m].key.charCodeAt(0) > 57) {
        l += 1;
      } else {
        num = Number(this.state.messages[m].key);

        if (num === key) {
          return m;
        } else if (num > key) {
          r = m;
        } else {
          l = m;
        }
      }
    }

    return -1;
  }

  createBooking(messageId, accepted, parts) {
    postApi('/villa/createBooking', {
      ...this.props.auth,
      messageId,
      accepted,
      roomId: parts[0],
      from: parts[1],
      to: parts[2]
    });
  }

  closeBooking(key, data, parts) {
    this.setState((state, props) => {
      state.rejectConfirmation = {
        book: (from = parts[1], to = parts[2]) => {
          this.createBooking(data.id, false, [parts[0], from, to]);
          this.setState((state, props) => {
            state.rejectConfirmation = false;
            return state;
          });
        },
        reject: () => {
          let index = this.findByKey(key);

          data.text += '_rejected';

          if (index) {
            this.setState((state, props) => {
              state.messages[index] = this.createMessage(data);
              return state;
            });
          }
        }
      };
      return state;
    });
  }

  acceptBooking(key, data, parts) {
    this.createBooking(data.id, true, parts);

    this.setState((state, props) => {
      data.text += '_accepted';
      state.messages[this.findByKey(key)] = this.createMessage(data);
      return state;
    });
  }

  createMessage(data, status = 'r') {
    const statusToIcon = status => {
      if (status !== 'r') {
        const statuses = {
          'd': 'far fa-clock',
          's': 'fas fa-check',
          't': 'fas fa-check-double',
          'e': 'fas fa-exclamation-circle'
        };

        return <i className={statuses[status]} />;
      }

      return null;
    }
    const key = data.id;

    if (data.type === 'booking') {
      let parts = data.text.split('_'),
          footer = null,
          length = this.state.messages.length,
          newText,
          elementClassName,
          paragraphText;

      if (this.props.rooms[parts[0]]) {
        paragraphText = `Номер: ${this.props.rooms[parts[0]]}`;
      } else {
        paragraphText = 'Загрузка номера...';
        getApiResponse(`/rooms/${parts[0]}`).then(room => {
          this.setState((state, props) => {
            props.assignRoom(parts[0], room.name);
            state.messages[this.findByKey(key)] = this.createMessage(data);
            return state;
          });
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
          footer = (
            <div className="booking-footer">
              <button
                className="booking-footer-button"
                onClick={
                  () => this.closeBooking(key, data, parts)
                }
              >
                Закрыть
              </button>
              <button
                className="booking-footer-button"
                onClick={
                  () => this.acceptBooking(key, data, parts)
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
          <div className={"booking-header " + elementClassName}>
            {newText}
          </div>
          <div className="booking-main">
            <p className="booking-main-paragraph">
              {paragraphText}
            </p>
            <p className="booking-main-paragraph">
              {`Заезд: ${parts[1]}`}
            </p>
            <p className="booking-main-paragraph">
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
          {statusToIcon(status)}
        </p>
      );
    }
  }

  unshiftMessages(messages, state, props) {
    let authorId,
        length = state.messages.unshift(
          this.createMessage(messages[0])
        );

    for (let i = 1; i < messages.length; i += 1) {
      authorId = state.messages[0].props['data-author-id'];
      if (authorId !== messages[i].authorId) {
        state.messages.unshift(
          <p className="conversation-content-author" key={'a' + state.messages[0].key}>
            {authorId === props.socket.user.id ?
              'Вы' :
              props.data.participants[authorId].name}
          </p>
        );
      }

      length = state.messages.unshift(this.createMessage(messages[i]));
    }

    authorId = state.messages[0].props['data-author-id'];
    state.messages.unshift(
      <p className="conversation-content-author" key={'a' + state.messages[0].key}>
        {authorId === props.socket.user.id ?
          'Вы' :
          props.data.participants[authorId].name}
      </p>
    );
  }

  pushMessages(messages, state, props) {
    let length = state.messages.length, i = 0;

    if (length === 0) {
      state.messages.push(
        <p className="conversation-content-author" key={'a' + messages[0].id}>
          {messages[0].authorId === props.socket.user.id ?
            'Вы' :
            props.data.participants[messages[0].authorId].name}
        </p>
      );

      length = state.messages.push(this.createMessage(messages[0]));
      i += 1;
    }


    for (i; i < messages.length; i += 1) {
      if (state.messages[length - 1].props['data-author-id'] !== messages[i].authorId) {
        state.messages.push(
          <p className="conversation-content-author" key={'a' + messages[i].id}>
            {messages[i].authorId === props.socket.user.id ?
              'Вы' :
              props.data.participants[messages[i].authorId].name}
          </p>
        );
      }

      length = state.messages.push(this.createMessage(messages[i]));
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
          <p className="conversation-content-null" key="null">
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
            <button
              className="conversation-header-button opened"
              onClick={this.toggle}
            >
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
            data={this.state.rejectConfirmation}
            close={() => this.setState((state, props) => {
              state.rejectConfirmation = false;
              return state;
            })}
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

          if (parts[3] === 'rejected') {
            text = `Закрытое бронирование с ${parts[1]} по ${parts[2]}`;
            elementClassName = 'rejected';
          } else if (parts[3] === 'accepted') {
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