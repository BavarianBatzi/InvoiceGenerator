import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, CssBaseline, ThemeProvider, createTheme, MenuItem, Modal } from '@mui/material';
import jsPDF from 'jspdf';
import DeleteIcon from '@mui/icons-material/Delete';
import { SwapHoriz } from '@mui/icons-material'; // Icon für den Umschaltbutton
import InvoiceGenerator from './InvoiceGenerator'; // Importiere das Rechnungs-Komponente (anpassen, falls erforderlich)

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#2c2c2c',
    },
    primary: {
      main: '#f44336', // Rot als Akzentfarbe
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

function OfferGenerator() {
  const [logo, setLogo] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isOfferMode, setIsOfferMode] = useState(true); // Zustand für die Umschaltung

  useEffect(() => {
    const defaultLogoPath = `${process.env.PUBLIC_URL}/logo.png`;
    fetch(defaultLogoPath)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          setLogo(reader.result);
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => console.error('Fehler beim Laden des Standardlogos:', error));
  }, []);

  const [recipient, setRecipient] = useState({ gender: 'Herr', name: '', address: '' });
  const [items, setItems] = useState([{ type: 'category', description: '' }, { type: 'item', description: '', quantity: 1, price: 0 }]);
  const [offerNumber, setOfferNumber] = useState('');
  const [projectName, setProjectName] = useState('');
  const [offerDate, setOfferDate] = useState(new Date().toISOString().split('T')[0]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Schröcker Fliesenverlegung',
    owner: 'Inh. Marco Schröcker',
    address: 'Lohholz 8, 84106 Volkenschwand',
    phone: '0162/6853772',
    email: 'jmmarco1994@gmail.com',
    taxNumber: '12627120549',
    taxOffice: 'Kelheim',
    bankName: 'Raiffeisenbank Hallertau eG',
    iban: 'DE 43 7016 9693 0100 8170 23',
    bic: 'GENODEF1RHT',
  });

  const toggleMode = () => {
    setIsOfferMode(!isOfferMode);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setItems([...items, { type: 'item', description: '', quantity: 1, price: 0 }]);
  };

  const handleAddCategory = () => {
    setItems([...items, { type: 'category', description: '' }]);
  };

  const handleChange = (e, index, field) => {
    const updatedItems = [...items];
    updatedItems[index][field] = e.target.value;
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      if (item.type === 'item') {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        return total + quantity * price;
      }
      return total;
    }, 0).toFixed(2);
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    let yOffset = 10;

    if (logo) {
      const img = new Image();
      img.src = logo;
      const aspectRatio = img.width / img.height;
      const imgWidth = 100;
      const imgHeight = imgWidth / aspectRatio;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const centerX = (pageWidth - imgWidth) / 2;

      pdf.addImage(img.src, 'PNG', centerX, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 10;
    }

    generatePDFContent(pdf, yOffset);

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfPreviewUrl(pdfUrl);
  };

  const generatePDFContent = (pdf, yOffset) => {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const bottomMargin = 30;

    const addPageIfNeeded = () => {
      if (yOffset >= pageHeight - bottomMargin) {
        renderFooter(pdf);
        pdf.addPage();
        yOffset = 10;
        renderHeader();
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
      }
    };

    const renderFooter = (pdf) => {
      const footerYOffset = pageHeight - 25;
      pdf.setFontSize(8);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(10, footerYOffset - 5, 200, footerYOffset - 5);

      pdf.text('Firmeninformationen:', 10, footerYOffset);
      pdf.text(companyInfo.name, 10, footerYOffset + 5);
      pdf.text(companyInfo.address, 10, footerYOffset + 10);
      pdf.text(`Mobil: ${companyInfo.phone}`, 10, footerYOffset + 15);
      pdf.text(`E-Mail: ${companyInfo.email}`, 10, footerYOffset + 20);

      pdf.text('Steuerdaten:', 60, footerYOffset);
      pdf.text(`Steuer-Nr.: ${companyInfo.taxNumber}`, 60, footerYOffset + 5);
      pdf.text(`Finanzamt: ${companyInfo.taxOffice}`, 60, footerYOffset + 10);

      pdf.text('Bankverbindung:', 100, footerYOffset);
      pdf.text(companyInfo.bankName, 100, footerYOffset + 5);
      pdf.text(`IBAN: ${companyInfo.iban}`, 100, footerYOffset + 10);
      pdf.text(`BIC: ${companyInfo.bic}`, 100, footerYOffset + 15);

      pdf.text('Kontakt:', 155, footerYOffset);
      pdf.text(`E-Mail: ${companyInfo.email}`, 155, footerYOffset + 5);
      pdf.text(`Tel.: ${companyInfo.phone}`, 155, footerYOffset + 10);
    };

    const renderHeader = () => {
      // Optional: Header-Inhalte für neue Seiten hier hinzufügen
    };

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text('Kundeninformationen', 10, yOffset);
    pdf.setFontSize(10);
    pdf.text(`${recipient.gender}`, 10, yOffset + 5);
    pdf.text(recipient.name || '[Kundenname]', 10, yOffset + 10);
    pdf.text(recipient.address || '[Kundenadresse]', 10, yOffset + 15);

    const rightXOffset = 130;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(companyInfo.name, rightXOffset, yOffset);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(companyInfo.owner, rightXOffset, yOffset + 5);
    pdf.text(companyInfo.address, rightXOffset, yOffset + 10);
    pdf.text(`Tel.: ${companyInfo.phone}`, rightXOffset, yOffset + 15);
    pdf.text(`Email: ${companyInfo.email}`, rightXOffset, yOffset + 20);

    yOffset += 40;
    pdf.setFontSize(12);
    pdf.text('Angebot', 10, yOffset);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Angebotsnummer: ${offerNumber || '[Angebotsnummer]'}`, 10, yOffset + 6);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Datum: ${offerDate}`, 10, yOffset + 12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Projekt: ${projectName || '[Projektname]'}`, 10, yOffset + 18);
    pdf.setFont('helvetica', 'normal');

    yOffset += 25;
    pdf.setFontSize(10);
    pdf.text(`Sehr geehrte${recipient.gender === 'Herr' ? 'r' : ''} ${recipient.gender} ${recipient.name || '[Kundenname]'},`, 10, yOffset);
    yOffset += 5;
    pdf.text('vielen Dank für Ihre Anfrage. Wir unterbreiten Ihnen hiermit folgendes Angebot:', 10, yOffset);
    yOffset += 10;

    pdf.text('Bezeichnung', 10, yOffset);
    pdf.text('Menge', 80, yOffset);
    pdf.text('Einzelpreis (€) ', 120, yOffset);
    pdf.text('Gesamt (€) ', 160, yOffset);
    yOffset += 6;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(10, yOffset, 200, yOffset);
    yOffset += 4;

    let runningSubtotal = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type === 'category') {
        if (i > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Zwischensumme: € ${runningSubtotal.toFixed(2)}`, 160, yOffset);
          yOffset += 10;
          addPageIfNeeded();
        }
        runningSubtotal = 0;
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.description || '[Kategorie]', 10, yOffset);
        pdf.setFont('helvetica', 'normal');
        yOffset += 8;
        addPageIfNeeded();
      } else {
        const descriptionLines = pdf.splitTextToSize(item.description || '[Beschreibung]', 70);
        const lineHeight = 6;
        descriptionLines.forEach((line, lineIndex) => {
          addPageIfNeeded();
          pdf.text(line, 10, yOffset + lineIndex * lineHeight);
        });
        const descriptionHeight = descriptionLines.length * lineHeight;

        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        runningSubtotal += quantity * price;

        pdf.text(`${quantity}`, 80, yOffset);
        pdf.text(`€ ${price.toFixed(2)}`, 120, yOffset);
        pdf.text(`€ ${(quantity * price).toFixed(2)}`, 160, yOffset);

        yOffset += descriptionHeight + 4;
      }
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text(`Zwischensumme: € ${runningSubtotal.toFixed(2)}`, 160, yOffset);
    yOffset += 10;

    pdf.setFontSize(12);
    pdf.text(`Angebotsbetrag: € ${calculateTotal()}`, 130, yOffset);

    yOffset += 15;
    pdf.setFontSize(10);
    pdf.text('Das Angebot ist bis zu 14 Tage gültig.', 10, yOffset);

    renderFooter(pdf);
  };

  useEffect(() => {
    generatePDF();
  }, [items, recipient, offerNumber, projectName, offerDate, logo]);

  const handleSettingsChange = (field, value) => {
    setCompanyInfo(prevState => ({ ...prevState, [field]: value }));
  };

  if (!isOfferMode) {
    return <InvoiceGenerator />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ padding: '20px', backgroundColor: '#2c2c2c', borderRadius: '8px', color: 'white' }}>
        <Box display="flex" justifyContent="flex-end">
          <Button variant="outlined" color="primary" startIcon={<SwapHoriz />} onClick={toggleMode}>
            Wechsel zu Rechnung
          </Button>
        </Box>

        <Typography variant="h4" align="center" gutterBottom color="primary">
          Angebotsgenerator
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Button variant="outlined" color="primary" onClick={() => setSettingsOpen(true)}>
            Einstellungen
          </Button>

          <Box>
            <Button variant="outlined" component="label" color="primary">
              Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
            </Button>
          </Box>

          {logo && (
            <Box component="img" src={logo} alt="Company Logo" sx={{ maxHeight: '50px', marginLeft: 'auto' }} />
          )}
        </Box>

        <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              padding: 4,
              boxShadow: 24,
              borderRadius: 1,
              color: 'black',
              maxHeight: '80vh',
              overflowY: 'auto',
              width: '90%',
              maxWidth: '500px',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white' }}>
              Änderungen sind nur temporär!
            </Typography>
            <TextField
              label="Firmenname"
              fullWidth
              margin="normal"
              value={companyInfo.name}
              onChange={(e) => handleSettingsChange('name', e.target.value)}
            />
            <TextField
              label="Inhaber"
              fullWidth
              margin="normal"
              value={companyInfo.owner}
              onChange={(e) => handleSettingsChange('owner', e.target.value)}
            />
            <TextField
              label="Adresse"
              fullWidth
              margin="normal"
              value={companyInfo.address}
              onChange={(e) => handleSettingsChange('address', e.target.value)}
            />
            <TextField
              label="Telefonnummer"
              fullWidth
              margin="normal"
              value={companyInfo.phone}
              onChange={(e) => handleSettingsChange('phone', e.target.value)}
            />
            <TextField
              label="E-Mail"
              fullWidth
              margin="normal"
              value={companyInfo.email}
              onChange={(e) => handleSettingsChange('email', e.target.value)}
            />
            <TextField
              label="Steuernummer"
              fullWidth
              margin="normal"
              value={companyInfo.taxNumber}
              onChange={(e) => handleSettingsChange('taxNumber', e.target.value)}
            />
            <TextField
              label="Finanzamt"
              fullWidth
              margin="normal"
              value={companyInfo.taxOffice}
              onChange={(e) => handleSettingsChange('taxOffice', e.target.value)}
            />
            <TextField
              label="Bankname"
              fullWidth
              margin="normal"
              value={companyInfo.bankName}
              onChange={(e) => handleSettingsChange('bankName', e.target.value)}
            />
            <TextField
              label="IBAN"
              fullWidth
              margin="normal"
              value={companyInfo.iban}
              onChange={(e) => handleSettingsChange('iban', e.target.value)}
            />
            <TextField
              label="BIC"
              fullWidth
              margin="normal"
              value={companyInfo.bic}
              onChange={(e) => handleSettingsChange('bic', e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={() => setSettingsOpen(false)} sx={{ mt: 2 }}>
              Speichern
            </Button>
          </Box>
        </Modal>

        <Box display="flex" justifyContent="space-between" gap={2} mb={4}>
          <Box flex={1}>
            <Typography variant="h6" gutterBottom color="primary">
              Angebotsinformationen
            </Typography>
            <TextField
              select
              label="Geschlecht"
              value={recipient.gender}
              onChange={(e) => setRecipient({ ...recipient, gender: e.target.value })}
              fullWidth
              margin="normal"
            >
              <MenuItem value="Herr">Herr</MenuItem>
              <MenuItem value="Frau">Frau</MenuItem>
            </TextField>
            <TextField
              label="Kundenname"
              variant="outlined"
              fullWidth
              margin="normal"
              value={recipient.name}
              onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
            />
            <TextField
              label="Kundenadresse"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={recipient.address}
              onChange={(e) => setRecipient({ ...recipient, address: e.target.value })}
            />
          </Box>
        </Box>

        <Box display="flex" gap={2} mb={4}>
          <TextField
            label="Angebotsnummer"
            variant="outlined"
            fullWidth
            value={offerNumber}
            onChange={(e) => setOfferNumber(e.target.value)}
          />
          <TextField
            label="Projektname"
            variant="outlined"
            fullWidth
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <TextField
            label="Angebotsdatum"
            variant="outlined"
            fullWidth
            type="date"
            value={offerDate}
            onChange={(e) => setOfferDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Typography variant="h6" gutterBottom color="primary">
          Positionen
        </Typography>
        {items.map((item, index) => (
          <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
            {item.type === 'category' ? (
              <TextField
                label="Kategorie"
                variant="outlined"
                fullWidth
                value={item.description}
                onChange={(e) => handleChange(e, index, 'description')}
              />
            ) : (
              <>
                <TextField
                  label="Beschreibung"
                  variant="outlined"
                  fullWidth
                  value={item.description}
                  onChange={(e) => handleChange(e, index, 'description')}
                />
                <TextField
                  label="Anzahl"
                  variant="outlined"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleChange(e, index, 'quantity')}
                  sx={{ width: '100px' }}
                />
                <TextField
                  label="Preis"
                  variant="outlined"
                  type="number"
                  value={item.price}
                  onChange={(e) => handleChange(e, index, 'price')}
                  sx={{ width: '100px' }}
                />
              </>
            )}
            <Button variant="outlined" color="secondary" onClick={() => handleRemoveItem(index)}>
              <DeleteIcon />
            </Button>
          </Box>
        ))}
        <Box display="flex" gap={2} mb={3}>
          <Button variant="contained" color="primary" onClick={handleAddItem}>
            Position hinzufügen
          </Button>
          <Button variant="contained" color="primary" onClick={handleAddCategory}>
            Kategorie hinzufügen
          </Button>
        </Box>

        <Typography variant="h6" align="right" color="primary" sx={{ fontWeight: 'bold' }}>
          Angebotsbetrag: €{calculateTotal()}
        </Typography>

        <Button variant="contained" color="primary" onClick={generatePDF} sx={{ mt: 2 }}>
          PDF Exportieren
        </Button>

        {pdfPreviewUrl && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom color="primary">
              PDF-Vorschau
            </Typography>
            <iframe src={pdfPreviewUrl} width="100%" height="500px" style={{ border: 'none' }} />
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default OfferGenerator;
