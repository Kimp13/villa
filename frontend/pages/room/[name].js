import { getAPIResponse } from "../../libraries/requests";

import SimpleDate from "../../classes/SimpleDate";
import Head from "next/head";
import IntroductionDiv from "../../components/IntroductionDiv";
import RoomPrices from "../../components/RoomPrices";
import BookRoom from "../../components/BookRoom";

import "../../public/styles/room.scss";

export async function getServerSideProps({ params }) {
  let jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWY3MTlkNjExOTA1ZjE1NGM2ODdlYWEiLCJpYXQiOjE1OTMzNzc3OTksImV4cCI6MTU5NTk2OTc5OX0.Xy5Y1LMZ2FBfunMlH9vWBICLH-9mJNXk8FV3S5DSM6M';
  let room = (await getAPIResponse('/rooms', [{key: 'name', value: params.name}]))[0],
      serverTime = await getAPIResponse('/getTime', [], jwt);

  if (room && !room.isUtility) {
    let bookings = [];
    for (let i = 0; i < room.bookings.length; i += 1) {
      let from = new SimpleDate(new Date(room.bookings[i].from.substring(0, 10))),
          to = new SimpleDate(new Date(room.bookings[i].to.substring(0, 10)))
      bookings.push({
        from: {
          day: from.day,
          month: from.month,
          year: from.year
        },
        to: {
          day: to.day,
          month: to.month,
          year: to.year
        }
      });
    }
    bookings.sort((a, b) => {
      [a, b] = [a.from, b.from];
      if (a.year !== b.year) return a.year - b.year;
      else if (a.month !== b.month) return a.month - b.month;
      else return a.day - b.day;
    });
    return {
      props: {
        room: room,
        serverTime: serverTime.time,
        bookings: bookings,
        convertNumberToMonth: [
          'Январь',
          'Февраль',
          'Март',
          'Апрель',
          'Май',
          'Июнь',
          'Июль',
          'Август',
          'Сентябрь',
          'Октябрь',
          'Ноябрь',
          'Декабрь'
        ]
      }
    }
  }
  return {
    props: {
      room: null,
      serverTime: serverTime.time,
      bookings: null
    }
  }
}

export default ({ room, serverTime, bookings, convertNumberToMonth }) => (
  <>
    <Head>
      <title>
        {room.name + ' | Villa Guest House на Фиоленте'}
      </title>
    </Head>
    <IntroductionDiv content={room} />
    <div className="content-flex-wrapper">
      <RoomPrices prices={room.priceInfo} convertNumberToMonth={convertNumberToMonth}/>
      <BookRoom convertNumberToMonth={convertNumberToMonth} bookings={bookings} bookings={bookings} from={new SimpleDate(new Date(serverTime))} to={new SimpleDate(new Date('2020-12-31'))} />
    </div>
  </>
)