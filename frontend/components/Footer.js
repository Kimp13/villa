export default function () {
  let linkRegExp = /(https?:\/\/)?\w+\.[a-z]{2,}(\/(\w|%[\dA-F]{2})*)*/g;
  return (
    <footer>
      <div className="footer-ads">
        <p>
          <i className="fab fa-whatsapp" />
          <a target="_blank" href="https://api.whatsapp.com/send?phone=79534081000">
            +79534081000
          </a>
        </p>
        <p>
          <i className="fab fa-viber" />
          <a target="_blank" href="viber://chat/?number=%2B79534081000">
            +79534081000
          </a>
        </p>
        <p>
          <i className="fas fa-phone" />
          <a target="_blank" href="tel:79785766940">
            +79785766940
          </a>
        </p>
        <p>
          <span className="icon">B</span>
          <a target="_blank" href="https://www.booking.com/hotel/xc/villa-guest-house">
            Booking
          </a>
        </p>
      </div>
      <div className="footer-waves">
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
      </div>
    </footer>
  );
};