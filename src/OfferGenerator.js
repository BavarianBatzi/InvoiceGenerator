import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, CssBaseline, ThemeProvider, createTheme, MenuItem, Modal } from '@mui/material';
import jsPDF from 'jspdf';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#2c2c2c',
    },
    primary: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

function OfferGenerator() {
  const [logo, setLogo] = useState(null);
  const [recipient, setRecipient] = useState({ gender: 'Herr', name: '', address: '' });
  const [items, setItems] = useState([{ type: 'category', description: '' }, { type: 'item', description: '', quantity: 1, price: 0 }]); // Initial empty category
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

  const handleChange = (e, index, field) => {
    const updatedItems = [...items];
    updatedItems[index][field] = e.target.value;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { type: 'item', description: '', quantity: 1, price: 0 }]);
  };

  const handleAddCategory = () => {
    setItems([...items, { type: 'category', description: '' }]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const calculateSubtotal = (startIndex) => {
    let subtotal = 0;
    for (let i = startIndex; i < items.length; i++) {
      if (items[i].type === 'category') break;
      if (items[i].type === 'item') {
        const quantity = parseFloat(items[i].quantity) || 0;
        const price = parseFloat(items[i].price) || 0;
        subtotal += quantity * price;
      }
    }
    return subtotal.toFixed(2);
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

  const exportPDF = () => {
    const pdf = new jsPDF();
    let yOffset = 10;

    // Add Logo (if present)
    if (logo) {
      const img = new Image();
      img.src = logo;
      const aspectRatio = img.width / img.height;
      const imgWidth = 100;
      const imgHeight = imgWidth / aspectRatio;
      const pageWidth = pdf.internal.pageSize.getWidth(); // Get page width
      const centerX = (pageWidth - imgWidth) / 2; // Calculate center position for the x-coordinate

      pdf.addImage(img.src, 'PNG', centerX, yOffset, imgWidth, imgHeight); // Center the image
      yOffset += imgHeight + 10;

      generatePDFContent(pdf, yOffset);
    } else {
      generatePDFContent(pdf, yOffset);
    }
  };

  const generatePDFContent = (pdf, yOffset) => {
    const pageHeight = pdf.internal.pageSize.getHeight(); // Höhe der Seite ermitteln
    const bottomMargin = 30; // Rand nach unten, um das Überlappen mit dem Footer zu vermeiden
  
    const addPageIfNeeded = () => {
      if (yOffset >= pageHeight - bottomMargin) {
        renderFooter(pdf); // Footer rendern, bevor eine neue Seite hinzugefügt wird
        pdf.addPage();
        yOffset = 10; // yOffset für die neue Seite zurücksetzen
        renderHeader(); // Optional: Header für die neue Seite rendern
        // Schriftgröße und Stil zurücksetzen
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
      }
    };
  
    const renderFooter = (pdf) => {
      const footerYOffset = pageHeight - 25; // Footer um 5 Einheiten nach oben verschieben
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
      // yOffset ggf. anpassen, falls ein Header verwendet wird
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
    pdf.text('Einzelpreis (€)', 120, yOffset);
    pdf.text('Gesamt (€)', 160, yOffset);
    yOffset += 6;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(10, yOffset, 200, yOffset);
    yOffset += 4;
  
    let runningSubtotal = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type === 'category') {
        // Render subtotal for previous items before starting a new category
        if (i > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Zwischensumme: €${runningSubtotal.toFixed(2)}`, 160, yOffset); // Kein align: 'right'
          yOffset += 10;
          addPageIfNeeded(); // Ensure no page break within category block
        }
        runningSubtotal = 0; // Reset subtotal for new category
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.description || '[Kategorie]', 10, yOffset);
        pdf.setFont('helvetica', 'normal');
        yOffset += 8; // Add extra space for category header
        addPageIfNeeded(); // Check for page break after rendering a category header
      } else {
        // Render regular item
        const descriptionLines = pdf.splitTextToSize(item.description || '[Beschreibung]', 70); // Wrap text to fit within 70 units width
        const lineHeight = 6;
        descriptionLines.forEach((line, lineIndex) => {
          addPageIfNeeded(); // Check for page break for each line of text
          pdf.text(line, 10, yOffset + lineIndex * lineHeight);
        });
        const descriptionHeight = descriptionLines.length * lineHeight;
  
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        runningSubtotal += quantity * price;
  
        // Print other columns aligned with the first line of the description
        pdf.text(`${quantity}`, 80, yOffset);
        pdf.text(`€${price.toFixed(2)}`, 120, yOffset);
        pdf.text(`€${(quantity * price).toFixed(2)}`, 160, yOffset);
  
        // Adjust yOffset for the next item
        yOffset += descriptionHeight + 4;
      }
    }
  
    // Add final subtotal
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Zwischensumme: €${runningSubtotal.toFixed(2)}`, 160, yOffset);
    yOffset += 10;
  
    // Add final total
    pdf.setFontSize(12);
    pdf.text(`Angebotsbetrag: €${calculateTotal()}`, 130, yOffset);
  
    yOffset += 15;
    pdf.setFontSize(10);
    pdf.text('Das Angebot ist bis zu 14 Tage gültig.', 10, yOffset);
  
    renderFooter(pdf); // Render footer on the final page
    pdf.save('angebot.pdf'); // Save the generated PDF file
  };
  
  

  const handleSettingsChange = (field, value) => {
    setCompanyInfo(prevState => ({ ...prevState, [field]: value }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ padding: '20px', backgroundColor: '#2c2c2c', borderRadius: '8px', color: 'white' }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Angebotsgenerator
        </Typography>
        <Button variant="outlined" color="primary" onClick={() => setSettingsOpen(true)} sx={{ mb: 2 }}>
          Einstellungen
        </Button>

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
  
          <Box textAlign="center" mb={2}>
            <Button variant="outlined" component="label" color="primary">
              Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
            </Button>
            {logo && <Box component="img" src={logo} alt="Company Logo" sx={{ maxHeight: '100px', mt: 2 }} />}
          </Box>
  
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
                Löschen
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
  
          <Button variant="contained" color="primary" onClick={exportPDF} sx={{ mt: 2 }}>
            PDF Exportieren
          </Button>
        </Container>
      </ThemeProvider>
    );
  }
  
  export default OfferGenerator;
  
