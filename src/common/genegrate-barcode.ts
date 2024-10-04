import * as JsBarcode from 'jsbarcode';

import {createCanvas} from 'canvas';

export function generateBarcode(): string {
  const data = generateRandomData();
  // Create a canvas for rendering the barcode
  const canvas = createCanvas(300, 100);

  // Generate the barcode using JsBarcode
  JsBarcode(canvas, data, {
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true, // You can specify other formats like 'EAN13', 'UPC', etc.
  });

  // Convert the canvas to a data URL (base64 encoded image)
  return canvas.toDataURL('image/png');
}

export function generateRandomData(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
