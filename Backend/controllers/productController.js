const Product = require("../models/Product");

// @route  GET /api/products
// @access Public
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort = "-createdAt", page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("seller", "name phone avatar")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/products/:id
// @access Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name phone email avatar");
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.views += 1;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/products
// @access Private (sellers only)
const createProduct = async (req, res) => {
  try {
    if (!req.user.phone || req.user.phone.trim() === "") {
      return res.status(400).json({
        message: "Please add a phone number to your profile before posting an ad.",
        redirectTo: "/profile",
      });
    }

    const { title, description, price, category, location, condition } = req.body;
    const images = req.files?.map((f) => f.path) || [];

    const product = await Product.create({
      title, description, price, category, location, condition, images,
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/products/:id
// @access Private (owner or admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString() && !req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/products/:id
// @access Private (owner or admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString() && !req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/products/my
// @access Private
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort("-createdAt");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/products/admin/all
// @access Private/Admin
const adminGetAllProducts = async (req, res) => {
  try {
    const { search, category, status, sort = "-createdAt", page = 1, limit = 15 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    };
    if (category) query.category = category;
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("seller", "name email phone")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const activeCount = await Product.countDocuments({ isActive: true });
    const inactiveCount = await Product.countDocuments({ isActive: false });

    res.json({ products, total, activeCount, inactiveCount, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/products/admin/:id/toggle
// @access Private/Admin
const adminToggleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
      isActive: product.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/products/admin/:id
// @access Private/Admin
const adminDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts,
  adminGetAllProducts, adminToggleProduct, adminDeleteProduct,
};
