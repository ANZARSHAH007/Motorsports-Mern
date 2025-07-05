const { get } = require("mongoose");
const User = require("../models/User");

const getUserProfile = async (req, res) => {
  try {
    const users = await User.find();
    res
      .status(201)
      .json({ message: "Users fetched successfully!", users: users });
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    res.status(500).json({ message: "Error fetching user profiles", error });
  }
};

const getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: err });
  }
};

const UpdateUserProfile = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        role: req.body.role, 
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Error updating user profile", error });
  }
};


const deleteUserAccount = async (req, res) => {
  const { id } = req.params;
  console.log("id : ", id);

  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Error deleting user account", error });
  }
};

module.exports = {
  getUserProfile,
  deleteUserAccount,
  getUserProfileById,
  UpdateUserProfile,
};
