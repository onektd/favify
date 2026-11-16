export interface IcoImageEntry {
  size: number;
  data: Uint8Array;
}

/**
 * Encodes one or more PNG-compressed icon images into a standard Windows/Web `.ico` binary.
 * Modern browsers and operating systems natively support PNG payloads inside ICO containers.
 */
export function encodeIco(entries: IcoImageEntry[]): Uint8Array {
  if (entries.length === 0) {
    throw new Error('At least one PNG entry is required to build an ICO file.');
  }

  const headerSize = 6;
  const dirEntrySize = 16;
  const dirTotalSize = dirEntrySize * entries.length;
  let dataOffset = headerSize + dirTotalSize;

  const totalPayloadSize = entries.reduce((sum, entry) => sum + entry.data.byteLength, 0);
  const buffer = new ArrayBuffer(dataOffset + totalPayloadSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // ICONDIR header: reserved (0), type (1 = ICO), count
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, entries.length, true);

  entries.forEach((entry, index) => {
    const entryOffset = headerSize + index * dirEntrySize;
    const dim = entry.size >= 256 ? 0 : entry.size;

    view.setUint8(entryOffset, dim); // width (0 means 256)
    view.setUint8(entryOffset + 1, dim); // height
    view.setUint8(entryOffset + 2, 0); // color palette count
    view.setUint8(entryOffset + 3, 0); // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, entry.data.byteLength, true); // image data size
    view.setUint32(entryOffset + 12, dataOffset, true); // offset from start of file

    bytes.set(entry.data, dataOffset);
    dataOffset += entry.data.byteLength;
  });

  return bytes;
}
