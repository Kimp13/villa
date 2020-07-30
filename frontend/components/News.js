import { getApiResponse } from "../libraries/requests";

import "../public/styles/components/news.module.scss";

export async function getServerSideProps() {
  let news = await getApiResponse('/news');

  return {
    props: {
      news
    }
  }
};

export default function ({ news }) {
  return (
    <div className="news-container">
      <h2>
        Новости
      </h2>
    </div>
  );
};