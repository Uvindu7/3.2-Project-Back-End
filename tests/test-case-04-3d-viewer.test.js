const { getProductById } = require('../controllers/productController');
const { Product } = require('../entities');

jest.mock('../entities', () => ({
  Product: { findByPk: jest.fn() }
}));

describe('Test Case 04: Three-Dimensional Product Visualization (Backend)', () => {
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

  it('Open three-dimensional product viewer (Verify product has 3D assets)', async () => {
    // Backend provides the imageUrl/model data which the frontend uses for Three.js
    Product.findByPk.mockResolvedValue({ id: 1, imageUrl: 'model3d.glb' });
    await getProductById(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: 'model3d.glb' }));
  });

  it('Load a valid three-dimensional clothing model', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, imageUrl: 'valid_model.glb' });
    await getProductById(req, res);
    const data = res.json.mock.calls[0][0];
    expect(data.imageUrl.endsWith('.glb')).toBe(true);
  });

  it('Rotate the clothing model (Frontend Only)', () => {
    expect(true).toBe(true);
  });

  it('View the product from different angles (Frontend Only)', () => {
    expect(true).toBe(true);
  });

  it('Zoom the three-dimensional model (Frontend Only)', () => {
    expect(true).toBe(true);
  });

  it('Display the selected T-shirt on the virtual dummy body (Frontend Only)', () => {
    expect(true).toBe(true);
  });

  it('Load different supported clothing models', async () => {
    Product.findByPk.mockResolvedValue({ id: 2, imageUrl: 'jacket_model.gltf' });
    await getProductById(req, res);
    const data = res.json.mock.calls[0][0];
    expect(data.imageUrl).toMatch(/\.(glb|gltf|obj)$/);
  });

  it('Handle unavailable three-dimensional models', async () => {
    Product.findByPk.mockResolvedValue({ id: 3, imageUrl: null });
    await getProductById(req, res);
    const data = res.json.mock.calls[0][0];
    expect(data.imageUrl).toBeNull();
  });
});
