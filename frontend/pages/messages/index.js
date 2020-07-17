import React from "react";

import Loader from "../../components/Loader.js";
import Conversation from "../../components/Conversation.js";

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
    if (!this.props.socket.user.isAuthenticated) {
      window.location.href = '/auth';
    }

    this.state = {
      conversations: null,
      loading: true,
      skip: 0
    }

    this.checkScroll = this.checkScroll.bind(this);

    this.props.socket.emit('getConversations');
    this.props.socket.on('getConversations', data => {
      this.props.socket.emit('getConversationsCount');
      this.props.socket.on('getConversationsCount', count => {
        this.setState({
          conversations: this.createConversations(data),
          loading: false,
          skip: 10,
          count
        });
        this.initialLoading();
        this.props.socket.off('getConversations');
        this.props.socket.off('getConversationsCount');
      });
    });
  }

  initialLoading() {
    let element = document.getElementsByClassName('conversations-content')[0];
    if (this.state.skip < this.state.count) {
      if (element.scrollHeight - (element.scrollTop + element.clientHeight) <= 50) {
        this.setState({
          conversations: this.state.conversations,
          skip: this.state.skip,
          count: this.state.count,
          loading: true
        });
        this.props.socket.emit('getConversations', {
          skip: this.state.skip
        });
        this.props.socket.on('getConversations', data => {
          let conversations = this.state.conversations + this.createConversations(data);
          this.setState({
            conversations,
            skip: this.state.skip + 10,
            loading: false,
            count: this.state.count
          });
          this.initialLoading();
        });
      } else {
        this.props.socket.off('getConversations');
      }
    } else {
      this.props.socket.off('getConversations');
    }
  }

  checkScroll(event, element) {
    if (event) element = event.target;

    if (this.state.skip < this.state.count) {
      if (element.scrollHeight - (element.scrollTop + element.clientHeight) <= 50) {
        this.setState({
          conversations: this.state.conversations,
          skip: this.state.skip,
          count: this.state.count,
          loading: true
        });
        this.props.socket.emit('getConversations', {
          skip: this.state.skip
        });
        this.props.socket.on('getConversations', data => {
          let conversations = this.state.conversations.concat(this.createConversations(data));
          this.setState({
            conversations,
            skip: this.state.skip + 10,
            loading: false,
            count: this.state.count
          });
          this.props.socket.off('getConversations');
        });
      }
    } else {
      document.getElementsByClassName('conversations-content')[0].onscroll = null;
    }
  }

  createConversations(data) {
    let conversations = Array(),
        id = this.state.skip;
    for (let i = 0; i < data.length; i += 1) {
      conversations.push(<Conversation socket={this.props.socket} data={data[i]} id={id} key={id} />);
      id += 1;
    }
    return conversations;
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