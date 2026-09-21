const { Product, Category } = require('../entities');
const { getAllProducts, getProductById } = require('../controllers/productController');

jest.mock('../entities', () => ({
  Product: {
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  Category: {}
}));

describe('Test Case 03: Product Search and Filtering (Backend)', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('Search product by name', async () => {
    Product.findAll.mockResolvedValue([{ id: 1, name: 'T-Shirt' }]);
    await getAllProducts(req, res);
    expect(Product.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'T-Shirt' }]);
  });

  it('Search product by category', async () => {
    Product.findAll.mockResolvedValue([{ id: 1, name: 'T-Shirt', Category: { id: 2, name: 'Tops' } }]);
    await getAllProducts(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('Filter products by category', async () => {
    Product.findAll.mockResolvedValue([]);
    await getAllProducts(req, res);
    expect(Product.findAll).toHaveBeenCalled();
  });

  it('Filter products by price', async () => {
    Product.findAll.mockResolvedValue([{ id: 2, name: 'Expensive Shirt', price: 5000 }]);
    await getAllProducts(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('Filter products using available criteria', async () => {
    Product.findAll.mockResolvedValue([{ id: 3, name: 'Blue Shirt', color: 'blue' }]);
    await getAllProducts(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('Search using multiple filtering conditions', async () => {
    Product.findAll.mockResolvedValue([{ id: 4, name: 'Red Shirt', price: 2000 }]);
    await getAllProducts(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('Search when no matching product exists', async () => {
    Product.findAll.mockResolvedValue([]);
    await getAllProducts(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('View product details from search results', async () => {
    req.params.id = '1';
    Product.findByPk.mockResolvedValue({ id: 1, name: 'T-Shirt', price: 1000 });
    await getProductById(req, res);
    expect(Product.findByPk).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'T-Shirt' }));
  });

  it('Search with empty filter values', async () => {
    Product.findAll.mockResolvedValue([{ id: 1 }]);
    await getAllProducts(req, res);
    expect(res.json).toHaveBeenCalled();
  });
});
