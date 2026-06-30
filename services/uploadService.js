const cloudinary = require('../configs/cloudinary');

/**
 * Upload an image to Cloudinary
 * @param {string} file - Path to file or base64 string or URL
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadImage = async (file, folder = 'user_uploads') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>} - Cloudinary delete result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Image deletion failed');
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
