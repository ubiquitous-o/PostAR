import * as THREE from 'three'
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { getPaperDimensions, mmToMeters, PAPER_SIZES } from './poster/paper-sizes'
import type { Orientation } from './poster/paper-sizes'
import { t, applyI18n } from './i18n'

applyI18n()

let currentOrientation: Orientation = 'portrait'
let currentImageUrl = ''

const isIOS = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent)

// Hidden renderer — needed by USDZExporter to process textures
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(1, 1)
renderer.domElement.style.display = 'none'
document.body.appendChild(renderer.domElement)

// --- DOM ---
const dropZone = document.getElementById('drop-zone') as HTMLDivElement
const imageFileInput = document.getElementById('image-file') as HTMLInputElement
const sizeSelect = document.getElementById('size-select') as HTMLSelectElement
const sizeDisplay = document.getElementById('size-display') as HTMLDivElement
const customGroup = document.getElementById('custom-size-group') as HTMLDivElement
const customWidthInput = document.getElementById('custom-width') as HTMLInputElement
const customHeightInput = document.getElementById('custom-height') as HTMLInputElement
const btnPortrait = document.getElementById('btn-portrait') as HTMLButtonElement
const btnLandscape = document.getElementById('btn-landscape') as HTMLButtonElement
const btnChangeImage = document.getElementById('btn-change-image') as HTMLButtonElement
const arButton = document.getElementById('btn-ar') as HTMLButtonElement
const statusEl = document.getElementById('status') as HTMLParagraphElement
const previewContainer = document.getElementById('preview-container') as HTMLDivElement
const previewImage = document.getElementById('preview-image') as HTMLImageElement

// --- Image selection ---
function showImage(file: File) {
  if (currentImageUrl) URL.revokeObjectURL(currentImageUrl)
  currentImageUrl = URL.createObjectURL(file)
  previewImage.src = currentImageUrl
  previewContainer.style.display = 'block'
  dropZone.style.display = 'none'
  arButton.disabled = false
}

imageFileInput.addEventListener('change', () => {
  const file = imageFileInput.files?.[0]
  if (file) showImage(file)
})

btnChangeImage.addEventListener('click', () => {
  imageFileInput.click()
})

// --- Size selection ---
function updateSizeDisplay() {
  if (sizeSelect.value === 'custom') {
    customGroup.style.display = 'flex'
    sizeDisplay.style.display = 'none'
  } else {
    customGroup.style.display = 'none'
    sizeDisplay.style.display = 'block'
    const size = PAPER_SIZES[sizeSelect.value]
    if (size) {
      const w = Math.round(size.width * 1000)
      const h = Math.round(size.height * 1000)
      sizeDisplay.textContent = currentOrientation === 'landscape'
        ? `${h} × ${w} mm`
        : `${w} × ${h} mm`
    }
  }
}

sizeSelect.addEventListener('change', updateSizeDisplay)

// --- Orientation ---
btnPortrait.addEventListener('click', () => {
  currentOrientation = 'portrait'
  btnPortrait.classList.add('active')
  btnLandscape.classList.remove('active')
  updateSizeDisplay()
})

btnLandscape.addEventListener('click', () => {
  currentOrientation = 'landscape'
  btnLandscape.classList.add('active')
  btnPortrait.classList.remove('active')
  updateSizeDisplay()
})

arButton.addEventListener('click', generateAndOpen)

// --- Get poster dimensions ---
function getPosterSize(): { width: number; height: number } {
  if (sizeSelect.value === 'custom') {
    let w = mmToMeters(Number(customWidthInput.value) || 210)
    let h = mmToMeters(Number(customHeightInput.value) || 297)
    if (currentOrientation === 'landscape') [w, h] = [h, w]
    return { width: w, height: h }
  }
  return getPaperDimensions(sizeSelect.value, currentOrientation)
}

// --- Load image as texture ---
function loadImageTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      resolve(texture)
    }
    img.onerror = reject
    img.src = url
  })
}

// --- Generate 3D model and open in AR ---
async function generateAndOpen() {
  if (!currentImageUrl) return

  statusEl.textContent = t('generating')
  arButton.disabled = true

  try {
    const { width, height } = getPosterSize()
    const texture = await loadImageTexture(currentImageUrl)

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.0,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const tempCamera = new THREE.PerspectiveCamera()
    renderer.render(scene, tempCamera)

    if (isIOS) {
      await openQuickLook(scene)
    } else {
      await openModelViewer(scene)
    }

    statusEl.textContent = ''
  } catch (e) {
    statusEl.textContent = `${t('error')}: ${e}`
    console.error(e)
  } finally {
    arButton.disabled = false
  }
}

// --- iOS: USDZ → Quick Look ---
async function openQuickLook(scene: THREE.Scene) {
  statusEl.textContent = t('generatingUsdz')
  const exporter = new USDZExporter()
  const usdzBuffer = await exporter.parseAsync(scene, { quickLookCompatible: true })
  const blob = new Blob([usdzBuffer], { type: 'model/vnd.usdz+zip' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.rel = 'ar'
  a.href = url
  const img = document.createElement('img')
  a.appendChild(img)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

// --- Android: GLB → model-viewer ---
async function openModelViewer(scene: THREE.Scene) {
  statusEl.textContent = t('generatingGlb')
  const exporter = new GLTFExporter()
  const glb = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(scene, (result) => resolve(result as ArrayBuffer), reject, { binary: true })
  })
  const blob = new Blob([glb], { type: 'model/gltf-binary' })
  const url = URL.createObjectURL(blob)

  const container = document.getElementById('model-viewer-container')!
  container.innerHTML = ''
  container.style.display = 'block'

  const mv = document.createElement('model-viewer')
  mv.setAttribute('src', url)
  mv.setAttribute('ar', '')
  mv.setAttribute('ar-modes', 'webxr quick-look')
  mv.setAttribute('ar-placement', 'wall')
  mv.setAttribute('ar-scale', 'auto')
  mv.setAttribute('camera-controls', '')
  mv.setAttribute('shadow-intensity', '0')
  mv.setAttribute('style', 'width: 100%; height: 400px; background: #141414; border-radius: 16px;')
  container.appendChild(mv)

  container.scrollIntoView({ behavior: 'smooth' })
  statusEl.textContent = t('arHint')
}
