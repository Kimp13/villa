export function getDaysAmountInMonthOfYear(month, year) {
  let isYearLeap = false;

  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    isYearLeap = true;
  }

  if (month < 8) {
    if (month === 2) {
      return isYearLeap ? 29 : 28;
    }

    return 30 + month % 2;
  }

  return 30 + (month - 1) % 2;
}

export function dateSmallerNonStrict(first, second) {
  if (first.year < second.year) {
    return true;
  }

  if (first.year === second.year) {
    if (first.month < second.month) {
      return true;
    }

    return (first.month === second.month && first.day <= second.day);
  }

  return false;
}

export function incrementDate(date, monthDaysCount) {
  if (date.day === monthDaysCount) {
    if (date.month === 12) {
      return {
        year: date.year + 1,
        month: 1,
        day: 1
      }
    }
    
    return {
      year: date.year,
      month: date.month + 1,
      day: 1
    }
  }

  return {
    year: date.year,
    month: date.month,
    day: date.day + 1
  }
}