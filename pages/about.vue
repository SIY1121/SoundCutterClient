<template>
  <div class="container">
    <h1>SoundCutterとは？</h1>
    <p>
      Webブラウザ上で動作する音楽編集アプリです。PC、スマートフォンで利用できます。<br>
      また、PWA(Progressive Web Apps)に対応しているため、一度アクセスすれば、オフラインでも動作します。
    </p>
    <h1>特徴</h1>
    <p>
      通常の波形編集ソフトでは、秒単位で編集を行うため、曲の一部を切り出すのに耳でタイミングを聞き取るしかありませんでした。<br>
      SoundCutterでは、曲のテンポを解析し、拍子ベースで編集が行えるため、きれいに切り貼りが出来ます。
    </p>
    <h1>使用手順</h1>
    <p>
      <ol>
        <li>「ファイルを追加」から音楽ファイルを読み込みます。</li>
        <li>再生ボタンを押してテンポが合っているか確認します。</li>
        <li>明らかにテンポがあっていない場合は、BPMをクリックし、変更します。</li>
        <li>テンポは合っているがタイミングが合っていない場合には、開始位置を調節します。</li>
        <li>切り出したい部分の始点、終点を選択し、「タイムラインにコピー」を選択します。</li>
        <li>タイムライン上では、音声を並べ替える事ができます。</li>
        <li>編集が完了したら「SAVE」ボタンをクリックします。</li>
      </ol>
    </p>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
h1 {
  font-size: 2em;
  color: orange;
  border-bottom: 1px solid orange;
}
h1::before {
  content: "music_note";
  font-family: "Material Icons";
}
p {
  line-height: 2em;
}
</style>
