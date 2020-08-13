export function getDaysAmountInMonthOfYear(month, year) {
  if (month < 8) {
    if (month === 2) {
      if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        return 29;
      }
      
      return 28;
    }

    return 30 + month % 2;
  }

  return 30 + (month - 1) % 2;
}

export function dateSmaller(first, second, strict = true) {
  if (first.year < second.year) {
    return true;
  } else if (first.year === second.year) {
    if (first.month < second.month) {
      return true;
    } else if (first.month === second.month) {
      if (strict) {
        return (first.day < second.day);
      }

      return (first.day <= second.day);
    }
  }

  return false;
}

export function dateBigger(first, second, strict = true) {
  if (first.year > second.year) {
    return true;
  } else if (first.year === second.year) {
    if (first.month > second.month) {
      return true;
    } else if (first.month === second.month) {
      if (strict) {
        return (first.day > second.day);
      }

      return (first.day >= second.day);
    }
  }

  return false;
}

export function incrementDate(date, monthDaysCount) {
  if (!monthDaysCount) {
    monthDaysCount = getDaysAmountInMonthOfYear(date.month, date.year);
  }

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

export function decrementDate(date) {
  if (date.day === 1) {
    if (date.month === 1) {
      return {
        year: date.year - 1,
        month: 12,
        day: getDaysAmountInMonthOfYear(12, date.year - 1)
      }
    }
    
    return {
      year: date.year,
      month: date.month - 1,
      day: getDaysAmountInMonthOfYear(date.month - 1, date.year)
    }
  }

  return {
    year: date.year,
    month: date.month,
    day: date.day - 1
  }
}