
import React, { useState } from 'react';
import { FileText, Printer, Download, Eye } from 'lucide-react';
import type { CharacterData } from '../../types';
import { GenerateButton } from '../atoms/GenerateButton';

interface ExportTabProps {
  character: Partial<CharacterData>;
  isZh: boolean;
}

export const ExportTab: React.FC<ExportTabProps> = ({ character, isZh }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'standard' | 'detailed' | 'minimal'>('standard');

  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Mocking the API call matching the original logic
      const response = await fetch('/api/character-workshop/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, options: { template: selectedTemplate, includeImages: true, includeAgent: false, language: isZh ? 'zh' : 'en' } }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${character.name || 'character'}_character_sheet.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback
        handlePrintPDF();
      }
    } catch (err) {
      console.error('PDF export failed, using print fallback:', err);
      handlePrintPDF();
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ef-text)', marginBottom: 8 }}>
            {isZh ? '导出角色卡' : 'Export Character Sheet'}
        </h2>
        <p style={{ color: 'var(--ef-text-muted)' }}>
            {isZh ? '将角色设定导出为精美的 PDF 文档或打印保存' : 'Export your character as a PDF document or print it out.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
        {/* Template Selection */}
        <div style={{ background: 'var(--ef-bg-secondary)', padding: 20, borderRadius: 12, border: '1px solid var(--ef-border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--ef-text)' }}>
                {isZh ? '选择模板' : 'Select Template'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                    { id: 'standard', name: isZh ? '标准模板' : 'Standard', desc: isZh ? '包含基本信息和外观描述' : 'Includes basic info and appearance.' },
                    { id: 'detailed', name: isZh ? '详细模板' : 'Detailed', desc: isZh ? '包含完整背景故事和性格分析' : 'Full backstory and personality analysis.' },
                    { id: 'minimal', name: isZh ? '极简模板' : 'Minimal', desc: isZh ? '仅包含核心属性和图片' : 'Core stats and image only.' }
                ].map(tmpl => (
                    <div 
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl.id as any)}
                        style={{
                            padding: 12,
                            borderRadius: 8,
                            border: `2px solid ${selectedTemplate === tmpl.id ? 'var(--ef-accent)' : 'var(--ef-border)'}`,
                            background: selectedTemplate === tmpl.id ? 'var(--ef-accent-bg, rgba(99,102,241,0.05))' : 'var(--ef-bg-tertiary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}
                    >
                        <div style={{
                            width: 16, height: 16, borderRadius: '50%',
                            border: `2px solid ${selectedTemplate === tmpl.id ? 'var(--ef-accent)' : 'var(--ef-text-muted)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {selectedTemplate === tmpl.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ef-accent)' }} />}
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ef-text)' }}>{tmpl.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--ef-text-muted)' }}>{tmpl.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <button
                onClick={handleExportPDF}
                disabled={isExporting}
                style={{
                    padding: 24,
                    background: 'var(--ef-accent)',
                    border: 'none',
                    borderRadius: 12,
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    transition: 'all 0.2s',
                    opacity: isExporting ? 0.7 : 1,
                    boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                }}
                onMouseEnter={(e) => !isExporting && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !isExporting && (e.currentTarget.style.transform = 'translateY(0)')}
             >
                 {isExporting ? (
                     <FileText size={32} className="animate-pulse" />
                 ) : (
                     <Download size={32} />
                 )}
                 <div>
                     <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                         {isZh ? (isExporting ? '生成 PDF 中...' : '导出 PDF') : (isExporting ? 'Generating PDF...' : 'Export PDF')}
                     </div>
                     <div style={{ fontSize: 12, opacity: 0.8 }}>
                         {isZh ? '保存为本地 PDF 文件' : 'Save as local PDF file'}
                     </div>
                 </div>
             </button>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <button
                    onClick={handlePrintPDF}
                    style={{
                        padding: 16,
                        background: 'var(--ef-bg-secondary)',
                        border: '1px solid var(--ef-border)',
                        borderRadius: 12,
                        color: 'var(--ef-text)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ef-bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ef-bg-secondary)')}
                >
                    <Printer size={24} color="var(--ef-text-secondary)" />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{isZh ? '打印' : 'Print'}</span>
                </button>

                <button
                    onClick={() => {}} // Placeholder for preview
                    style={{
                        padding: 16,
                        background: 'var(--ef-bg-secondary)',
                        border: '1px solid var(--ef-border)',
                        borderRadius: 12,
                        color: 'var(--ef-text)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ef-bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ef-bg-secondary)')}
                >
                    <Eye size={24} color="var(--ef-text-secondary)" />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{isZh ? '预览' : 'Preview'}</span>
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};
