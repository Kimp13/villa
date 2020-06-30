export default class SimpleDate {
  constructor(sourceDate) {
    this.day = sourceDate.getDate();
    this.month = sourceDate.getMonth();
    this.year = sourceDate.getFullYear();
  }
}