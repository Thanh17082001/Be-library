import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import {randomNameFile} from './private-file-name';
import {cutPath} from './cut-folder-path';

export const generateImageFromVideo = async (videoPathFile: string, outputImagevideoFolder: string = 'publication', time: string = '00:00:14'): Promise<string> => {
  const videoPath = path.join(__dirname, '..', '..', 'public', videoPathFile);
  const nameOutputImage = randomNameFile('thumbnail-image.png');
  const outputImagePath = path.join(__dirname, '..', '..', 'public', outputImagevideoFolder, 'image-thumbnail', nameOutputImage);

  ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [time],
        filename: path.basename(outputImagePath), // Ensure only the filename is used, not the full path
        folder: path.dirname(outputImagePath),
      })
      .on('end', () => {
        resolve(cutPath(outputImagePath));
      })
      .on('error', (err: any) => {
        console.error('Error taking screenshot:', err);
        reject(err);
      });
  });
};
