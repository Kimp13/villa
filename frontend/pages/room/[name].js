import { getApiResponse } from "../../libraries/requests";

import SimpleDate from "../../classes/SimpleDate";
import Head from "next/head";
import IntroductionDiv from "../../components/IntroductionDiv";
import BookRoom from "../../components/BookRoom";

import "../../public/styles/pages/room/index.module.scss";

export async function getServerSideProps({ params }) {
  let room = (await getApiResponse('/rooms', {name: params.name}))[0],
      serverTime = await getApiResponse('/getTime');

  if (room && !room.isUtility) {
    let bookings = new Array(),
        roomBookings = await getApiResponse('/bookings', {
          roomId: room.id
        });

    for (let i = 0; i < roomBookings.length; i += 1) {
      bookings.push({
        from: {
          day: parseInt(roomBookings[i].from.substring(8)),
          month: parseInt(roomBookings[i].from.substring(5, 7)),
          year: parseInt(roomBookings[i].from.substring(0, 4))
        },
        to: {
          day: parseInt(roomBookings[i].to.substring(8)),
          month: parseInt(roomBookings[i].to.substring(5, 7)),
          year: parseInt(roomBookings[i].to.substring(0, 4))
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
        ],
        title: room.name
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

export default ({ room, serverTime, bookings, convertNumberToMonth, socket }) => {
  let todate = new Date(),
      from = {
        day: todate.getDate(),
        month: todate.getMonth() + 1,
        year: todate.getFullYear()
      },
      to = {
        day: 31,
        month: 12,
        year: 2020
      };
      
  return (
  <>
    <Head>
      <title>
        {room.name + ' | Villa Guest House на Фиоленте'}
      </title>
    </Head>
    <IntroductionDiv content={room} />
    <BookRoom
      user={socket.user}
      convertNumberToMonth={convertNumberToMonth}
      bookings={bookings}
      priceInfo={room.priceInfo}
      from={from}
      to={to}
    />
  </>
)};