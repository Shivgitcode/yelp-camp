const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const joi = require("joi");
const { isLoggedIn, isAuthor } = require("../middleware");
const {
  renderNewForm,
  createCampground,
  index,
  showCampground,
  renderEditForm,
  updateCampground,
  deleteCampground,
} = require("../controllers/campgrounds");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const validateCampground = (req, res, next) => {
  const campgroundSchema = joi.object({
    campground: joi
      .object({
        title: joi.string().required(),
        price: joi.number().required().min(0),
        // image: joi.string().required(),
        location: joi.string().required(),
        description: joi.string().required(),
      })
      .required(),
    deleteImages: joi.array(),
  });

  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get("/", catchAsync(index));

router.get("/new", isLoggedIn, renderNewForm);

router.post(
  "/",
  isLoggedIn,
  upload.array("image"),
  validateCampground,
  catchAsync(createCampground)
);

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(renderEditForm));

router.get("/:id", isLoggedIn, catchAsync(showCampground));

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  upload.array("image"),
  validateCampground,
  catchAsync(updateCampground)
);

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(deleteCampground));

module.exports = router;
