const { Product, Category } = require('../entities');

// @desc    Create a product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stockS, stockM, stockL, categoryId, imageUrl, clothingType, style, color } = req.body;

    if (!name || price === undefined || stockS === undefined || stockM === undefined || stockL === undefined) {
      return res.status(400).json({ message: 'Name, price, and all size stocks are required' });
    }

    if (price < 0 || stockS < 0 || stockM < 0 || stockL < 0) {
      return res.status(400).json({ message: 'Price and stock cannot be negative' });
    }

    if (categoryId) {
      const categoryExists = await Category.findByPk(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid categoryId' });
      }
    }

    let finalImageUrl = req.body.imageUrl;

    // If a file was uploaded, set the imageUrl to the Cloudinary URL
    if (req.file) {
      finalImageUrl = req.file.path;
    }

    const product = await Product.create({
      name,
      description,
      price,
      stockS,
      stockM,
      stockL,
      categoryId: categoryId || null,
      imageUrl: finalImageUrl,
      clothingType: clothingType || 'Other',
      style: style || 'Casual',
      color: color || ''
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stockS, stockM, stockL, categoryId, imageUrl, clothingType, style, color } = req.body;

    let product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (price !== undefined && price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }
    if ((stockS !== undefined && stockS < 0) || (stockM !== undefined && stockM < 0) || (stockL !== undefined && stockL < 0)) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    if (categoryId) {
      const categoryExists = await Category.findByPk(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid categoryId' });
      }
    }

    let finalImageUrl = req.body.imageUrl;

    if (req.file) {
      finalImageUrl = req.file.path;
    }

    product = await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      stockS: stockS !== undefined ? stockS : product.stockS,
      stockM: stockM !== undefined ? stockM : product.stockM,
      stockL: stockL !== undefined ? stockL : product.stockL,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      imageUrl: finalImageUrl !== undefined ? finalImageUrl : product.imageUrl,
      clothingType: clothingType !== undefined ? clothingType : product.clothingType,
      style: style !== undefined ? style : product.style,
      color: color !== undefined ? color : product.color
    });

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get product recommendations (Smart Outfit)
const getProductRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const currentProduct = await Product.findByPk(id);

    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Recommendation logic: find products of different clothingType but same style
    const { Op } = require('sequelize');
    const recommendations = await Product.findAll({
      where: {
        id: { [Op.ne]: currentProduct.id },
        style: currentProduct.style,
        clothingType: { [Op.ne]: currentProduct.clothingType }
      },
      include: [{ model: Category, attributes: ['id', 'name'] }],
      limit: 4
    });

    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductRecommendations
};
