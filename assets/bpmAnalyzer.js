export default async (buffer) => {
  const filteredBuffer = await filter(buffer);

  const rawBuffer = filteredBuffer.getChannelData(0);

  let peakArray = [];
  let threshold = 0.95
  while (peakArray.length < 100 || peakArray.length > 150) {
    peakArray = getPeaksAtThreshold(rawBuffer, threshold);
    threshold -= 0.05;
  }

  console.log(peakArray);
  const intervalCounts = countIntervalsBetweenNearbyPeaks(peakArray);
  intervalCounts.sort((a, b) => {
    if (a.count > b.count) return -1;
    if (a.count < b.count) return 1;
    return 0;
  });
  const tempoCounts = groupNeighborsByTempo(intervalCounts, buffer.sampleRate);

  tempoCounts.sort((a, b) => {
    if (a.count > b.count) return -1;
    if (a.count < b.count) return 1;
    return 0;
  });

  const offset = getFirstBeatOffset(intervalCounts[0].interval, peakArray, tempoCounts[0].count, buffer.sampleRate);
  console.log(tempoCounts);
  console.log(offset);
  return {
    bpm: tempoCounts[0].tempo,
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

const getPeaksAtThreshold = (data, threshold) => {
  var peaksArray = [];
  var length = data.length;
  for (var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~ 1/4s to get past this peak.
      i += 10000;
    }
    i++;
  }
  return peaksArray;
}

const countIntervalsBetweenNearbyPeaks = (peaks) => {
  var intervalCounts = [];
  peaks.forEach((peak, index) => {
    for (var i = 1; i < 10; i++) {
      if (index + i >= peaks.length) break;
      var interval = peaks[index + i] - peak;
      var foundInterval = intervalCounts.some((intervalCount) => {
        if (intervalCount.interval === interval)
          return intervalCount.count++;
      });
      if (!foundInterval) {
        intervalCounts.push({
          interval: interval,
          count: 1
        });
      }
    }
  });
  return intervalCounts;
}

const groupNeighborsByTempo = (intervalCounts, sampleRate) => {
  var tempoCounts = []
  intervalCounts.forEach(function (intervalCount, i) {
    // Convert an interval to tempo
    var theoreticalTempo = 60 / (intervalCount.interval / sampleRate);

    // Adjust the tempo to fit within the 90-180 BPM range
    while (theoreticalTempo < 95) theoreticalTempo *= 2;
    while (theoreticalTempo > 190) theoreticalTempo /= 2;

    var foundTempo = tempoCounts.some(function (tempoCount) {
      if (tempoCount.tempo === theoreticalTempo)
        return tempoCount.count += intervalCount.count;
    });
    if (!foundTempo) {
      tempoCounts.push({
        tempo: theoreticalTempo,
        count: intervalCount.count
      });
    }
  });
  return tempoCounts;
}

const getFirstBeatOffset = (interval, peaks, max, sampleRate) => {
  let offset = 0;
  let counter = 0;
  for (let i = 0; i < peaks.length; i++) {
    for (let j = 1; j < 10; j++)
      if (peaks[i + j] - peaks[i] == interval) {
        counter++;
        console.log("f");
        if (counter > max / 2) {
          let peak = peaks[i];
          while (peak - interval > 0) {
            peak -= interval;
          }
          offset = peak;
          break;
        }
      }
  }
  return offset / sampleRate;
}
