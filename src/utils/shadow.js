import axios from 'axios'
const context = new (window.AudioContext || window.webkitAudioContext)()

export function playAudio(url, code = false) {
  return new Promise((resolve, reject) => {
    axios.get(url, { responseType: 'arraybuffer' }).then(function(response) {
      context.decodeAudioData(response.data, function(buffer) {
        if (code) {
          listenSound(buffer)
        } else {
          playSound(buffer).then(shadow => {
            resolve(shadow)
          })
        }
      })
    }).catch(function(error) {
      console.log(error)
      reject(error)
    })
  })
}

function listenSound(buffer) {
  console.log('listenSound:')
  var source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  source.start()
}

function playSound(buffer) {
  var source = context.createBufferSource()
  var analyser = context.createAnalyser()
  source.buffer = buffer
  source.connect(analyser)
  analyser.connect(context.destination)
  analyser.fftSize = 128
  var bufferLength = analyser.frequencyBinCount
  var dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)
  source.start()
  analyser.getByteTimeDomainData(dataArray)
  var duration = buffer.duration * 1000
  return new Promise((resolve) => {
    var _shadow = []
    var intv = 10
    var dura = 0
    var inter_id = setInterval(function() {
      analyser.getByteTimeDomainData(dataArray)
      var sum = 0
      for (const v of dataArray) {
        sum += v
      }
      var h = Math.abs(8192 - sum) / 10
      if (h < 3) h = 3
      _shadow.push(h)
      dura += intv
      if (dura > duration) {
        clearInterval(inter_id)
        var shadow = formatShadow(_shadow)
        resolve(shadow)
      }
    }, intv)
  })
}

function formatShadow(_shadow) {
  var shadow = []
  // 使数据过渡更顺滑
  for (let i = 0; i < _shadow.length; i++) {
    if (_shadow[i] < _shadow[i + 1] / 2) {
      _shadow[i] = _shadow[i + 1] / 2
    }
    if (_shadow[i] / 2 > _shadow[i + 1]) {
      _shadow[i + 1] = _shadow[i] / 2
    }
  }
  // 每9个数据取平均值
  var _max = 0
  for (let i = 0; i < _shadow.length; i++) {
    if (i % 9 === 0) {
      const av = (_shadow[i] + _shadow[i + 1] + _shadow[i + 2] + _shadow[i + 3] + _shadow[i + 4] + _shadow[i + 5] + _shadow[i + 6] + _shadow[i + 7] + _shadow[i + 8]) / 9
      const sam = Math.round(av)
      shadow.push(sam)
      if (sam > _max) _max = sam
    }
  }
  // 使数据过渡更顺滑--取整
  for (let i = 0; i < shadow.length; i++) {
    if (shadow[i] < shadow[i + 1] / 2) {
      shadow[i] = Math.round(shadow[i + 1] / 2)
    }
    if (shadow[i] / 2 > shadow[i + 1]) {
      shadow[i + 1] = Math.round(shadow[i] / 2)
    }
  }
  // 变换数据--最大值100
  var rate = 100 / _max
  for (let i = 0; i < shadow.length; i++) {
    if (shadow[i] > 3) {
      shadow[i] = Math.round(shadow[i] * rate)
    }
    if (shadow[i] < 3) {
      shadow[i] = 3
    }
    if (shadow[i] === 4) {
      shadow[i] = 5
    }
  }
  // 填充到105个元素
  shadow.pop()
  var fn = 105 - shadow.length
  if (fn > 0) {
    var fill_st = new Array(fn)
    fill_st.fill(3)
    shadow = shadow.concat(fill_st)
  }
  return shadow
}
