import jsQR from 'jsqr';

/**
 * Decodes a QR code image DataURL or Image element using jsQR.
 * Returns decoded string (typically UPI URI like upi://pay?pa=...&pn=...) or null.
 */
export const decodeQrCode = (imageSource) => {
  return new Promise((resolve) => {
    if (!imageSource) return resolve(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          resolve(code.data);
        } else {
          // Retry with attemptBoth if inverted
          const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          resolve(codeInverted?.data || null);
        }
      } catch (err) {
        console.warn('QR decode error:', err);
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = imageSource;
  });
};

/**
 * Extracts UPI ID (pa) and Payee Name (pn) from a UPI URI string.
 */
export const extractUpiDetails = (upiUri) => {
  if (!upiUri || typeof upiUri !== 'string') return null;

  try {
    // Expected format: upi://pay?pa=username@bank&pn=MerchantName&...
    const cleanUri = upiUri.trim();
    if (!cleanUri.startsWith('upi://') && !cleanUri.includes('pa=')) {
      // Check if it's a bare UPI ID (e.g. name@bank)
      if (cleanUri.includes('@') && !cleanUri.includes(' ') && !cleanUri.includes('/')) {
        return { upiId: cleanUri, merchantName: '' };
      }
      return null;
    }

    const queryPart = cleanUri.includes('?') ? cleanUri.split('?')[1] : cleanUri;
    const params = new URLSearchParams(queryPart);

    const upiId = params.get('pa') || '';
    const merchantName = params.get('pn') || '';

    if (!upiId) return null;

    return {
      upiId: decodeURIComponent(upiId).trim(),
      merchantName: decodeURIComponent(merchantName).trim(),
    };
  } catch (err) {
    console.warn('Failed to parse UPI URI:', err);
    return null;
  }
};

/**
 * Resizes and compresses QR code image to a lightweight format (< 50KB)
 * for instant cross-device broadcast over MQTT and Cloud API.
 */
export const compressQrImage = (dataUrl, maxDim = 450) => {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string') return resolve(dataUrl);

    const img = new Image();
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch (_) {
        resolve(dataUrl);
      }
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};
