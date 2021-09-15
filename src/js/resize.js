let hasBlobConstructor =
  typeof Blob !== "undefined" &&
  (function () {
    try {
      return Boolean(new Blob());
    } catch (e) {
      return false;
    }
  })();

let hasArrayBufferViewSupport =
  hasBlobConstructor &&
  typeof Uint8Array !== "undefined" &&
  (function () {
    try {
      return new Blob([new Uint8Array(100)]).size === 100;
    } catch (e) {
      return false;
    }
  })();

let hasToBlobSupport =
  typeof HTMLCanvasElement !== "undefined"
    ? HTMLCanvasElement.prototype.toBlob
    : false;

let hasBlobSupport =
  hasToBlobSupport ||
  (typeof Uint8Array !== "undefined" &&
    typeof ArrayBuffer !== "undefined" &&
    typeof atob !== "undefined");

let hasReaderSupport =
  typeof FileReader !== "undefined" || typeof URL !== "undefined";

export default class ImageTools {
  static resize(file, maxDimensions, callback) {
    if (typeof maxDimensions === "function") {
      callback = maxDimensions;
      maxDimensions = {
        width: 640,
        height: 480,
      };
    }

    if (!ImageTools.isSupported() || !file.type.match(/image.*/)) {
      callback(file, false);
      return false;
    }

    if (file.type.match(/image\/gif/)) {
      callback(file, false);
      return false;
    }

    let image = document.createElement("img");

    image.onload = () => {
      let width = image.width;
      let height = image.height;
      let isTooLarge = false;

      if (width >= height && width > maxDimensions.width) {
        height *= maxDimensions.width / width;
        width = maxDimensions.width;
        isTooLarge = true;
      } else if (height > maxDimensions.height) {
        width *= maxDimensions.height / height;
        height = maxDimensions.height;
        isTooLarge = true;
      }

      if (!isTooLarge) {
        callback(file, false);
        return;
      }

      let canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      let ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, width, height);

      if (hasToBlobSupport) {
        canvas.toBlob((blob) => {
          callback(blob, true);
        }, file.type);
      } else {
        let blob = ImageTools._toBlob(canvas, file.type);
        callback(blob, true);
      }
    };
    ImageTools._loadImage(image, file);

    return true;
  }

  static _toBlob(canvas, type) {
    let dataURI = canvas.toDataURL(type);
    let dataURIParts = dataURI.split(",");
    let byteString;
    if (dataURIParts[0].indexOf("base64") >= 0) {
      byteString = atob(dataURIParts[1]);
    } else {
      byteString = decodeURIComponent(dataURIParts[1]);
    }
    let arrayBuffer = new ArrayBuffer(byteString.length);
    let intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i += 1) {
      intArray[i] = byteString.charCodeAt(i);
    }

    let mimeString = dataURIParts[0].split(":")[1].split(";")[0];
    let blob = null;

    if (hasBlobConstructor) {
      blob = new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], {
        type: mimeString,
      });
    } else {
      blob = new Blob([arrayBuffer], { type: mimeString });
    }

    return blob;
  }

  static _loadImage(image, file, callback) {
    if (typeof URL === "undefined") {
      let reader = new FileReader();
      reader.onload = function (evt) {
        image.src = evt.target.result;
        if (callback) {
          callback();
        }
      };
      reader.readAsDataURL(file);
    } else {
      image.src = URL.createObjectURL(file);
      if (callback) {
        callback();
      }
    }
  }

  static isSupported() {
    return (
      typeof HTMLCanvasElement !== "undefined" &&
      hasBlobSupport &&
      hasReaderSupport
    );
  }
}
