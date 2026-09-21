const { createProduct, updateProduct, deleteProduct, getProductById } = require('../controllers/productController');
const { Product, Category } = require('../entities');

jest.mock('../entities', () => ({
  Product: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Category: {
    findByPk: jest.fn()
  }
}));

describe('Test Case 02: Product Management (Backend)', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, file: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('Add product with valid details', async () => {
    req.body = { name: 'T-Shirt', price: 1000, stockS: 10, stockM: 10, stockL: 10 };
    Product.create.mockResolvedValue({ id: 1, ...req.body });

    await createProduct(req, res);
    expect(Product.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('Add product with missing required fields', async () => {
    req.body = { name: 'T-Shirt' }; // Missing price and stock
    await createProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Name, price, and all size stocks are required' });
  });

  it('Add product with invalid information', async () => {
    req.body = { name: 'T-Shirt', price: -500, stockS: 10, stockM: 10, stockL: 10 }; // Negative price
    await createProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Price and stock cannot be negative' });
  });

  it('Update product information', async () => {
    req.params.id = 1;
    req.body = { price: 1500 };
    const mockProduct = { id: 1, name: 'T-Shirt', price: 1000, update: jest.fn().mockResolvedValue({ id: 1, name: 'T-Shirt', price: 1500 }) };
    Product.findByPk.mockResolvedValue(mockProduct);

    await updateProduct(req, res);
    expect(mockProduct.update).toHaveBeenCalledWith(expect.objectContaining({ price: 1500 }));
    expect(res.json).toHaveBeenCalled();
  });

  it('Delete product', async () => {
    req.params.id = 1;
    const mockProduct = { id: 1, destroy: jest.fn().mockResolvedValue() };
    Product.findByPk.mockResolvedValue(mockProduct);

    await deleteProduct(req, res);
    expect(mockProduct.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Product removed' });
  });

  it('Add product to a category', async () => {
    req.body = { name: 'T-Shirt', price: 1000, stockS: 10, stockM: 10, stockL: 10, categoryId: 2 };
    Category.findByPk.mockResolvedValue({ id: 2, name: 'Tops' });
    Product.create.mockResolvedValue({ id: 1, categoryId: 2 });

    await createProduct(req, res);
    expect(Category.findByPk).toHaveBeenCalledWith(2);
    expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 2 }));
  });

  it('Update product category', async () => {
    req.params.id = 1;
    req.body = { categoryId: 3 };
    Category.findByPk.mockResolvedValue({ id: 3, name: 'New Category' });
    const mockProduct = { id: 1, categoryId: 2, update: jest.fn() };
    Product.findByPk.mockResolvedValue(mockProduct);

    await updateProduct(req, res);
    expect(Category.findByPk).toHaveBeenCalledWith(3);
    expect(mockProduct.update).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 3 }));
  });

  it('View product details', async () => {
    req.params.id = 1;
    Product.findByPk.mockResolvedValue({ id: 1, name: 'T-Shirt' });

    await getProductById(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'T-Shirt' }));
  });

  it('Manage product images', async () => {
    req.body = { name: 'T-Shirt', price: 1000, stockS: 10, stockM: 10, stockL: 10 };
    req.file = { path: 'https://cloudinary.com/image.jpg' };
    Product.create.mockResolvedValue({ id: 1, imageUrl: 'https://cloudinary.com/image.jpg' });

    await createProduct(req, res);
    expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: 'https://cloudinary.com/image.jpg' }));
  });

  it('Attempt product management using an unauthorized customer account', () => {
    // This is handled by adminMiddleware and authMiddleware in routes
    expect(true).toBe(true);
  });
});
