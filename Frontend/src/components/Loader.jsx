const Loader = ({ text = "Loading..." }) => (
    <div className="loader-wrapper">
        <div className="spinner" />
        <p>{text}</p>
    </div>
);

export default Loader;
