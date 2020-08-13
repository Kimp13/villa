import { getApiResponse } from "../../libraries/requests";
import { dateSmaller } from "../../libraries/dates";

import Head from "next/head";
import IntroductionDiv from "../../components/IntroductionDiv";
import BookRoom from "../../components/BookRoom";
import Admin from "../../components/AdminRoomPanel";

import "../../public/styles/pages/room/index.module.scss";

export async function getServerSideProps({ params }) {
  function mergeBookings(bookings) {
    const length = bookings.length;
    let i = 0, result = new Array();

    for (i; i < length; i += 1) {
      let itemToPush = bookings[i];

      while (i + 1 < length &&
        dateSmaller(bookings[i + 1].from, itemToPush.to, false)) {
        i += 1;
        if (dateSmaller(itemToPush.to, bookings[i].to)) {
          itemToPush.to.year = bookings[i].to.year;
          itemToPush.to.month = bookings[i].to.month;
          itemToPush.to.day = bookings[i].to.day;
        }
      }

      result.push(itemToPush);
    }

    return result;
  }

  let room = (await getApiResponse('/rooms', {name: params.name}))[0],
      serverTime = await getApiResponse('/getTime');

  if (room && !room.isUtility) {
    let bookings = new Array(),
        roomBookings = await getApiResponse('/bookings', {
          roomId: room.id,
          _sort: 'from:asc'
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
    return {
      props: {
        room: room,
        serverTime: serverTime.time,
        bookings: mergeBookings(bookings),
        title: room.name,
        footerEnabled: true
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

export default ({ room, serverTime, bookings, socket }) => {
  if (room) {
    let todate = new Date(serverTime),
        from = {
          day: todate.getDate(),
          month: todate.getMonth() + 1,
          year: todate.getFullYear()
        },
        to;

    todate.setTime(todate.getTime() + 8640000000);

    to = {
      day: todate.getDate(),
      month: todate.getMonth() + 1,
      year: todate.getFullYear()
    };
        
    return (
      <>
        <Head>
          <title>
            {room.name + ' | Villa Guest House на Фиоленте'}
          </title>
        </Head>
        <IntroductionDiv content={room} />
        { 
          socket.user.isRoot ?
          <Admin
            user={socket.user}
            bookings={bookings}
            priceInfo={room.priceInfo}
            roomId={room.id}
            from={from}
          /> :
          <BookRoom
            user={socket.user}
            bookings={bookings}
            priceInfo={room.priceInfo}
            roomId={room.id}
            from={from}
            to={to}
          />
        }
      </>
    );
  }
  return null;
};