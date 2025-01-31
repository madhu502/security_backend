const path = require("path");
const categoryModel = require("../model/categoryModel");

const createCategory = async (req, res) => {
  // check the incomming data

  //Destructuring the body data(json)
  const { categoryName, categoryDescription } = req.body;

  //Validation
  if (!categoryName || !categoryDescription) {
    return res.status(400).json({
      sucess: false,
      message: "Enter all fields",
    });
  }

  //validate if there is image
  if (!req.files || !req.files.categoryImage) {
    return res.status(400).json({
      sucess: false,
      message: "Image not found!",
    });
  }
  const { categoryImage } = req.files;

  //upload image
  //1. Generate new image name (abc.png)->(21343-abc.png)
  const imageName = ` ${Date.now()}-${categoryImage.name}`;

  //2. Make a upload path (/path/upload - diractory)
  const imageUploadPath = path.join(
    __dirname,
    `../public/category/${imageName}`
  );

  try {
    await categoryImage.mv(imageUploadPath);

    // save to the data base
    const newCategory = new categoryModel({
      categoryName: categoryName,
      categoryDescription: categoryDescription,
      categoryImage: imageName,
    });
    const category = await newCategory.save();
    res.status(201).json({
      success: true,
      message: "Category Created Successfully",
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await categoryModel.findByIdAndDelete(req.params.id);
    res.status(201).json({
      success: true,
      message: "Category delete Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error,
    });
  }
};

const getAllCaterogy = async (req, res) => {
  // try catch
  try {
    const allCaterogy = await categoryModel.find({});
    res.status(201).json({
      success: true,
      message: "Caterogy fetched Successfully",
      caterogy: allCaterogy,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error,
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCategory,
  deleteCategory,
  getAllCaterogy,
  getCategoryById,
};
