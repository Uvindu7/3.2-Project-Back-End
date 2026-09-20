const { Product, Category } = require('../entities');

// @desc    Create a product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPercent, wholesaleDiscountPercent, stockS, stockM, stockL, categoryId, imageUrl, clothingType, style, color } = req.body;

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
      discountPercent: discountPercent || 0,
      wholesaleDiscountPercent: wholesaleDiscountPercent || 0,
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
    const { name, description, price, discountPercent, wholesaleDiscountPercent, stockS, stockM, stockL, categoryId, imageUrl, clothingType, style, color } = req.body;

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
      price: price !== undefined ? (price === '' ? 0 : price) : product.price,
      discountPercent: discountPercent !== undefined ? (discountPercent === '' ? 0 : discountPercent) : product.discountPercent,
      wholesaleDiscountPercent: wholesaleDiscountPercent !== undefined ? (wholesaleDiscountPercent === '' ? 0 : wholesaleDiscountPercent) : product.wholesaleDiscountPercent,
      stockS: stockS !== undefined ? (stockS === '' ? 0 : stockS) : product.stockS,
      stockM: stockM !== undefined ? (stockM === '' ? 0 : stockM) : product.stockM,
      stockL: stockL !== undefined ? (stockL === '' ? 0 : stockL) : product.stockL,
      categoryId: categoryId !== undefined ? (categoryId === '' ? null : categoryId) : product.categoryId,
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

    // Recommendation logic: Since the store only sells T-shirts, fetch from RecommendationItem
    // to provide styling inspiration (trousers, shoes, etc.) based on the same style and smart color matching.
    const RecommendationItem = require('../entities/RecommendationItem');
    const { Op } = require('sequelize');

    // Smart color matching mapping
    const colorRules = {
      'black': ['white', 'grey', 'black', 'red', 'beige'],
      'white': ['black', 'navy', 'grey', 'blue', 'beige'],
      'grey': ['black', 'white', 'navy', 'maroon'],
      'navy': ['white', 'grey', 'khaki', 'beige'],
      'red': ['black', 'navy', 'white', 'grey'],
      'blue': ['white', 'khaki', 'grey', 'navy'],
      'green': ['white', 'black', 'beige', 'navy'],
      'beige': ['navy', 'black', 'white', 'green'],
      'yellow': ['black', 'navy', 'white', 'grey'],
      'brown': ['white', 'beige', 'navy', 'black']
    };

    const productColor = (currentProduct.color || '').toLowerCase().trim();
    // Get compatible colors from the mapping, or default to just matching the same color if not found
    const compatibleColors = colorRules[productColor] || [productColor];

    // First, try to find items that match BOTH style and a compatible color
    let recommendations = await RecommendationItem.findAll({
      where: {
        style: currentProduct.style,
        color: {
          // PostgreSQL is case-sensitive by default, so we use iLike or just match against common capitalizations.
          // For safety, we use Op.iRegexp to do case-insensitive matching if using Postgres, 
          // but Op.iLike with ANY is better, or just doing a basic array match if colors are stored cleanly.
          // Since colors might be stored as "Black", "White", we'll just check against the lowercase version in JS 
          // But Sequelize Op.in does strict matching. We can use Op.iLike combined with Op.or.
          [Op.or]: compatibleColors.map(c => ({ [Op.iLike]: `%${c}%` }))
        }
      },
      limit: 4
    });

    // If we don't have 4 smart color matches, fill the remaining slots with items of the same style
    if (recommendations.length < 4) {
      const existingIds = recommendations.map(r => r.id);
      const whereClause = {
        style: currentProduct.style
      };

      if (existingIds.length > 0) {
        whereClause.id = { [Op.notIn]: existingIds };
      }

      const moreRecommendations = await RecommendationItem.findAll({
        where: whereClause,
        limit: 4 - recommendations.length
      });

      recommendations = [...recommendations, ...moreRecommendations];
    }

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
