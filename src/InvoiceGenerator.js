import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, CssBaseline, ThemeProvider, createTheme, MenuItem, Modal, IconButton } from '@mui/material';
import jsPDF from 'jspdf';
import OfferGenerator from './OfferGenerator'; // Import OfferGenerator component
import { SwapHoriz } from '@mui/icons-material';

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

function App() {
  const [isInvoiceMode, setIsInvoiceMode] = useState(true);

  const toggleMode = () => {
    setIsInvoiceMode(!isInvoiceMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ padding: '20px', backgroundColor: '#2c2c2c', borderRadius: '8px', color: 'white' }}>
        <Box display="flex" justifyContent="flex-end">
          <IconButton color="primary" onClick={toggleMode}>
            <SwapHoriz />
            {isInvoiceMode ? 'Wechsel zu Angebot' : 'Wechsel zu Rechnung'}
          </IconButton>
        </Box>
        {isInvoiceMode ? <InvoiceGenerator /> : <OfferGenerator />}
      </Container>
    </ThemeProvider>
  );
}

function InvoiceGenerator() {
  const [logo, setLogo] = useState(null);
  const [recipient, setRecipient] = useState({ gender: 'Herr', name: '', address: '' });
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [projectName, setProjectName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
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
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return total + quantity * price;
    }, 0).toFixed(2);
  };

  const exportPDF = () => {
    const pdf = new jsPDF();
    let yOffset = 10;

    if (logo) {
      const img = new Image();
      img.src = logo;
      const aspectRatio = img.width / img.height;
      const imgWidth = 100; // Fixed image width
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
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text('Kundeninformationen', 10, yOffset);
    pdf.setFontSize(10);
    pdf.text(`${recipient.gender}`, 10, yOffset + 5);
    pdf.text(recipient.name || '[Kundenname]', 10, yOffset + 10);
    pdf.text(recipient.address || '[Kundenadresse]', 10, yOffset + 15);
  
    const rightXOffset = 130;
    pdf.setFontSize(12);
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
    pdf.text('Rechnung', 10, yOffset);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Rechnungsnummer: ${invoiceNumber || '[Rechnungsnummer]'}`, 10, yOffset + 6);
    pdf.setFont('helvetica', 'normal');
  
    pdf.text(`Datum: ${invoiceDate}`, 10, yOffset + 12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Projekt: ${projectName || '[Projektname]'}`, 10, yOffset + 18);
    pdf.setFont('helvetica', 'normal');
  
    yOffset += 25;
    pdf.setFontSize(10);
    pdf.text('Bezeichnung', 10, yOffset);
    pdf.text('Menge', 80, yOffset);
    pdf.text('Einzelpreis (€)', 120, yOffset);
    pdf.text('Gesamt (€)', 160, yOffset);
    yOffset += 6;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(10, yOffset, 200, yOffset);
    yOffset += 4;
  
    items.forEach((item) => {
      const descriptionLines = pdf.splitTextToSize(item.description || '[Beschreibung]', 70); // Wrap text to fit within 70 units width
      const lineHeight = 6;
      descriptionLines.forEach((line, i) => {
        pdf.text(line, 10, yOffset + i * lineHeight);
      });
      const descriptionHeight = descriptionLines.length * lineHeight;
  
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
  
      // Print other columns aligned with the first line of the description
      pdf.text(`${quantity}`, 80, yOffset);
      pdf.text(`€${price.toFixed(2)}`, 120, yOffset);
      pdf.text(`€${(quantity * price).toFixed(2)}`, 160, yOffset);
  
      // Adjust yOffset for the next item
      yOffset += descriptionHeight + 4;
    });
  
    yOffset += 10;
    pdf.setFontSize(12);
    pdf.text(`Gesamtbetrag: €${calculateTotal()}`, 160, yOffset, { align: 'right' });
  
    yOffset += 15;
    pdf.setFontSize(10);
    pdf.text('Der Gesamtbetrag ist ab Erhalt der Rechnung zahlbar innerhalb von 7 Tagen ohne Abzug.', 10, yOffset);
    yOffset += 15;
    pdf.setFontSize(8);
    pdf.text('Es wird gemäß §19 Abs. 1 Umsatzsteuergesetz keine Umsatzsteuer erhoben.', 10, yOffset);
    yOffset += 5;
    pdf.text('Wenn nicht anders angegeben entsprcht das Leistungsdatum dem Rechnungsdatum.', 10, yOffset);
  
    yOffset = 260;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(10, yOffset, 200, yOffset);
  
    pdf.setFontSize(8);
    pdf.text('Firmeninformationen:', 10, yOffset + 10);
    pdf.text(companyInfo.name, 10, yOffset + 15);
    pdf.text(companyInfo.address, 10, yOffset + 20);
    pdf.text(`Mobil: ${companyInfo.phone}`, 10, yOffset + 25);
    pdf.text(`E-Mail: ${companyInfo.email}`, 10, yOffset + 30);
  
    pdf.text('Steuerdaten:', 60, yOffset + 10);
    pdf.text(`Steuer-Nr.: ${companyInfo.taxNumber}`, 60, yOffset + 15);
    pdf.text(`Finanzamt: ${companyInfo.taxOffice}`, 60, yOffset + 20);
  
    pdf.text('Bankverbindung:', 100, yOffset + 10);
    pdf.text(companyInfo.bankName, 100, yOffset + 15);
    pdf.text(`IBAN: ${companyInfo.iban}`, 100, yOffset + 20);
    pdf.text(`BIC: ${companyInfo.bic}`, 100, yOffset + 25);
  
    pdf.text('Kontakt:', 155, yOffset + 10);
    pdf.text(`E-Mail: ${companyInfo.email}`, 155, yOffset + 15);
    pdf.text(`Tel.: ${companyInfo.phone}`, 155, yOffset + 20);
  
    pdf.save('rechnung.pdf');
  };
  

  const handleSettingsChange = (field, value) => {
    setCompanyInfo(prevState => ({ ...prevState, [field]: value }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ padding: '20px', backgroundColor: '#2c2c2c', borderRadius: '8px', color: 'white' }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Rechnungsgenerator
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
              Rechnungsinformationen
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
            label="Rechnungsnummer"
            variant="outlined"
            fullWidth
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
          <TextField
            label="Projektname"
            variant="outlined"
            fullWidth
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <TextField
            label="Rechnungsdatum"
            variant="outlined"
            fullWidth
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Typography variant="h6" gutterBottom color="primary">
          Positionen
        </Typography>
        {items.map((item, index) => (
          <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
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
            <Button variant="outlined" color="secondary" onClick={() => handleRemoveItem(index)}>
              Löschen
            </Button>
          </Box>
        ))}
        <Button variant="contained" color="primary" onClick={handleAddItem} sx={{ mb: 3 }}>
          Position hinzufügen
        </Button>

        <Typography variant="h6" align="right" color="primary" sx={{ fontWeight: 'bold' }}>
          Total: €{calculateTotal()}
        </Typography>

        <Button variant="contained" color="primary" onClick={exportPDF} sx={{ mt: 2 }}>
          PDF Exportieren
        </Button>
      </Container>
    </ThemeProvider>
  );
}

export default App;
