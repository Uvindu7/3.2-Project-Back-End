const { getProductRecommendations } = require('../controllers/productController');
const { Product } = require('../entities');
const RecommendationItem = require('../entities/RecommendationItem');
const { Op } = require('sequelize');

jest.mock('../entities', () => ({
  Product: { findByPk: jest.fn() }
}));
jest.mock('../entities/RecommendationItem', () => ({
  findAll: jest.fn()
}));
jest.mock('sequelize', () => ({
  Op: {
    or: Symbol('or'),
    iLike: Symbol('iLike'),
    notIn: Symbol('notIn')
  }
}));

describe('Test Case 05: Smart Outfit Recommendation System (Backend)', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('Generate recommendations for a selected T-shirt', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Casual', color: 'black' });
    RecommendationItem.findAll.mockResolvedValue([
      { id: 10, name: 'Casual Trousers', clothingType: 'Trousers' },
      { id: 11, name: 'Casual Jacket', clothingType: 'Jacket' }
    ]);

    await getProductRecommendations(req, res);
    expect(Product.findByPk).toHaveBeenCalledWith(1);
    expect(RecommendationItem.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  it('Recommend suitable trousers', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Casual', color: 'black' });
    RecommendationItem.findAll.mockResolvedValue([
      { id: 10, name: 'Casual Trousers', clothingType: 'Trousers' }
    ]);

    await getProductRecommendations(req, res);
    const responseData = res.json.mock.calls[0][0];
    const hasTrousers = responseData.some(item => item.clothingType === 'Trousers');
    expect(hasTrousers).toBe(true);
  });

  it('Recommend suitable jackets', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Casual', color: 'black' });
    RecommendationItem.findAll.mockResolvedValue([
      { id: 11, name: 'Leather Jacket', clothingType: 'Jacket' }
    ]);

    await getProductRecommendations(req, res);
    const responseData = res.json.mock.calls[0][0];
    const hasJacket = responseData.some(item => item.clothingType === 'Jacket');
    expect(hasJacket).toBe(true);
  });

  it('Recommend suitable shoes', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Casual', color: 'black' });
    RecommendationItem.findAll.mockResolvedValue([
      { id: 12, name: 'Sneakers', clothingType: 'Shoes' }
    ]);

    await getProductRecommendations(req, res);
    const responseData = res.json.mock.calls[0][0];
    const hasShoes = responseData.some(item => item.clothingType === 'Shoes');
    expect(hasShoes).toBe(true);
  });

  it('Recommend suitable accessories', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Casual', color: 'black' });
    RecommendationItem.findAll.mockResolvedValue([
      { id: 13, name: 'Watch', clothingType: 'Accessory' }
    ]);

    await getProductRecommendations(req, res);
    const responseData = res.json.mock.calls[0][0];
    const hasAccessory = responseData.some(item => item.clothingType === 'Accessory');
    expect(hasAccessory).toBe(true);
  });

  it('Consider product category in recommendations', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Formal', color: 'black' });
    RecommendationItem.findAll.mockResolvedValue([
      { id: 14, name: 'Formal Pants', clothingType: 'Trousers', style: 'Formal' }
    ]);

    await getProductRecommendations(req, res);
    expect(RecommendationItem.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ style: 'Formal' })
    }));
  });

  it('Consider product style in recommendations', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Vintage', color: 'white' });
    RecommendationItem.findAll.mockResolvedValue([
      { id: 12, style: 'Vintage', color: 'black' }
    ]);

    await getProductRecommendations(req, res);
    expect(RecommendationItem.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ style: 'Vintage' })
    }));
  });

  it('Consider product colour in recommendations', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Casual', color: 'black' });
    RecommendationItem.findAll.mockResolvedValue([]);

    await getProductRecommendations(req, res);
    // Verifies that the colour rules map was utilized in the query
    const callArgs = RecommendationItem.findAll.mock.calls[0][0];
    expect(callArgs.where.color).toBeDefined();
  });

  it('Display recommended products', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Casual', color: 'black' });
    RecommendationItem.findAll.mockResolvedValue([
      { id: 10, name: 'Trousers' }
    ]);

    await getProductRecommendations(req, res);
    // Test that the payload is an array ready for the frontend to map and display
    expect(Array.isArray(res.json.mock.calls[0][0])).toBe(true);
    expect(res.json.mock.calls[0][0].length).toBeGreaterThan(0);
  });

  it('Open product details from recommendation results', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, style: 'Casual', color: 'black' });
    RecommendationItem.findAll.mockResolvedValue([
      { id: 15, name: 'Jacket' }
    ]);

    await getProductRecommendations(req, res);
    // Verifies the recommended item includes an ID, which the frontend uses to open details
    const recommendedItem = res.json.mock.calls[0][0][0];
    expect(recommendedItem).toHaveProperty('id');
    expect(recommendedItem.id).toBe(15);
  });
});
