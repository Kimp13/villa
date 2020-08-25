import React from "react";
import Loader from "../../components/Loader";
import AnonymousAnnouncement from "../../components/AnonymousAnnouncement";
import Conversation from "../../components/Conversation";

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

    this.state = {
      conversations: new Array(),
      rooms: new Object(),
      loading: true,
      skip: 0
    }
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
    this.setState((state, props) => {
      let element = document.getElementsByClassName('conversations-content')[0];

      getApiResponse('/villa/getConversations', {
        _skip: this.state.skip
      }, this.auth)
        .then(data => {
          let conversations = new Array();

          for (let i = 0; i < data.length; i += 1) {
            conversations.push({
              key: this.state.skip + i,
              data: data[i],
              newMessages: new Array()
            });
          }

          this.setState((state, props) => {
            state.conversations = state.conversations.concat(conversations);
            state.skip += 10;
            state.loading = false;

            return state;
          });
        }, e => console.log(e));


      state.loading = true;
      return state;
    });
  }

  assignRoom(key, value) {
    this.setState((state, props) => {
      state.rooms[key] = value;
      return state;
    });
  }

  render() {
    if (this.props.socket.user) {
      if (this.state.loaded) {
        let conversations;
        
        if (this.state.noConversations) {
          conversations = <p className="conversations-content-null">Нет разговоров</p>;
        } else {
          conversations = new Array();

          for (let i = 0; i < this.state.conversations.length; i += 1) {
            conversations.push(
              <Conversation
                auth={this.auth}
                socket={this.props.socket}
                newMessages={this.state.conversations[i].newMessages}
                data={this.state.conversations[i].data}
                key={this.state.conversations[i].key}
                rooms={this.state.rooms}
                assignRoom={this.assignRoom}
              />
            );
          }
        }

        return (
          <div className="conversations">
            <div className="conversations-header">
              Сообщения
            </div>
            <AnonymousAnnouncement user={this.props.socket.user} />
            <div className="conversations-content" onScroll={this.checkScroll}>
              {conversations}
              {
                this.state.loading ?
                  <Loader
                    itemsCount={4}
                    animationDuration={2000}
                    animationDelay={100}
                  /> :
                  null
              }
            </div>
          </div>
        );
      } else {
        let jwt = getCookie("jwt"),
            jwta = getCookie("jwta");

        if (jwta && this.props.socket.user.isAnonymous) {
          this.auth = 'Anon ' + jwta;
        } else if (jwt && this.props.socket.user.isAnonymous === false) {
          this.auth = jwt;
        } else {
          window.location.href = '/auth';
        }

        this.newMessageHandler = data => {
          for (let i = 0; i < this.state.conversations.length; i += 1) {
            if (this.state.conversations[i].data.id === data.conversationId) return;
          }

          getApiResponse('/villa/getConversations', {
            id: data.conversationId
          }, this.auth)
            .then(conversation => {
              this.setState((state, props) => {
                state.skip += 1;
                state.count += 1;
                state.conversations.unshift({
                  data: conversation[0],
                  key: state.count,
                  newMessages: new Array(data)
                });

                return state;
              });
              
            }, e => {
              console.log(e);
              alert('Ошибка загрузки нового разговора.');
            });
        };

        this.props.socket.on('newMessage', this.newMessageHandler);

        this.checkScroll = this.checkScroll.bind(this);
        this.assignRoom = this.assignRoom.bind(this);

        getApiResponse("/villa/getConversationsCount", {}, this.auth)
          .then(count => {
            count = parseInt(count);

            if (count > 0) {
              this.state.skip = 0;
              this.state.loading = false;
              this.state.loaded = true;
              this.state.count = count;
              this.checkScroll(
                false,
                document.getElementsByClassName('conversations-content')[0]
              );
            } else {
              this.setState({
                loading: false,
                loaded: true,
                noConversations: true,
                skip: 0,
                count
              });
            }
          }, e => console.log(e));
      }
    }

    return <Loader />;
  }
}

export default Messages;