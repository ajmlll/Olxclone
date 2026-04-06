import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
    const { _id, title, price, images, location, condition, createdAt } = product;

    const formattedPrice = new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(price);

    const daysAgo = Math.floor((Date.now() - new Date(createdAt)) / 86400000);
    const timeLabel =
        daysAgo === 0 ? "Today" :
            daysAgo === 1 ? "Yesterday" :
                `${daysAgo}d ago`;

    return (
        <Link to={`/product/${_id}`} className="product-card">
            <div className="card-image-wrapper">
                <img
                    src={images?.[0] || "/placeholder.jpg"}
                    alt={title}
                    loading="lazy"
                />
                <span className="condition-tag">{condition}</span>
            </div>
            <div className="card-body">
                <p className="card-price">{formattedPrice}</p>
                <h3 className="card-title">{title}</h3>
                <div className="card-footer">
                    <span>📍 {location}</span>
                    <span>{timeLabel}</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
