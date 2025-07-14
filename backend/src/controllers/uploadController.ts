import { Request, Response } from 'express';
import s3Service from '../services/s3Service';
import { S3_CONFIG } from '../config/s3';
import { AuthRequest } from '../types';

interface S3File extends Express.Multer.File {
  location: string;
  key: string;
  bucket: string;
}

export const uploadSingleFile = (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const s3File = req.file as S3File;
    
    res.json({
      message: 'File uploaded successfully',
      file: {
        key: s3File.key,
        filename: s3File.key.split('/').pop(),
        originalName: s3File.originalname,
        mimetype: s3File.mimetype,
        size: s3File.size,
        url: s3File.location,
        publicUrl: s3Service.getPublicUrl(s3File.key)
      }
    });
  } catch (error) {
    console.error('Upload single file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadMultipleFiles = (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = (req.files as S3File[]).map(file => ({
      key: file.key,
      filename: file.key.split('/').pop(),
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: file.location,
      publicUrl: s3Service.getPublicUrl(file.key)
    }));

    res.json({
      message: 'Files uploaded successfully',
      files
    });
  } catch (error) {
    console.error('Upload multiple files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'File key is required' });
    }

    await s3Service.deleteFile(key);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFileInfo = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'File key is required' });
    }

    const fileInfo = await s3Service.getFileInfo(key);

    res.json({
      key,
      filename: key.split('/').pop(),
      size: fileInfo.size,
      contentType: fileInfo.contentType,
      lastModified: fileInfo.lastModified,
      url: s3Service.getPublicUrl(key)
    });
  } catch (error) {
    console.error('Get file info error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSignedUrl = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { expiresIn = 3600 } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'File key is required' });
    }

    const signedUrl = await s3Service.getSignedUrl(key, Number(expiresIn));

    res.json({
      signedUrl,
      expiresIn: Number(expiresIn),
      expiresAt: new Date(Date.now() + Number(expiresIn) * 1000)
    });
  } catch (error) {
    console.error('Get signed URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};