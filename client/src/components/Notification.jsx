function Notification({ notification }) {

  if (!notification) return null;

  return (

    <div className="notification">

      <strong>
        Order Confirmed
      </strong>

      <p>
        {notification.food} ordered successfully
      </p>

    </div>

  );
}

export default Notification;