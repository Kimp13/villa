import React from "react";

import { deleteCookie } from "../../libraries/cookies.js";

export default class Logout extends React.Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  componentDidMount() {
    deleteCookie('a');
    deleteCookie('jwt');
    window.location.href = '/';
  }
  render() {
    return null;
  }
}