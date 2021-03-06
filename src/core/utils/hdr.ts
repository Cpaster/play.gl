const toChar = String.fromCharCode;
const MINELEN = 8;
const MAXELEN = 0x7fff;
function rgbe2float(rgbe, buffer, offset, exposure) {
    if (rgbe[3] > 0) {
      const f = Math.pow(2.0, rgbe[3] - 128 - 8 + exposure);
      buffer[offset + 0] = rgbe[0] * f;
      buffer[offset + 1] = rgbe[1] * f;
      buffer[offset + 2] = rgbe[2] * f;
    }
    else {
        buffer[offset + 0] = 0;
        buffer[offset + 1] = 0;
        buffer[offset + 2] = 0;
    }
    buffer[offset + 3] = 1.0;
    return buffer;
}


function copyrgbe(s, t) {
  t[0] = s[0];
  t[1] = s[1];
  t[2] = s[2];
  t[3] = s[3];
}

// TODO : check
function oldReadColors(scan, buffer, offset, xmax) {
  let rshift = 0, x = 0, len = xmax;
  while (len > 0) {
      scan[x][0] = buffer[offset++];
      scan[x][1] = buffer[offset++];
      scan[x][2] = buffer[offset++];
      scan[x][3] = buffer[offset++];
      if (scan[x][0] === 1 && scan[x][1] === 1 && scan[x][2] === 1) {
          // exp is count of repeated pixels
          for (let i = (scan[x][3] << rshift) >>> 0; i > 0; i--) {
              copyrgbe(scan[x-1], scan[x]);
              x++;
              len--;
          }
          rshift += 8;
      } else {
          x++;
          len--;
          rshift = 0;
      }
  }
  return offset;
}

function readColors(scan, buffer, offset, xmax) {
  if ((xmax < MINELEN) || (xmax > MAXELEN)) {
      return oldReadColors(scan, buffer, offset, xmax);
  }
  let i = buffer[offset++];
  if (i != 2) {
      return oldReadColors(scan, buffer, offset - 1, xmax);
  }
  scan[0][1] = buffer[offset++];
  scan[0][2] = buffer[offset++];

  i = buffer[offset++];
  if ((((scan[0][2] << 8) >>> 0) | i) >>> 0 !== xmax) {
      return null;
  }
  for (let i = 0; i < 4; i++) {
    for (let x = 0; x < xmax;) {
      let code = buffer[offset++];
      if (code > 128) {
        code = (code & 127) >>> 0;
        let val = buffer[offset++];
        while (code--) {
          scan[x++][i] = val;
        }
      } else {
        while (code--) {
          scan[x++][i] = buffer[offset++];
        }
      }
    }
  }
  return offset;
}

function uint82string(array, offset, size) {
  var str = '';
  for (var i = offset; i < size; i++) {
      str += toChar(array[i]);
  }
  return str;
}

export default function parseHDR2RGB(arrayBuffer, exposure:number = 0): any | void {
  var data = new Uint8Array(arrayBuffer);
  var size = data.length;
  if (uint82string(data, 0, 2) !== '#?') {
      return;
  }
  // find empty line, next line is resolution info
  for (var i = 2; i < size; i++) {
      if (toChar(data[i]) === '\n' && toChar(data[i+1]) === '\n') {
          break;
      }
  }
  if (i >= size) { // not found
      return;
  }
  // find resolution info line
  i += 2;
  var str = '';
  for (; i < size; i++) {
      var _char = toChar(data[i]);
      if (_char === '\n') {
          break;
      }
      str += _char;
  }
  // -Y M +X N
  var tmp = str.split(' ');
  var height = parseInt(tmp[1]);
  var width = parseInt(tmp[3]);
  if (!width || !height) {
      return;
  }

  // read and decode actual data
  let offset = i+1;
  let scanline = [];
  // memzero
  for (var x = 0; x < width; x++) {
      scanline[x] = [];
      for (var j = 0; j < 4; j++) {
          scanline[x][j] = 0;
      }
  }
  const pixels = new Float32Array(width * height * 4);
  let offset2 = 0;
  for (let y = 0; y < height; y++) {
      offset = readColors(scanline, data, offset, width);
      if (!offset) {
          return null;
      }
      for (let x = 0; x < width; x++) {
          rgbe2float(scanline[x], pixels, offset2, exposure);
          offset2 += 4;
      }
  }

  return {
    type: 5126,
    width,
    height,
    pixels,
    isHDR: true
  };
}