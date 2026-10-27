import cloudinary from "./cloudinary.js";

export const uploadToCloudinary = (fileBuffer, folder = "portfolio") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  return await cloudinary.uploader.destroy(publicId);
};
