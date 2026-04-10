const messages = {
  ja: {
    tagline: 'ポスターを実寸ARで確認',
    dropPrompt: 'タップして画像を選択',
    changeImage: '変更',
    size: 'サイズ',
    custom: 'カスタム',
    customLabel: 'カスタム',
    widthPlaceholder: '幅',
    heightPlaceholder: '高さ',
    orientation: '向き',
    portraitTitle: '縦',
    landscapeTitle: '横',
    arButton: 'ARで見る',
    generating: 'モデルを生成中...',
    generatingUsdz: 'USDZ を生成中...',
    generatingGlb: 'GLB を生成中...',
    arHint: '3Dプレビューの AR アイコンをタップ',
    error: 'エラー',
    notesTitle: 'ご利用にあたって',
    noteApprox: '表示されるサイズはあくまで目安です。実際の印刷物とは若干異なる場合があります',
    noteDevice: 'AR表示にはiOS 12+（Quick Look対応）またはAndroid（ARCore対応）のデバイスが必要です',
    noteScale: 'AR上で拡大縮小した場合、実寸とは異なります',
    noteColor: '画面の明るさや色味により、実際の印刷結果と色が異なって見える場合があります',
    notePrivacy: 'アップロードされた画像はサーバーに送信されず、すべてブラウザ上で処理されます',
  },
  en: {
    tagline: 'Preview posters in real-size AR',
    dropPrompt: 'Tap to select an image',
    changeImage: 'Change',
    size: 'Size',
    custom: 'Custom',
    customLabel: 'Custom',
    widthPlaceholder: 'W',
    heightPlaceholder: 'H',
    orientation: 'Orientation',
    portraitTitle: 'Portrait',
    landscapeTitle: 'Landscape',
    arButton: 'View in AR',
    generating: 'Generating model...',
    generatingUsdz: 'Generating USDZ...',
    generatingGlb: 'Generating GLB...',
    arHint: 'Tap the AR icon in the 3D preview',
    error: 'Error',
    notesTitle: 'Notes',
    noteApprox: 'Displayed sizes are approximate and may differ slightly from actual prints',
    noteDevice: 'AR requires iOS 12+ (Quick Look) or Android with ARCore support',
    noteScale: 'Pinch-to-zoom in AR will change the scale from real size',
    noteColor: 'Colors may appear different from actual prints due to screen brightness and color settings',
    notePrivacy: 'Uploaded images are processed locally in your browser and never sent to a server',
  },
} as const

type Lang = keyof typeof messages
type Key = keyof typeof messages['ja']

const lang: Lang = navigator.language.startsWith('ja') ? 'ja' : 'en'

export function t(key: Key): string {
  return messages[lang][key]
}

export function applyI18n() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as Key
    if (key) el.textContent = t(key)
  })

  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle as Key
    if (key) el.title = t(key)
  })

  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder as Key
    if (key) el.placeholder = t(key)
  })
}
