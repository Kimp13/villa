module.exports = async text => {
  let validatePart = part => {
    let day, month, year, firstDot, secondDot;

    firstDot = part.indexOf('.');

    if (firstDot !== -1) {
      day = Number(part.substring(0, firstDot++));

      secondDot = part.indexOf('.', firstDot);
      if (secondDot !== -1) {
        month = Number(part.substring(firstDot, secondDot++)) - 1;
        year = Number(part.substring(secondDot));

        let date = new Date(year, month, day);

        if (
          !isNaN(date.getTime()) &&
          day === date.getDate() &&
          month === date.getMonth() &&
          year === date.getFullYear()
        ) {
          return date;
        }
      }
    }

    return false;
  };

  let dateSmaller = (first, second) => {
    if (first.getYear() < second.getYear()) {
      return true;
    } else if (first.getYear() === second.getYear()) {
      if (first.getMonth() < second.getMonth()) {
        return true;
      } else if (first.getMonth() === second.getMonth()) {
        return (first.getDate() < second.getDate());
      }
    }

    return false;
  };

  let dateBigger = (first, second, strict = true) => {
    if (first.getYear() > second.getYear()) {
      return true;
    } else if (first.getYear() === second.getYear()) {
      if (first.getMonth() > second.getMonth()) {
        return true;
      } else if (first.getMonth() === second.getMonth()) {
        if (strict) {
          return (first.getDate() > second.getDate());
        } else {
          return (first.getDate() >= second.getDate());
        }
      }
    }

    return false;
  };

  let oneLodash;

  oneLodash = text.indexOf('_');

  if (oneLodash !== -1) {
    let room = await strapi.query('room').findOne({
      id: text.substring(0, oneLodash)
    });

    if (room && room.isUtility === false) {
      let twoLodash = text.indexOf('_', ++oneLodash);

      if (twoLodash !== -1) {
        let firstDate = validatePart(text.substring(oneLodash, twoLodash));

        if (firstDate) {
          let secondDate;

          oneLodash = twoLodash;
          twoLodash = text.indexOf('_', ++oneLodash);

          if (twoLodash === -1) {
            secondDate = validatePart(text.substring(oneLodash)); 
          } else {
            secondDate = validatePart(text.substring(oneLodash, twoLodash));
            text = text.substring(twoLodash + 1);

            if (text !== 'accepted' && text !== 'rejected') {
              return false;
            }
          }

          return (
            secondDate &&
            dateSmaller(firstDate, secondDate) &&
            dateBigger(firstDate, new Date(), false)
          );
        }
      }
    }
  }

  return false;
};