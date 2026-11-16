const Product = require("../models/Product");
const Lead = require("../models/Lead");

const getProduct = async ({ productName, quantity = 1, businessId }) => {
  if (!productName) {
    throw new Error("Product name is required");
  }

  if (!businessId) {
    throw new Error("Business ID is required");
  }

  const products = await Product.find({ businessId });

  const normalize = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/s\b/g, "");
  };

  const normalizedSearch = normalize(productName);

  const product = products.find((p) => {
    const normalizedProduct = normalize(p.name);

    return (
      normalizedProduct === normalizedSearch ||
      normalizedProduct.includes(normalizedSearch) ||
      normalizedSearch.includes(normalizedProduct)
    );
  });

  if (!product) {
    return {
      found: false,
      stockAvailable: false,
      message: `Product "${productName}" not found`,
    };
  }

  const requestedQuantity = Number(quantity);

  if (
    !Number.isFinite(requestedQuantity) ||
    requestedQuantity < 1 ||
    !Number.isInteger(requestedQuantity)
  ) {
    throw new Error("Quantity must be a positive integer");
  }

  const stockAvailable = product.stock >= requestedQuantity;

  const totalPrice = product.price * requestedQuantity;

  return {
    found: true,

    stockAvailable,

    product: {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock,
    },

    quantity: requestedQuantity,

    totalPrice,

    message: stockAvailable
      ? `${requestedQuantity} ${product.name} available`
      : `Only ${product.stock} units of ${product.name} are available`,
  };
};


const createLead = async ({
  customerId,
  productId,
  quantity,
  intent,
  priority,
  businessId,
}) => {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  if (!businessId) {
    throw new Error("Business ID is required");
  }

  if (!productId) {
    throw new Error("Product ID is required");
  }

  const requestedQuantity = Number(quantity);

  if (
    !Number.isFinite(requestedQuantity) ||
    requestedQuantity < 1 ||
    !Number.isInteger(requestedQuantity)
  ) {
    throw new Error("Quantity must be a positive integer");
  }

  const allowedIntents = [
    "purchase",
    "enquiry",
    "support",
    "complaint",
    "other",
  ];

  const allowedPriorities = ["low", "medium", "high"];

  const normalizedIntent = intent || "purchase";
  const normalizedPriority = priority || "medium";

  if (!allowedIntents.includes(normalizedIntent)) {
    throw new Error("Invalid lead intent");
  }

  if (!allowedPriorities.includes(normalizedPriority)) {
    throw new Error("Invalid lead priority");
  }

  const product = await Product.findOne({
    _id: productId,
    businessId,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (requestedQuantity > product.stock) {
    throw new Error(
      `Insufficient stock. Available stock: ${product.stock}`
    );
  }

  const lead = await Lead.create({
    customerId,
    productId,
    quantity: requestedQuantity,
    intent: normalizedIntent,
    priority: normalizedPriority,
    status: "new",
    businessId,
  });

  return {
    success: true,

    lead: {
      id: lead._id.toString(),
      status: lead.status,
      quantity: lead.quantity,
      priority: lead.priority,
    },

    product: {
      name: product.name,
      price: product.price,
      quantity: requestedQuantity,
      totalPrice: product.price * requestedQuantity,
    },
  };
};


module.exports = {
  getProduct,
  createLead,
};