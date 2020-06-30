module.exports = {
  async find() {
    let date = new Date();
    return {
      time: date.getTime()
    };
  },
};