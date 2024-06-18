const { PDFDocument, rgb } = require('pdf-lib');
const multer = require('multer');
const upload = multer();

const watermarkPdf = async (req, res) => {
  try {
    const pdfBuffer = req.files.pdf[0].buffer;
    const watermarkBuffer = req.files.watermark[0].buffer;
    const x = parseFloat(req.body.x);
    const y = parseFloat(req.body.y);
    const width = parseFloat(req.body.width);
    const height = parseFloat(req.body.height);

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    const watermarkImage = await pdfDoc.embedPng(watermarkBuffer);

    for (const page of pages) {
      page.drawImage(watermarkImage, {
        x,
        y,
        width,
        height,
      });

      // Add page numbers if TTF is provided
      if (req.files.ttf) {
        const ttfBuffer = req.files.ttf[0].buffer;
        const customFont = await pdfDoc.embedFont(ttfBuffer);
        const pageNumber = pages.indexOf(page) + 1;

        page.drawText(`${pageNumber}`, {
          x: page.getWidth() - 50,
          y: 30,
          size: 12,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = (req, res) => {
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'watermark', maxCount: 1 },
    { name: 'ttf', maxCount: 1 },
  ])(req, res, () => watermarkPdf(req, res));
};
