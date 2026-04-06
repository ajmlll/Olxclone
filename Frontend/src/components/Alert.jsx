const Alert = ({ message, type = "error" }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      {type === "error" ? "❌" : "✅"} {message}
    </div>
  );
};

export default Alert;
