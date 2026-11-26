const formatByMime = {
  'audio/aac': 'aac',
  'audio/aiff': 'aiff',
  'audio/flac': 'flac',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/opus': 'opus',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'audio/x-aiff': 'aiff',
  'audio/x-m4a': 'm4a',
  'audio/x-wav': 'wav',
};

export const getAudioFormat = track => {
  const source = track.audioUrl || '';
  const dataType = /^data:(audio\/[^;,]+)/i.exec(source)?.[1];
  const mime = (track.blob?.type || dataType || '').split(';')[0].toLowerCase();
  const filename = track.blob?.name || source.split(/[?#]/)[0];
  const extension = /\.([a-z0-9]+)$/i.exec(filename)?.[1]?.toLowerCase();
  return formatByMime[mime] || extension || 'mp3';
};
