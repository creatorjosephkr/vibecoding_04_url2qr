/**
 * URL2QR - Core Application Logic
 * Supports: i18n (KO, EN, ZH, JA), Light/Dark Themes, QR Generation, PNG/JPG Export
 */

(function () {
  'use strict';

  // --- Multi-language Dictionary ---
  const i18nData = {
    ko: {
      docTitle: 'URL2QR - 스마트 QR코드 생성기',
      guidanceText: 'URL을 입력한 후 확인 버튼을 누르면 QR코드가 생성됩니다',
      placeholder: 'https://example.com 또는 웹사이트 주소를 입력하세요',
      btnConfirm: '확인',
      btnUpdate: 'QR코드 갱신',
      btnSave: '저장하기',
      btnCopy: 'URL 복사',
      btnReset: '새로 만들기',
      clickDownload: '클릭하여 다운로드',
      copiedToast: 'URL이 클립보드에 복사되었습니다.',
      downloadSuccess: 'QR코드가 다운로드되었습니다 ({format})',
      invalidUrl: '올바른 웹사이트 URL을 입력해주세요.',
      emptyUrl: 'URL 주소를 입력해주세요.',
      themeLight: '라이트 모드',
      themeDark: '다크 모드',
      chipLabel: '추천 예시:'
    },
    en: {
      docTitle: 'URL2QR - Smart QR Code Generator',
      guidanceText: 'Enter a URL and click Confirm to generate your QR code',
      placeholder: 'Enter https://example.com or any website URL',
      btnConfirm: 'Confirm',
      btnUpdate: 'Update QR',
      btnSave: 'Save QR',
      btnCopy: 'Copy URL',
      btnReset: 'Create New',
      clickDownload: 'Click to download',
      copiedToast: 'URL copied to clipboard.',
      downloadSuccess: 'QR Code downloaded ({format})',
      invalidUrl: 'Please enter a valid website URL.',
      emptyUrl: 'Please enter a URL.',
      themeLight: 'Light Mode',
      themeDark: 'Dark Mode',
      chipLabel: 'Try example:'
    },
    zh: {
      docTitle: 'URL2QR - 智能二维码生成器',
      guidanceText: '输入网址后点击“确认”按钮即可生成二维码',
      placeholder: '请输入 https://example.com 或网页链接',
      btnConfirm: '确认',
      btnUpdate: '更新二维码',
      btnSave: '保存二维码',
      btnCopy: '复制网址',
      btnReset: '新建',
      clickDownload: '点击下载',
      copiedToast: '网址已复制到剪贴板。',
      downloadSuccess: '二维码已成功下载 ({format})',
      invalidUrl: '请输入有效的网站网址。',
      emptyUrl: '请输入网址。',
      themeLight: '浅色模式',
      themeDark: '深色模式',
      chipLabel: '推荐示例:'
    },
    ja: {
      docTitle: 'URL2QR - スマートQRコード生成ツール',
      guidanceText: 'URLを入力して確認ボタンを押すとQRコードが生成されます',
      placeholder: 'https://example.com またはWebアドレスを入力してください',
      btnConfirm: '確認',
      btnUpdate: 'QR更新',
      btnSave: '保存する',
      btnCopy: 'URLコピー',
      btnReset: '新規作成',
      clickDownload: 'クリックしてダウンロード',
      copiedToast: 'URLがクリップボードにコピーされました。',
      downloadSuccess: 'QRコードが保存されました ({format})',
      invalidUrl: '有効なURLを入力してください。',
      emptyUrl: 'URLを入力してください。',
      themeLight: 'ライトモード',
      themeDark: 'ダークモード',
      chipLabel: 'おすすめ例:'
    }
  };

  // State Management
  let currentLang = localStorage.getItem('url2qr_lang') || 'ko';
  let currentTheme = localStorage.getItem('url2qr_theme') || 'light';
  let currentFormat = 'png'; // 'png' or 'jpg'
  let qrCodeInstance = null;
  let activeGeneratedUrl = '';
  let toastTimer = null;

  // DOM Elements
  const elHtml = document.documentElement;
  const elGuidanceText = document.getElementById('guidanceText');
  const elUrlInput = document.getElementById('urlInput');
  const elBtnConfirm = document.getElementById('btnConfirm');
  const elBtnConfirmText = document.getElementById('btnConfirmText');
  const elInteractionHub = document.getElementById('interactionHub');
  const elQrCodeContainer = document.getElementById('qrcode');
  const elQrCardWrapper = document.getElementById('qrCardWrapper');
  const elBtnSave = document.getElementById('btnSave');
  const elBtnSaveText = document.getElementById('btnSaveText');
  const elBtnCopy = document.getElementById('btnCopy');
  const elBtnCopyText = document.getElementById('btnCopyText');
  const elBtnReset = document.getElementById('btnReset');
  const elBtnResetText = document.getElementById('btnResetText');
  const elQrHoverText = document.getElementById('qrHoverText');
  const elChipLabel = document.getElementById('chipLabel');
  const elThemeToggle = document.getElementById('themeToggle');
  const elToast = document.getElementById('toast');
  const elToastText = document.getElementById('toastText');
  const elClearInput = document.getElementById('clearInput');
  const elPasteInput = document.getElementById('pasteInput');

  // Format Buttons
  const formatButtons = document.querySelectorAll('.format-btn');
  const langButtons = document.querySelectorAll('.lang-btn');

  // SVG Icons for Theme Toggle
  const sunIcon = `
    <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>`;

  const moonIcon = `
    <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>`;

  /**
   * Initialize Application
   */
  function init() {
    initTheme();
    setLanguage(currentLang);
    bindEvents();
  }

  /**
   * Theme Management
   */
  function initTheme() {
    applyTheme(currentTheme);
  }

  function applyTheme(theme) {
    currentTheme = theme;
    elHtml.setAttribute('data-theme', theme);
    localStorage.setItem('url2qr_theme', theme);

    if (elThemeToggle) {
      elThemeToggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
      elThemeToggle.setAttribute(
        'title',
        theme === 'dark' ? i18nData[currentLang].themeLight : i18nData[currentLang].themeDark
      );
    }
  }

  function toggleTheme() {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  }

  /**
   * Multi-Language Management
   */
  function setLanguage(lang) {
    if (!i18nData[lang]) lang = 'ko';
    currentLang = lang;
    localStorage.setItem('url2qr_lang', lang);

    const strings = i18nData[lang];
    document.title = strings.docTitle;
    elGuidanceText.textContent = strings.guidanceText;
    elUrlInput.setAttribute('placeholder', strings.placeholder);
    
    // Update buttons
    const isGenerated = elInteractionHub.classList.contains('has-qr');
    elBtnConfirmText.textContent = isGenerated ? strings.btnUpdate : strings.btnConfirm;
    if (elBtnSaveText) elBtnSaveText.textContent = strings.btnSave;
    if (elBtnCopyText) elBtnCopyText.textContent = strings.btnCopy;
    if (elBtnResetText) elBtnResetText.textContent = strings.btnReset;
    if (elQrHoverText) elQrHoverText.textContent = strings.clickDownload;
    if (elChipLabel) elChipLabel.textContent = strings.chipLabel;

    // Theme button title
    if (elThemeToggle) {
      elThemeToggle.setAttribute(
        'title',
        currentTheme === 'dark' ? strings.themeLight : strings.themeDark
      );
    }

    // Active button state
    langButtons.forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Event Listeners
   */
  function bindEvents() {
    // Theme Switcher
    if (elThemeToggle) {
      elThemeToggle.addEventListener('click', toggleTheme);
    }

    // Language Switcher
    langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
      });
    });

    // Format Selector (PNG vs JPG)
    formatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        formatButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFormat = btn.dataset.format || 'png';
      });
    });

    // Confirm Button
    elBtnConfirm.addEventListener('click', handleGenerate);

    // Enter Key on input
    elUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    });

    // Click QR Code Card directly -> Download (Requirement 5)
    elQrCardWrapper.addEventListener('click', (e) => {
      downloadQRCode();
    });

    // Bottom Save Button -> Download (Requirement 5)
    elBtnSave.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadQRCode();
    });

    // Copy URL Button
    if (elBtnCopy) {
      elBtnCopy.addEventListener('click', handleCopyUrl);
    }

    // Reset Button
    if (elBtnReset) {
      elBtnReset.addEventListener('click', handleReset);
    }

    // Clear Input Button
    if (elClearInput) {
      elClearInput.addEventListener('click', () => {
        elUrlInput.value = '';
        elUrlInput.focus();
      });
    }

    // Paste from Clipboard Button
    if (elPasteInput) {
      elPasteInput.addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            elUrlInput.value = text.trim();
            elUrlInput.focus();
          }
        } catch (err) {
          elUrlInput.focus();
        }
      });
    }

    // Quick suggestion chips
    document.querySelectorAll('.url-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        elUrlInput.value = chip.dataset.url;
        handleGenerate();
      });
    });
  }

  /**
   * Normalize & Validate URL
   */
  function normalizeUrl(input) {
    let raw = input.trim();
    if (!raw) return '';
    
    // If lacks protocol and resembles a domain or path
    if (!/^https?:\/\//i.test(raw)) {
      raw = 'https://' + raw;
    }
    return raw;
  }

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  /**
   * Generate QR Code
   * Requirement 4: URL 입력하고 확인 버튼 누르면 URL창이 하단으로 내려가고 화면 정중앙에 QR코드 만들어짐
   */
  function handleGenerate() {
    const rawVal = elUrlInput.value.trim();
    if (!rawVal) {
      showToast(i18nData[currentLang].emptyUrl);
      elUrlInput.focus();
      return;
    }

    const targetUrl = normalizeUrl(rawVal);
    if (!isValidUrl(targetUrl)) {
      showToast(i18nData[currentLang].invalidUrl);
      elUrlInput.focus();
      return;
    }

    // Update input display to normalized URL
    elUrlInput.value = targetUrl;
    activeGeneratedUrl = targetUrl;

    // Clear previous QR code
    elQrCodeContainer.innerHTML = '';

    // Generate new QR Code using qrcode.min.js
    // Dimensions: 240x240 for on-screen display, high error correction (Level H)
    try {
      qrCodeInstance = new QRCode(elQrCodeContainer, {
        text: targetUrl,
        width: 256,
        height: 256,
        colorDark: '#121316',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.H
      });
    } catch (e) {
      console.error('QR Code generation error:', e);
    }

    // Apply layout change: add .has-qr class
    // This moves the QR code into the center and places the URL input section below it!
    elInteractionHub.classList.add('has-qr');
    elBtnConfirmText.textContent = i18nData[currentLang].btnUpdate;

    // Smooth scroll to QR area on smaller screens if needed
    setTimeout(() => {
      elQrCardWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }

  /**
   * Generate SVG Vector XML String
   */
  function generateSVGString(targetUrl) {
    if (!qrCodeInstance || !qrCodeInstance._oQRCode) {
      return null;
    }
    const model = qrCodeInstance._oQRCode;
    const moduleCount = model.getModuleCount();
    const margin = 4;
    const totalSize = moduleCount + margin * 2;

    let pathData = '';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (model.isDark(r, c)) {
          pathData += `M${c + margin},${r + margin}h1v1h-1z `;
        }
      }
    }

    const cleanUrl = targetUrl
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="1024" height="1024" shape-rendering="crispEdges">
  <desc>QR Code generated by URL2QR for ${cleanUrl}</desc>
  <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF"/>
  <path d="${pathData.trim()}" fill="#121316"/>
</svg>`;
  }

  /**
   * Download QR Code (Requirement 5)
   * Supports: PNG, JPG, or SVG
   * Triggers on QR code click or "저장하기" button click
   */
  function downloadQRCode() {
    if (!activeGeneratedUrl && !elInteractionHub.classList.contains('has-qr')) {
      return;
    }

    // Generate filename based on hostname or timestamp
    let domainName = 'qrcode';
    try {
      const u = new URL(activeGeneratedUrl);
      domainName = u.hostname.replace(/[^a-zA-Z0-9_-]/g, '_');
    } catch (_) {}

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // Handle SVG Vector Download
    if (currentFormat === 'svg') {
      const svgContent = generateSVGString(activeGeneratedUrl);
      if (!svgContent) {
        showToast('SVG 생성 중 오류가 발생했습니다.');
        return;
      }

      const filename = `URL2QR_${domainName}_${timestamp}.svg`;
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      const successMsg = i18nData[currentLang].downloadSuccess.replace('{format}', 'SVG');
      showToast(successMsg);
      return;
    }

    // Find the canvas or image in #qrcode container
    const canvas = elQrCodeContainer.querySelector('canvas');
    const img = elQrCodeContainer.querySelector('img');

    if (!canvas && (!img || !img.src)) {
      showToast('QR code is still rendering, please try again.');
      return;
    }

    // High resolution export canvas (1024 x 1024 with clean white margin)
    const exportSize = 1024;
    const padding = 80;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext('2d');

    // Fill clean white background (strictly required for JPG to avoid black backgrounds!)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, exportSize, exportSize);

    // Source to draw
    const drawSource = canvas || img;

    const finalizeDownload = () => {
      // Draw QR content centered with margin
      ctx.drawImage(drawSource, padding, padding, exportSize - padding * 2, exportSize - padding * 2);

      const isJpg = currentFormat === 'jpg';
      const mimeType = isJpg ? 'image/jpeg' : 'image/png';
      const fileExt = isJpg ? 'jpg' : 'png';
      const quality = isJpg ? 0.95 : 1.0;

      let dataUrl;
      try {
        dataUrl = exportCanvas.toDataURL(mimeType, quality);
      } catch (err) {
        console.error('Error generating data URL:', err);
        return;
      }

      const filename = `URL2QR_${domainName}_${timestamp}.${fileExt}`;

      // Trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show Toast Notification
      const successMsg = i18nData[currentLang].downloadSuccess.replace('{format}', fileExt.toUpperCase());
      showToast(successMsg);
    };

    // If source is an image that might still be loading, wait for it
    if (img && !canvas && !img.complete) {
      img.onload = finalizeDownload;
    } else {
      finalizeDownload();
    }
  }

  /**
   * Copy Active URL
   */
  async function handleCopyUrl() {
    if (!activeGeneratedUrl) return;
    try {
      await navigator.clipboard.writeText(activeGeneratedUrl);
      showToast(i18nData[currentLang].copiedToast);
    } catch (_) {
      elUrlInput.select();
      document.execCommand('copy');
      showToast(i18nData[currentLang].copiedToast);
    }
  }

  /**
   * Reset / Create New QR
   */
  function handleReset() {
    elInteractionHub.classList.remove('has-qr');
    elUrlInput.value = '';
    elBtnConfirmText.textContent = i18nData[currentLang].btnConfirm;
    activeGeneratedUrl = '';
    elUrlInput.focus();
  }

  /**
   * Toast Notification Helper
   */
  function showToast(message) {
    if (!elToast || !elToastText) return;

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    elToastText.textContent = message;
    elToast.classList.add('show');

    toastTimer = setTimeout(() => {
      elToast.classList.remove('show');
    }, 2800);
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
