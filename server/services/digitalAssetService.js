/**
 * Digital Asset Management Service
 * Mock implementation for Organization-Wide Digital Asset Management (DAM)
 */

const assets = [
  {
    id: 1,
    name: "Tech Fest Banner",
    type: "image",
    category: "Events",
    folder: "Event Banners",
    url: "/uploads/banner.png",
    size: "2.3 MB",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Certificate Template",
    type: "pdf",
    category: "Certificates",
    folder: "Templates",
    url: "/uploads/certificate.pdf",
    size: "850 KB",
    createdAt: new Date().toISOString(),
  },
];

const folders = [
  {
    id: 1,
    name: "Event Banners",
  },
  {
    id: 2,
    name: "Certificates",
  },
];

const versionHistory = [
  {
    version: "v1",
    updatedAt: new Date().toISOString(),
  },
];

const storageAnalytics = {
  totalAssets: assets.length,
  totalStorage: "3.15 GB",
  images: 120,
  pdfs: 45,
  videos: 18,
  documents: 32,
};

// Get All Assets
const getAllAssets = async () => assets;

// Get Asset By ID
const getAssetById = async (id) =>
  assets.find((asset) => asset.id === Number(id));

// Upload Asset
const uploadAsset = async (data) => {
  const asset = {
    id: assets.length + 1,
    createdAt: new Date().toISOString(),
    ...data,
  };

  assets.push(asset);
  return asset;
};

// Update Asset
const updateAsset = async (id, data) => {
  const index = assets.findIndex(
    (asset) => asset.id === Number(id)
  );

  if (index === -1) return null;

  assets[index] = {
    ...assets[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return assets[index];
};

// Delete Asset
const deleteAsset = async (id) => {
  const index = assets.findIndex(
    (asset) => asset.id === Number(id)
  );

  if (index === -1) return null;

  return assets.splice(index, 1)[0];
};

// Search Assets
const searchAssets = async (query) => {
  if (!query) return assets;

  return assets.filter((asset) =>
    asset.name.toLowerCase().includes(query.toLowerCase())
  );
};

// Assets By Category
const getAssetsByCategory = async (category) =>
  assets.filter(
    (asset) =>
      asset.category.toLowerCase() === category.toLowerCase()
  );

// Folder Management
const getFolders = async () => folders;

const createFolder = async (data) => {
  const folder = {
    id: folders.length + 1,
    ...data,
  };

  folders.push(folder);
  return folder;
};

// Duplicate Detection
const detectDuplicates = async () => [
  {
    assetId: 1,
    duplicateOf: 2,
  },
];

// AI Tags
const generateAITags = async () => [
  "event",
  "banner",
  "technology",
  "campus",
];

// Version History
const getVersionHistory = async () => versionHistory;

// Preview Asset
const previewAsset = async (id) => ({
  assetId: id,
  previewUrl: `/preview/${id}`,
});

// Bulk Upload
const bulkUpload = async (files) => ({
  uploaded: files?.length || 0,
  status: "Completed",
});

// Bulk Download
const bulkDownload = async (ids) => ({
  downloaded: ids?.length || 0,
  downloadUrl: "/downloads/assets.zip",
});

// Share Asset
const shareAsset = async (data) => ({
  assetId: data.assetId,
  sharedWith: data.user,
  permission: data.permission,
  status: "Shared",
});

// Storage Analytics
const getStorageAnalytics = async () => storageAnalytics;

// Expiring Assets
const getExpiringAssets = async () => [
  {
    id: 3,
    name: "Old Event Poster",
    expiresOn: "2026-08-01",
  },
];

module.exports = {
  getAllAssets,
  getAssetById,
  uploadAsset,
  updateAsset,
  deleteAsset,
  searchAssets,
  getAssetsByCategory,
  getFolders,
  createFolder,
  detectDuplicates,
  generateAITags,
  getVersionHistory,
  previewAsset,
  bulkUpload,
  bulkDownload,
  shareAsset,
  getStorageAnalytics,
  getExpiringAssets,
};