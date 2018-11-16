export default async (buffer) => {
  const filteredBuffer = await filter(buffer);

  const rawBuffer = filteredBuffer.getChannelData(0);
  const peaks = getPeaks(rawBuffer, buffer.sampleRate);
  const tempos = getTempos(peaks, buffer.sampleRate)
  const offset = getFirstBeatOffset(tempos[0], buffer.sampleRate);
  console.log(tempos);
  console.log(offset);
  return {
    bpm: tempos.slice(0, 5).map(el => el.tempo),
    offset: offset
  };
}

const filter = async (buffer) => {
  // Create offline context
  const offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);

  // Create buffer source
  const source = offlineContext.createBufferSource();
  source.buffer = buffer;

  // Create filter
  const lowpass = offlineContext.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 150;
  lowpass.Q.value = 1;

  const highpass = offlineContext.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 100;
  highpass.Q.value = 1;

  // Pipe the song into the filter, and the filter into the offline context
  source.connect(lowpass);
  lowpass.connect(highpass);
  highpass.connect(offlineContext.destination);

  // Schedule the song to start playing at time:0
  source.start(0);

  // Render the song
  return offlineContext.startRendering()
}

const getPeaks = (data, sampleRate) => {
  let partSize = sampleRate / 2,
    parts = data.length / partSize,
    peaks = [];

  for (let i = 0; i < parts; i++) {
    let max = 0;
    for (let j = i * partSize; j < (i + 1) * partSize; j++) {
      const volume = Math.abs(data[j]);
      if (!max || (volume > max.volume)) {
        max = {
          position: j,
          volume: volume
        };
      }
    }
    peaks.push(max);
  }
  peaks.sort((a, b) => {
    return b.volume - a.volume;
  });

  peaks = peaks.splice(0, peaks.length * 0.5);

  peaks.sort((a, b) => {
    return a.position - b.position;
  });

  return peaks;
}

const getTempos = (peaks, sampleRate) => {
  var groups = [];

  peaks.forEach((peak, index) => {
    for (let i = 1;
      (index + i) < peaks.length && i < 10; i++) {
      const group = {
        tempo: (60 * sampleRate) / (peaks[index + i].position - peak.position),
        positions: [],
        count: 1
      };

      while (group.tempo < 100) {
        group.tempo *= 2;
      }

      while (group.tempo > 200) {
        group.tempo /= 2;
      }

      group.tempo = Math.round(group.tempo);

      if (!(groups.some((interval) => {
          if (interval.tempo === group.tempo) {
            interval.count++;
            interval.positions.push(peak.position);
            return true;
          } else
            return false;
        }))) {
        group.positions.push(peak.position);
        groups.push(group);
      }
    }
  });

  groups.sort((a, b) => b.count - a.count);

  return groups;
}

const getFirstBeatOffset = (data, sampleRate) => {
  let pos = data.positions[Math.round(data.positions.length / 2)];
  console.log(data);
  let beatSampleCount = 60 / data.tempo * sampleRate;
  while (pos - beatSampleCount > 0)
    pos -= beatSampleCount;
  return pos / sampleRate;
}
