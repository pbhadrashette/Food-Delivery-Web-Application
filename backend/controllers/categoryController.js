const Category = require('../models/Category');

const categoryFields = ['name', 'description', 'icon', 'sortOrder', 'isActive', 'state', 'meal'];
const pickCategoryFields = (body) => Object.fromEntries(
  categoryFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
);

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) { next(error); }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const data = pickCategoryFields(req.body);
    if (req.file) data.image = `/uploads/categories/${req.file.filename}`;
    const category = await Category.create(data);
    res.status(201).json({ success: true, message: 'Category created.', category });
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const data = pickCategoryFields(req.body);
    if (req.file) data.image = `/uploads/categories/${req.file.filename}`;
    if (data.isActive === 'true') data.isActive = true;
    else if (data.isActive === 'false') data.isActive = false;
    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, message: 'Category updated.', category });
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) { next(error); }
};
