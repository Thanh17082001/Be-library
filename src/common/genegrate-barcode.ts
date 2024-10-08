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

export function generateRandomData(): string {
  const date = new Date();
  const timestamp = date.getTime(); // Lấy timestamp (millisecond từ 01/01/1970)

  // Chuyển timestamp thành chuỗi và mã hóa base36 (sử dụng số và chữ cái)
  // let randomString = timestamp.toString(36);

  // // Đảo ngược chuỗi để thêm tính ngẫu nhiên
  // randomString = randomString.split('').reverse().join('');

  // Trả về chuỗi ngẫu nhiên
  return timestamp.toString();
}
