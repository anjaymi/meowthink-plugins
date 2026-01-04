/**
 * AI 角色工坊 - PDF 导出工具
 * 生成精美排版的角色设定 PDF
 */

import type { CharacterData } from '../types';

// PDF 模板类型
export type PDFTemplate = 'standard' | 'detailed' | 'minimal';

// PDF 导出选项
export interface PDFExportOptions {
  template: PDFTemplate;
  includeImages: boolean;
  includeAgent: boolean;
  language: 'zh' | 'en';
}

// PDF 导出请求
export interface PDFExportRequest {
  character: Partial<CharacterData>;
  options: PDFExportOptions;
}

/**
 * 调用后端生成 PDF
 */
export async function exportCharacterPDF(
  character: Partial<CharacterData>,
  options: PDFExportOptions
): Promise<Blob> {
  const response = await fetch('/api/character-workshop/export-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ character, options }),
  });

  if (!response.ok) {
    throw new Error('PDF generation failed');
  }

  return response.blob();
}

/**
 * 下载 PDF 文件
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 生成 PDF 文件名
 */
export function generatePDFFilename(character: Partial<CharacterData>): string {
  const name = character.name || 'character';
  const date = new Date().toISOString().split('T')[0];
  return `${name}_${date}.pdf`;
}

/**
 * 前端预览用的 HTML 模板（可用于打印）
 */
export function generatePrintableHTML(
  character: Partial<CharacterData>,
  isZh: boolean
): string {
  return `
<!DOCTYPE html>
<html lang="${isZh ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>${character.name || 'Character'} - Character Sheet</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Noto Sans SC', 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 28px; border-bottom: 3px solid #6366f1; padding-bottom: 10px; margin-bottom: 20px; }
    h2 { font-size: 18px; color: #6366f1; margin-top: 24px; margin-bottom: 12px; }
    .header { display: flex; gap: 24px; margin-bottom: 24px; }
    .avatar { width: 150px; height: 150px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 64px; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
    .info { flex: 1; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    .tag { background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 16px; font-size: 12px; }
    .section { margin-bottom: 20px; }
    .traits { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .trait { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
    .story { white-space: pre-wrap; background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${character.name || (isZh ? '未命名角色' : 'Unnamed Character')}</h1>
  
  <div class="header">
    <div class="avatar">
      ${character.images?.[0]?.url ? `<img src="${character.images[0].url}" alt="">` : '👤'}
    </div>
    <div class="info">
      <p><strong>${isZh ? '风格' : 'Style'}:</strong> ${character.style?.genre || '-'} ${character.style?.subGenre ? `/ ${character.style.subGenre}` : ''}</p>
      ${character.appearance?.gender ? `<p><strong>${isZh ? '性别' : 'Gender'}:</strong> ${character.appearance.gender}</p>` : ''}
      ${character.appearance?.age ? `<p><strong>${isZh ? '年龄' : 'Age'}:</strong> ${character.appearance.age}</p>` : ''}
      <div class="tags">
        ${(character.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>
  </div>

  ${character.appearance?.description ? `
  <div class="section">
    <h2>${isZh ? '外观' : 'Appearance'}</h2>
    <p>${character.appearance.description}</p>
  </div>
  ` : ''}

  ${character.personality?.description ? `
  <div class="section">
    <h2>${isZh ? '性格' : 'Personality'}</h2>
    ${character.personality.traits?.length ? `
    <div class="traits">
      ${character.personality.traits.map(t => `<span class="trait">${t}</span>`).join('')}
    </div>
    ` : ''}
    <p>${character.personality.description}</p>
    ${character.personality.speechStyle ? `<p><strong>${isZh ? '说话风格' : 'Speech Style'}:</strong> ${character.personality.speechStyle}</p>` : ''}
  </div>
  ` : ''}

  ${character.backstory?.fullStory ? `
  <div class="section">
    <h2>${isZh ? '背景故事' : 'Backstory'}</h2>
    ${character.backstory.origin ? `<p><strong>${isZh ? '出身' : 'Origin'}:</strong> ${character.backstory.origin}</p>` : ''}
    <div class="story">${character.backstory.fullStory}</div>
  </div>
  ` : ''}
</body>
</html>
  `.trim();
}

/**
 * 使用浏览器打印功能导出 PDF（备用方案）
 */
export function printToPDF(character: Partial<CharacterData>, isZh: boolean): void {
  const html = generatePrintableHTML(character, isZh);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
