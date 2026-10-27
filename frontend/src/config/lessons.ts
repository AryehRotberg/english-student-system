// How lesson PDFs are shown:
//   'slides' - rendered with pdf.js: slide mode for presentations, a scrolling
//              page column for worksheets (PdfDeckViewer).
//   'native' - the browser's own PDF viewer in a frame (NativePdf in
//              LessonMaterialViewer), the original behaviour.
// To go back to the original viewer without a code change, build with
// VITE_PDF_VIEWER=native. The slides viewer also falls back to the native one
// on its own if pdf.js cannot load or open a file.
export const PDF_VIEWER: 'slides' | 'native' =
    import.meta.env.VITE_PDF_VIEWER === 'native' ? 'native' : 'slides';
