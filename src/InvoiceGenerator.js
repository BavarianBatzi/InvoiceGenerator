import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, CssBaseline, ThemeProvider, createTheme, MenuItem } from '@mui/material';
import jsPDF from 'jspdf';

// Custom Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#2c2c2c', // Anthrazit
    },
    primary: {
      main: '#4caf50', // Grün für Buttons
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

function InvoiceGenerator() {
  const [logo, setLogo] = useState(null);
  const [recipient, setRecipient] = useState({ gender: 'Herr', name: '', address: '' });
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [projectName, setProjectName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]); // Today's date as default

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

    // Add Logo (if present)
    if (logo) {
      const img = new Image();
      img.src = logo;
      const aspectRatio = img.width / img.height;
      const imgWidth = 50; // Adjust width as needed
      const imgHeight = imgWidth / aspectRatio;
      pdf.addImage(img.src, 'PNG', 80, yOffset, imgWidth, imgHeight); // Centered horizontally
      yOffset += imgHeight + 10;

      // Continue with the rest of the PDF content after logo has loaded
      generatePDFContent(pdf, yOffset);
    } else {
      // Continue with PDF generation if no logo is provided
      generatePDFContent(pdf, yOffset);
    }
  };

  const generatePDFContent = (pdf, yOffset) => {
    // Add Header (Company Information)
    pdf.setFontSize(12);
    pdf.text('Kundeninformationen', 10, yOffset);
    pdf.setFontSize(10);
    pdf.text(`${recipient.gender}`, 10, yOffset + 5);
    pdf.text(recipient.name || '[Kundenname]', 10, yOffset + 10);
    pdf.text(recipient.address || '[Kundenadresse]', 10, yOffset + 15);

    const rightXOffset = 130;
    pdf.setFontSize(14);
    pdf.text('Schröcker Fliesenverlegung', rightXOffset, yOffset);
    pdf.setFontSize(10);
    pdf.text('Inh. Marco Schröcker', rightXOffset, yOffset + 5);
    pdf.text('Lohholz 8', rightXOffset, yOffset + 10);
    pdf.text('84106 Volkenschwand', rightXOffset, yOffset + 15);
    pdf.text('Tel.: 0162/6853772', rightXOffset, yOffset + 20);
    pdf.text('Email: jmmarco1994@gmail.com', rightXOffset, yOffset + 25);

    // Invoice Details
    yOffset += 40;
    pdf.setFontSize(12);
    pdf.text('Rechnung', 10, yOffset);
    pdf.setFontSize(10);
    pdf.text(`Rechnungsnummer: ${invoiceNumber || '[Rechnungsnummer]'}`, 10, yOffset + 6);
    pdf.text(`Datum: ${invoiceDate}`, 10, yOffset + 12);
    pdf.text(`Projekt: ${projectName || '[Projektname]'}`, 10, yOffset + 18);

    // Table Header
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

    // Table Content (Items)
    items.forEach((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      pdf.text(item.description || '[Beschreibung]', 10, yOffset);
      pdf.text(`${quantity}`, 80, yOffset);
      pdf.text(`€${price.toFixed(2)}`, 120, yOffset);
      pdf.text(`€${(quantity * price).toFixed(2)}`, 160, yOffset);
      yOffset += 6;
    });

    // Add Total
    yOffset += 10;
    pdf.setFontSize(12);
    pdf.text(`Gesamtbetrag: €${calculateTotal()}`, 160, yOffset, { align: 'right' });

    // Payment and Tax Notice
    yOffset += 15;
    pdf.setFontSize(10);
    pdf.text('Der Gesamtbetrag ist ab Erhalt der Rechnung zahlbar innerhalb von 7 Tagen ohne Abzug.', 10, yOffset);
    yOffset += 5;
    pdf.text('Es wird gemäß §19 Abs. 1 Umsatzsteuergesetz keine Umsatzsteuer erhoben.', 10, yOffset);

    // Footer with 4 Columns
    yOffset = 270;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(10, yOffset, 200, yOffset); // Line to separate footer

    // Column 1 - Company Info
    pdf.setFontSize(8);
    pdf.text('Firmeninformationen:', 10, yOffset + 10);
    pdf.text('Fliesenverlegung Marco Schröcker', 10, yOffset + 15);
    pdf.text('Lohholz 8, 84106 Volkenschwand', 10, yOffset + 20);
    pdf.text('Mobil: 0162-6853772', 10, yOffset + 25);
    pdf.text('E-Mail: jmmarco1994@gmail.com', 10, yOffset + 30);

    // Column 2 - Tax Information
    pdf.text('Steuerdaten:', 60, yOffset + 10);
    pdf.text('Steuer-Nr.: 12627120549', 60, yOffset + 15);
    pdf.text('Finanzamt Kelheim', 60, yOffset + 20);

    // Column 3 - Bank Details
    pdf.text('Bankverbindung:', 95, yOffset + 10);
    pdf.text('Raiffeisenbank Hallertau eG', 95, yOffset + 15);
    pdf.text('IBAN: DE 43 7016 9693 0100 8170 23', 95, yOffset + 20);
    pdf.text('BIC: GENODEF1RHT', 95, yOffset + 25);

    // Column 4 - Contact Information
    pdf.text('Kontakt:', 150, yOffset + 10);
    pdf.text('E-Mail: jmmarco1994@gmail.com', 150, yOffset + 15);
    pdf.text('Tel.: 0162-6853772', 150, yOffset + 20);

    // Save PDF
    pdf.save('rechnung.pdf');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="md"
        sx={{
          padding: '20px',
          backgroundColor: '#2c2c2c',
          borderRadius: '8px',
          color: 'white',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Rechnungsgenerator
        </Typography>
        <Box textAlign="center" mb={2}>
          <Button variant="outlined" component="label" color="primary">
            Upload Logo
            <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
          </Button>
          {logo && (
            <Box
              component="img"
              src={logo}
              alt="Company Logo"
              sx={{ maxHeight: '100px', mt: 2 }}
            />
          )}
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

export default InvoiceGenerator;
