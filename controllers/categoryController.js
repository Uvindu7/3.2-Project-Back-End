const { Category } = require('../entities');

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).send('Server Error');
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    
    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    await category.destroy();
    res.json({ message: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};
