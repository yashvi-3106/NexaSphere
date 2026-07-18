import React, { useState, useCallback } from 'react';
import { useReactToPrint, type UseReactToPrintOptions } from 'react-to-print';
import { isIOS } from '../utils/deviceDetection';
import { generatePDFBlob } from '../utils/certificateDownload';

export interface UseCertificateExportOptions {
  content: () => HTMLElement | null;
  documentTitle?: string;
  onBeforeGetContent?: () => Promise<void> | void;
  onAfterPrint?: () => void;
  removeAfterPrint?: boolean;
}

export const useCertificateExport = (options: UseCertificateExportOptions) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const isIOSDevice = isIOS();

  // Setup standard react-to-print hook for non-iOS devices
  const printOptions: UseReactToPrintOptions = {
    contentRef: { current: options.content() } as React.RefObject<HTMLElement>,
    documentTitle: options.documentTitle,
    onBeforePrint: async () => {
      setIsExporting(true);
      if (options.onBeforeGetContent) {
        await options.onBeforeGetContent();
      }
    },
    onAfterPrint: () => {
      setIsExporting(false);
      if (options.onAfterPrint) {
        options.onAfterPrint();
      }
    },
    preserveAfterPrint: !(options.removeAfterPrint ?? true),
    // Reset exporting state on print error to prevent stuck loading state
    onPrintError: (_errorLocation, _error) => {
      setIsExporting(false);
      if (options.onAfterPrint) {
        options.onAfterPrint();
      }
    },
  };
  const handleReactToPrint = useReactToPrint(printOptions);

  const handlePrint = useCallback(async () => {
    if (!isIOSDevice) {
      // Use native fast print on Desktop/Android
      handleReactToPrint();
      return;
    }

    // iOS Fallback Flow
    const element = options.content();
    if (!element) return;

    try {
      setIsExporting(true);
      setExportError(null);
      if (options.onBeforeGetContent) {
        await options.onBeforeGetContent();
      }

      // Small delay to ensure any state updates from onBeforeGetContent have rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      await generatePDFBlob(element, `${options.documentTitle || 'export'}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsExporting(false);
      if (options.onAfterPrint) {
        options.onAfterPrint();
      }
    }
  }, [isIOSDevice, handleReactToPrint, options]);

  return {
    handlePrint,
    isExporting,
    exportError,
  };
};
