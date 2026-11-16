const Customer = require("../models/Customer");

// =========================
// CREATE CUSTOMER
// =========================

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    /*
      For now businessId comes from JWT.
      Later when Business creation is implemented,
      req.user.businessId will be available.
    */

    const businessId = req.user.businessId;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a business",
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      notes,
      businessId,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET ALL CUSTOMERS
// =========================

const getCustomers = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a business",
      });
    }

    const customers = await Customer.find({
      businessId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET CUSTOMER BY ID
// =========================

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    const customer = await Customer.findOne({
      _id: id,
      businessId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// UPDATE CUSTOMER
// =========================

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, notes } = req.body;

    const businessId = req.user.businessId;

    const customer = await Customer.findOneAndUpdate(
      {
        _id: id,
        businessId,
      },
      {
        name,
        email,
        phone,
        notes,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// DELETE CUSTOMER
// =========================

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    const customer = await Customer.findOneAndDelete({
      _id: id,
      businessId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};