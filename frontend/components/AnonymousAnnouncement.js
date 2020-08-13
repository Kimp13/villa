import React, { useState } from "react";
import Link from "next/link";

import "../public/styles/components/anonymousAnnouncement.scss";

export default props => {
  let [closed, close] = useState(false);

  if (props.user.isAnonymous && !(closed || window.sessionStorage.getItem("aac"))) {
    return (
      <div className="anonymous-announcement">
        <p>
          Обращаем Ваше внимание, что Вы зарегистрированы как анонимный пользователь.
          Анонимный пользователь не имеет средства входа в аккаунт и не может
          восстановить данные при смене устройства или браузера. Вы можете
          зарегистрироваться&nbsp;
          <Link href="/auth?type=signup" as="/auth?type=signup"><a>
          здесь.
          </a></Link>
        </p>
        <button onClick={() => {
          window.sessionStorage.setItem("aac", true);
          close(true);
        }}>
          <i className="fas fa-times" />
        </button>
      </div>
    );
  }

  return null;
};