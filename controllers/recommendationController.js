const RecommendationItem = require('../entities/RecommendationItem');

// @desc    Get all recommendation items
const getAllRecommendations = async (req, res) => {
  try {
    const items = await RecommendationItem.findAll();
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a recommendation item
const createRecommendation = async (req, res) => {
  try {
    const { name, clothingType, style, color } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    const newItem = await RecommendationItem.create({
      name,
      clothingType,
      style,
      color,
      imageUrl
    });

    res.json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a recommendation item
const updateRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, clothingType, style, color } = req.body;
    let item = await RecommendationItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    let imageUrl = item.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }

    item = await item.update({
      name: name !== undefined ? name : item.name,
      clothingType: clothingType !== undefined ? clothingType : item.clothingType,
      style: style !== undefined ? style : item.style,
      color: color !== undefined ? color : item.color,
      imageUrl
    });

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a recommendation item
const deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RecommendationItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.destroy();
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAllRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation
};
