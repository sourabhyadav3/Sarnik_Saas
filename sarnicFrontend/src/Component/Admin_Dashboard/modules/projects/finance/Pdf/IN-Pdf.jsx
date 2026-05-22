import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import axiosInstance from "../../../../../../api/axiosInstance";

// Currency configurations
const currencies = [
  { label: "USD - US Dollars", value: "USD", symbol: "$", name: "US Dollars", minor: "Cents", minorFraction: 100 },
  { label: "EUR - Euro", value: "EUR", symbol: "€", name: "Euro", minor: "Cents", minorFraction: 100 },
  { label: "INR - Indian Rupees", value: "INR", symbol: "₹", name: "Indian Rupees", minor: "Paise", minorFraction: 100 },
  { label: "GBP - British Pound", value: "GBP", symbol: "£", name: "British Pound", minor: "Pence", minorFraction: 100 },
  { label: "JPY - Japanese Yen", value: "JPY", symbol: "¥", name: "Japanese Yen", minor: "Sen", minorFraction: 100 },
  { label: "AED - UAE Dirhams", value: "AED", symbol: "د.إ", name: "UAE Dirhams", minor: "Fils", minorFraction: 100 },
  { label: "SAR - Saudi Riyal", value: "SAR", symbol: "﷼", name: "Saudi Riyal", minor: "Halalas", minorFraction: 100 },
];

// Get currency details by value
const getCurrencyDetails = (currencyValue) => {
  return currencies.find(currency => currency.value === currencyValue) || currencies[0];
};

// Currency units for number to words conversion
const currencyUnits = {
  INR: { major: "Rupees", minor: "Paise" },
  USD: { major: "Dollars", minor: "Cents" },
  EUR: { major: "Euros", minor: "Cents" },
  GBP: { major: "Pounds", minor: "Pence" },
  AED: { major: "Dirhams", minor: "Fils" },
  SAR: { major: "Riyals", minor: "Halalas" },
  JPY: { major: "Yen", minor: "Sen" }
};

// Helper function to convert numbers to words
function numberToWords(num) {
  if (num === 0) return "Zero";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  function convertLessThanThousand(n) {
    if (n === 0) return "";
    else if (n < 10) return ones[n];
    else if (n < 20) return teens[n - 10];
    else if (n < 100) {
      const tenPart = tens[Math.floor(n / 10)];
      const onePart = n % 10 !== 0 ? "-" + ones[n % 10] : "";
      return tenPart + onePart;
    }
    else {
      const hundredPart = ones[Math.floor(n / 100)] + " Hundred";
      const remainder = n % 100;
      const andPart = remainder !== 0 ? " " + convertLessThanThousand(remainder) : "";
      return hundredPart + andPart;
    }
  }

  let result = "";
  let scale = 0;
  const scales = ["", "Thousand", "Million", "Billion", "Trillion"];

  while (num > 0) {
    const chunk = num % 1000;
    num = Math.floor(num / 1000);

    if (chunk !== 0) {
      const chunkWords = convertLessThanThousand(chunk);
      result = chunkWords + (chunkWords && scales[scale] ? " " + scales[scale] : "") + (result ? " " + result : "");
    }
    scale++;
  }

  return result;
}

// Function to convert amount to words
function convertAmountToWords(amount, currency = "INR") {
  const { major, minor } = currencyUnits[currency] || currencyUnits["INR"];

  const whole = Math.floor(amount);
  const fraction = Math.round((amount - whole) * 100);

  let words = "";

  if (whole > 0) {
    words = numberToWords(whole);
  }

  if (fraction > 0) {
    if (words) {
      words += " and " + numberToWords(fraction);
    } else {
      words = numberToWords(fraction);
    }
  }

  // Format: MajorCurrency AmountInWords and MinorAmount MinorCurrency Only
  let result = "";
  
  if (whole > 0 && fraction > 0) {
    result = `${major} ${words} and ${numberToWords(fraction)} ${minor} Only`;
  } else if (whole > 0) {
    result = `${major} ${words} Only`;
  } else if (fraction > 0) {
    result = `${numberToWords(fraction)} ${minor} Only`;
  }

  return result;
}


// Function to convert number to words based on currency (updated to use new format)
const numberToWordsWithCurrency = (value, currencyCode = 'USD') => {
  const curr = getCurrencyDetails(currencyCode);
  const dollars = Math.floor(value);
  const cents = Math.round((value - dollars) * curr.minorFraction);
  
  // Get the currency units
  const { major, minor } = currencyUnits[currencyCode] || currencyUnits["USD"];
  
  // Add "US" prefix for USD currency
  const currencyName = currencyCode === 'USD' ? `US ${major}` : major;
  
  // Convert to words using the new format
  let result = "";
  
  if (dollars > 0 && cents > 0) {
    result = `${currencyName} ${numberToWords(dollars)} and ${numberToWords(cents)} ${minor} Only`;
  } else if (dollars > 0) {
    result = `${currencyName} ${numberToWords(dollars)} Only`;
  } else if (cents > 0) {
    result = `${numberToWords(cents)} ${minor} Only`;
  }
  
  return result;
};

// Helper function to fetch image and convert to base64
const getImageBase64 = async (url) => {
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading image:", error);
    return null;
  }
};

// Fetch invoice by ID from API
const fetchInvoiceById = async (invoiceId) => {
  try {
    const response = await axiosInstance.get(`/invoices/pdf/${invoiceId}`);
    console.log(response.data)
    if (response.data?.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
};

/**
 * Main function to generate invoice PDF
 * @param {number|string} invoiceId - Invoice ID
 */
export const generateInvoicePDF = async (invoiceId) => {
  try {
    // Show loading message
    Swal.fire({
      title: 'Generating Invoice PDF',
      text: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Fetch invoice data from the new API endpoint
    const invoiceData = await fetchInvoiceById(invoiceId);
    if (!invoiceData) {
      throw new Error("Invoice not found");
    }

    // Extract data from the API response structure
    const {
      invoice_no,
      invoice_date,
      ce_no,
      po_no,
      project_no,
      currency,
      company,
      client,
      bank,
      items,
      summary
    } = invoiceData;

    // Create PDF
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginLeft = 40;
    const contentWidth = pageWidth - marginLeft * 2;
    
    // Currency details for invoice
    const invoiceCurrency = currency || 'USD';
    const currencyDetails = getCurrencyDetails(invoiceCurrency);
    
    const toMoney = (n) => {
      return Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };
    
    // Add company logo/header
    let currentY = 40;
    if (company?.logo) {
      try {
        const logoBase64 = await getImageBase64(company.logo);
        const logoHeight = 55;
        const logoWidth = pageWidth - 80;
        doc.addImage(logoBase64, "PNG", 40, currentY, logoWidth, logoHeight);
        currentY += logoHeight + 20;
      } catch (e) {
        console.error("Error loading logo:", e);
        // Draw placeholder if logo fails to load
        doc.setFillColor(240, 240, 240);
        doc.rect(40, currentY, pageWidth - 80, 55, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(company?.name || "Sarnalk Pvt Ltd", pageWidth / 2, currentY + 27.5, { align: "center" });
        currentY += 55 + 20;
      }
    } else {
      // Draw placeholder if no logo
      doc.setFillColor(240, 240, 240);
      doc.rect(40, currentY, pageWidth - 80, 55, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(company?.name || "Sarnalk Pvt Ltd", pageWidth / 2, currentY + 27.5, { align: "center" });
      currentY += 55 + 20;
    }
    
    // Invoice title
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const vatRate = parseFloat(summary?.vat_rate || 0);
    const invoiceTitle = vatRate > 0 ? "Tax Invoice" : "Invoice";
    doc.text(invoiceTitle, pageWidth - marginLeft, currentY, { align: "right" });

    currentY += 15;
    
    // Calculate column widths for two-column layout
    const leftColumnWidth = contentWidth * 0.45;
    const rightColumnWidth = contentWidth * 0.45;
    const gapBetweenColumns = contentWidth * 0.1;
    
    // Format invoice date
    const invoiceDateObj = new Date(invoice_date || new Date());
    const formattedDate = `${invoiceDateObj.getDate().toString().padStart(2, "0")}/${(invoiceDateObj.getMonth() + 1).toString().padStart(2, "0")}/${invoiceDateObj.getFullYear()}`;
    
    // Create Invoice To table using API response data
autoTable(doc, {
  startY: currentY,
  head: [['Invoice To']],
  body: [
    [
      `${client?.name || 'Client Name'}\n\n` +          // small space after name
      `${client?.address?.replace(/\n/g, ', ') || 'Address not provided'}\n\n` + // small space after address
      `Phone: ${client?.phone || 'N/A'}\n\n`            // small space after phone
    ],
    [
      `TRN No : ${client?.tax_id || 'N/A'}`

      
    ]
  ],
  styles: {
    fontSize: 9,
    cellPadding: 6,
    halign: "left",
    valign: "top",
    textColor: [0, 0, 0],
    lineWidth: 0.5,
    lineColor: [200, 200, 200],
  },
  headStyles: {
    fillColor: [240, 240, 240],
    textColor: [0, 0, 0],
    fontStyle: "bold",
    fontSize: 10,
  },
  columnStyles: {
    0: { cellWidth: leftColumnWidth }
  },
  theme: "grid",
  margin: { left: marginLeft },
});



    
    const invoiceToTableHeight = doc.lastAutoTable.finalY - currentY;
    
    // Right side - Date and Invoice No table
    const rightColumnX = marginLeft + leftColumnWidth + gapBetweenColumns;
    
    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Invoice No.']],
      body: [[formattedDate, `${invoice_no}` || '0001']],
      styles: { 
        fontSize: 9,
        cellPadding: 6,
        lineColor: [200, 200, 200],
        textColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle"
      },
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9
      },
      columnStyles: { 
        0: { cellWidth: rightColumnWidth * 0.45 }, 
        1: { cellWidth: rightColumnWidth * 0.55 }
      },
      theme: 'grid',
      margin: { left: rightColumnX },
    });
    
    const dateTableEndY = doc.lastAutoTable.finalY;
    
    // Project details table using API response data
    autoTable(doc, {
      startY: dateTableEndY + 10,
      head: [["CE.No", "P.O. No.", "Project No."]],
      body: [[
        ce_no?.toString() || 'N/A',
        po_no || 'N/A',
        project_no?.toString() || 'N/A'
      ]],
      styles: { 
        fontSize: 9,
        cellPadding: 5,
        lineColor: [200, 200, 200],
        textColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle"
      },
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9,
        whiteSpace: "nowrap",
        overflow: "hidden"
      },
      columnStyles: { 
        0: { cellWidth: rightColumnWidth * 0.25 },
        1: { cellWidth: rightColumnWidth * 0.50 },
        2: { cellWidth: rightColumnWidth * 0.25 }
      },
      theme: 'grid',
      margin: { left: rightColumnX },
    });

    autoTable(doc, {
  startY: doc.lastAutoTable.finalY + 4,
  head: [['TRN No']],
  body: [[company?.trn || 'N/A']],
  styles: {
    fontSize: 9,
    cellPadding: 5,
    halign: "center",
    valign: "middle",
    textColor: [0, 0, 0],
    lineWidth: 0.5,
    lineColor: [200, 200, 200],
  },
  headStyles: {
    fillColor: [240, 240, 240],
    textColor: [0, 0, 0],
    fontStyle: "bold",
    fontSize: 9,
  },
  columnStyles: {
    0: { cellWidth: rightColumnWidth }
  },
  theme: "grid",
  margin: { left: rightColumnX },
});

    
    currentY = Math.max(currentY + invoiceToTableHeight, doc.lastAutoTable.finalY) + 15;
    
    // Bank details table using API response data
    autoTable(doc, {
      startY: currentY,
      head: [["Bank Account Name", "Bank Name", "IBAN", "Swift Code", "Terms"]],
      body: [[
        bank?.account_name || 'N/A',
        bank?.bank_name || 'N/A',
        bank?.iban || 'N/A',
        bank?.swift_code || 'N/A',
        'Net 30'
      ]],
      styles: { 
        fontSize: 9, 
        cellPadding: 5, 
        lineColor: [200, 200, 200], 
        textColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle"
      },
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: "bold",
        halign: "center"
      },
      columnStyles: { 
        0: { cellWidth: contentWidth * 0.2 }, 
        1: { cellWidth: contentWidth * 0.2 }, 
        2: { cellWidth: contentWidth * 0.2 }, 
        3: { cellWidth: contentWidth * 0.2 }, 
        4: { cellWidth: contentWidth * 0.2 }
      },
      theme: 'grid',
      margin: { left: marginLeft, right: marginLeft },
    });
    
    currentY = doc.lastAutoTable.finalY + 10;
    
    // Line items table
    const lineItems = Array.isArray(items) ? items : [];
    const subTotal = parseFloat(summary?.subtotal || 0);
    const vatRatePercent = parseFloat(summary?.vat_rate || 0);
    const vatAmt = parseFloat(summary?.vat_amount || 0);
    const grandTotal = parseFloat(summary?.total || 0);
    
    // Create table headers
    const head = [
      "Sr.", "Description", "Qty", "Rate", `Amount (${invoiceCurrency})`
    ];
    
    // Create table body with line items
    let body = lineItems.map((item, idx) => {
      return [
        { content: String(idx + 1), styles: { textColor: [0, 0, 0] } },
        { content: item.description || "", styles: { textColor: [0, 0, 0] } },
        { content: String(item.quantity || ""), styles: { textColor: [0, 0, 0] } },
        { content: toMoney(item.rate || 0), styles: { textColor: [0, 0, 0], halign: "center" } },
        { content: toMoney(item.amount || 0), styles: { textColor: [0, 0, 0] } }
      ];
    });
    
    // Add empty rows to maintain spacing (minimum 5 rows total)
    const minRows = 5;
    while (body.length < minRows) {
      body.push(["", "", "", "", ""]);
    }
    
    // Add totals in words row - using the new format
    const totalInWords = numberToWordsWithCurrency(grandTotal, invoiceCurrency);
    
    body.push(
      [
        {
          content: totalInWords,
          colSpan: 3,
          styles: {
            halign: "left", 
            fontStyle: "bold", 
            textColor: [0, 0, 0], 
            fontSize: 7,
            lineWidth: { top: 0.7, right: 0, bottom: 1.7, left: 0.3 },
            lineColor: [200, 200, 200],
          },
        },
        { 
          content: `Sub-Total (${invoiceCurrency})`, 
          styles: { 
            halign: "left",
            fontStyle: "normal",
            lineWidth: 0.5,
            lineColor: [200, 200, 200],
            textColor: [0, 0, 0],
          }
        },
        { 
          content: toMoney(subTotal), 
          styles: { 
            halign: "right",
            lineWidth: 0.5,
            lineColor: [200, 200, 200],
            textColor: [0, 0, 0],
          }
        },
      ]
    );
    
    // VAT row
    body.push([
      { content: "", colSpan: 3, styles: { fillColor: [255, 255, 255], lineWidth: 0 } },
      { 
        content: `VAT (${vatRatePercent}%) (${invoiceCurrency})`, 
        styles: { 
          halign: "left",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          textColor: [0, 0, 0],
        }
      },
      { 
        content: toMoney(vatAmt), 
        styles: { 
          halign: "right",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          textColor: [0, 0, 0],
        }
      }
    ]);
    
    // Total row
    body.push([
      { content: "", colSpan: 3, styles: { fillColor: [255, 255, 255], lineWidth: 0 } },
      { 
        content: `Total (${invoiceCurrency})`, 
        styles: { 
          halign: "left",
          fontStyle: "bold",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          textColor: [0, 0, 0],
        }
      },
      { 
        content: toMoney(grandTotal), 
        styles: { 
          halign: "right",
          fontStyle: "bold",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          textColor: [0, 0, 0],
        }
      }
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [head],
      body,
      styles: { 
        fontSize: 9, 
        cellPadding: 5, 
        lineColor: [200, 200, 200], 
        lineWidth: 0.5,
        halign: "center",
        valign: "middle"
      },
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: "bold",
        halign: "center"
      },
      columnStyles: { 
        0: { halign: "center", cellWidth: 36 }, 
        1: { halign: "left", cellWidth: contentWidth - 266 },
        2: { halign: "center", cellWidth: 50 }, 
        3: { halign: "right", cellWidth: 100 },
        4: { halign: "right", cellWidth: 80 }
      },
      theme: 'grid',
      margin: { left: marginLeft, right: marginLeft },
    });
    
    // Position signature section
    const signatureY = pageHeight - 100;
    
    // Company signature section on the left
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(company?.name || "Sarnalk Pvt Ltd", marginLeft, signatureY + 15);
      
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Accounts Department", marginLeft, signatureY + 30);
    
    // Add company stamp if available in API response
    if (company?.stamp) {
      try {
        const stampBase64 = await getImageBase64(company.stamp);
        const stampWidth = 140;
        const stampHeight = 100;
        doc.addImage(stampBase64, "PNG", marginLeft + 120, signatureY - 30, stampWidth, stampHeight);
      } catch (e) {
        console.error("Error loading stamp:", e);
      }
    } else {
      // Draw stamp placeholder box next to company info
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.rect(marginLeft + 180, signatureY - 70, 140, 100);
    }
    
    // Save PDF with custom filename
    const companyNameSafe = (company?.name || 'Company')
  .replace(/\s+/g, '_')
  .replace(/[^\w]/g, '');

// Save PDF with custom filename
// 提取客户名称的第一个词
const clientFirstName = client?.name 
  ? client.name.split(' ')[0]
  : 'Client';

// 提取项目名称的第一个词
const projectFirstName = invoiceData.project_name 
  ? invoiceData.project_name.split(' ')[0]
  : 'Project';

// 生成新格式的文件名：invoice_no_clientname_projectname_pono_ceno
const filename = `${invoice_no}_Invoice_${clientFirstName}_${projectFirstName}_${po_no}_${ce_no}.pdf`;
doc.save(filename);

    
    // Close loading
    Swal.close();

  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "PDF Generation Failed",
      text: error?.message || "Something went wrong while generating the PDF.",
    });
  }
};

// Alternative function for direct invoice data
export const generateInvoicePDFFromData = async (invoiceData, companyInfo, filename = 'invoice') => {
  try {
    // Create PDF
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginLeft = 40;
    const contentWidth = pageWidth - marginLeft * 2;
    
    const invoiceCurrency = invoiceData?.currency || 'USD';
    const currencyDetails = getCurrencyDetails(invoiceCurrency);
    
    const toMoney = (n) => {
      return Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };
    
    // Add company logo/header
    let currentY = 40;
    if (companyInfo?.logoUrl?.[0]) {
      try {
        const logoBase64 = await getImageBase64(companyInfo.logoUrl[0]);
        const logoHeight = 55;
        const logoWidth = pageWidth - 80;
        doc.addImage(logoBase64, "PNG", 40, currentY, logoWidth, logoHeight);
        currentY += logoHeight + 20;
      } catch (e) {
        console.error("Error loading logo:", e);
        // Draw placeholder if logo fails to load
        doc.setFillColor(240, 240, 240);
        doc.rect(40, currentY, pageWidth - 80, 55, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(companyInfo?.name || "Sarnalk Pvt Ltd", pageWidth / 2, currentY + 27.5, { align: "center" });
        currentY += 55 + 20;
      }
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(40, currentY, pageWidth - 80, 55, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(companyInfo?.name || "Sarnalk Pvt Ltd", pageWidth / 2, currentY + 27.5, { align: "center" });
      currentY += 55 + 20;
    }
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const vatRate = invoiceData?.CostEstimatesId?.VATRate || 0;
    const invoiceTitle = vatRate > 0 ? "Tax Invoice" : "Invoice";
    
    // FIXED: Align with table's right edge
    const infoX = pageWidth - marginLeft - 160;
    doc.text(invoiceTitle, infoX, currentY, { align: "right" });
    
    currentY += 15;
    
    const leftColumnWidth = contentWidth * 0.45;
    const rightColumnWidth = contentWidth * 0.45;
    const gapBetweenColumns = contentWidth * 0.1;
    
    const invoiceDate = invoiceData.date ? new Date(invoiceData.date) : new Date();
    const formattedDate = `${invoiceDate.getDate().toString().padStart(2, "0")}/${(invoiceDate.getMonth() + 1).toString().padStart(2, "0")}/${invoiceDate.getFullYear()}`;
    
    const clientName = invoiceData.clientId?.clientName || 'Client Name';
    const clientAddress = (invoiceData.clientId?.clientAddress || "Address not provided").replace(/\n/g, ", ");
    const clientEmail = invoiceData.clientId?.contactPersons?.[0]?.email || 'N/A';
    const clientTRN = invoiceData.clientId?.trnNo || 'N/A';
    
    autoTable(doc, {
      startY: currentY,
      head: [['Invoice To']],
      body: [
        [clientName],
        [clientAddress],
        [`Contact: ${clientEmail}`],
        [`TRN No: ${clientTRN}`]
      ],
      styles: { 
        fontSize: 9, 
        cellPadding: 5, 
        lineColor: [200, 200, 200], 
        textColor: [0, 0, 0], 
        lineWidth: 0.5,
        halign: "left",
        valign: "top"
      },
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: "bold",
        halign: "left",
        fontSize: 10
      },
      columnStyles: { 
        0: { cellWidth: leftColumnWidth }
      },
      theme: 'grid',
      didDrawCell: (data) => {
        if (data.section === 'body' && data.row.index < data.table.body.length - 1) {
          const { x, y, width, height } = data.cell;
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.5);
          doc.line(x, y + height, x + width, y + height);
        }
      },
      margin: { left: marginLeft },
    });
    
    const invoiceToTableHeight = doc.lastAutoTable.finalY - currentY;
    
    const rightColumnX = marginLeft + leftColumnWidth + gapBetweenColumns;
    
    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Invoice No.']],
      body: [[formattedDate, `INV-${invoiceData.invoice_no}` || '0002']],
      styles: { 
        fontSize: 9,
        cellPadding: 6,
        lineColor: [200, 200, 200],
        textColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle"
      },
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9
      },
      columnStyles: { 
        0: { cellWidth: rightColumnWidth * 0.45 }, 
        1: { cellWidth: rightColumnWidth * 0.55 }
      },
      theme: 'grid',
      margin: { left: rightColumnX },
    });
    
    const dateTableEndY = doc.lastAutoTable.finalY;
    
    const costEst = invoiceData?.CostEstimatesId?.estimateRef || 
                   invoiceData?.costEstimate?.estimateRef || 
                   'N/A';
    const poNo = invoiceData?.ReceivablePurchaseId?.PONumber || 
                 invoiceData?.receivablePurchase?.PONumber || 
                 'N/A';
    const projNo = invoiceData?.projectId?.[0]?.projectNo || 
                  invoiceData?.projects?.[0]?.projectNo || 
                  'N/A';
    
    autoTable(doc, {
      startY: dateTableEndY + 10,
      head: [["CE.No", "P.O. No.", "Project No."]],
      body: [[costEst, poNo, projNo]],
      styles: { 
        fontSize: 9,
        cellPadding: 5,
        lineColor: [200, 200, 200],
        textColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle"
      },
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9,
        whiteSpace: "nowrap",
        overflow: "hidden"
      },
      columnStyles: { 
        0: { cellWidth: rightColumnWidth * 0.25 },
        1: { cellWidth: rightColumnWidth * 0.50 },
        2: { cellWidth: rightColumnWidth * 0.25 }
      },
      theme: 'grid',
      margin: { left: rightColumnX },
    });
    
    currentY = Math.max(currentY + invoiceToTableHeight, doc.lastAutoTable.finalY) + 15;
    
    autoTable(doc, {
      startY: currentY,
      head: [["Bank Account Name", "Bank Name", "IBAN", "Swift Code", "Terms"]],
      body: [[
        companyInfo?.bankAccountName || 'N/A',
        companyInfo?.bankName || 'N/A',
        companyInfo?.iban || 'N/A',
        companyInfo?.swiftCode || 'N/A',
        'Net 30'
      ]],
      styles: { 
        fontSize: 9, 
        cellPadding: 5, 
        lineColor: [200, 200, 200], 
        textColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle"
      },
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: "bold",
        halign: "center"
      },
      columnStyles: { 
        0: { cellWidth: contentWidth * 0.2 }, 
        1: { cellWidth: contentWidth * 0.2 }, 
        2: { cellWidth: contentWidth * 0.2 }, 
        3: { cellWidth: contentWidth * 0.2 }, 
        4: { cellWidth: contentWidth * 0.2 }
      },
      theme: 'grid',
      margin: { left: marginLeft, right: marginLeft },
    });
    
    currentY = doc.lastAutoTable.finalY + 10;
    
    const lineItems = Array.isArray(invoiceData?.lineItems) ? invoiceData.lineItems : [];
    const subTotal = lineItems.reduce((s, it) => s + Number(it.amount || 0), 0);
    const vatRatePercent = Number(vatRate) || 0;
    const vatAmt = (subTotal * vatRatePercent) / 100;
    const grandTotal = subTotal + vatAmt;
    
    const head = [
      "Sr.", "Description", "Qty", "Rate", `Amount (${invoiceCurrency})`
    ];
    
    let body = lineItems.map((item, idx) => {
      return [
        { content: String(idx + 1), styles: { textColor: [0, 0, 0] } },
        { content: item.description || "", styles: { textColor: [0, 0, 0] } },
        { content: String(item.quantity || ""), styles: { textColor: [0, 0, 0] } },
        { content: toMoney(item.rate || 0), styles: { textColor: [0, 0, 0], halign: "center" } },
        { content: toMoney(item.amount || 0), styles: { textColor: [0, 0, 0] } }
      ];
    });
    
    const minRows = 5;
    while (body.length < minRows) {
      body.push(["", "", "", "", ""]);
    }
    
    // Use the new format for amount in words
    const totalInWords = numberToWordsWithCurrency(grandTotal, invoiceCurrency);
    
    body.push(
      [
        {
          content: totalInWords,
          colSpan: 3,
          styles: {
            halign: "left", 
            fontStyle: "bold", 
            textColor: [0, 0, 0], 
            fontSize: 7,
            lineWidth: { top: 0.7, right: 0, bottom: 1.7, left: 0.3 },
            lineColor: [200, 200, 200],
          },
        },
        { 
          content: `Sub-Total (${invoiceCurrency})`, 
          styles: { 
            halign: "left",
            fontStyle: "normal",
            lineWidth: 0.5,
            lineColor: [200, 200, 200],
            textColor: [0, 0, 0],
          }
        },
        { 
          content: toMoney(subTotal), 
          styles: { 
            halign: "right",
            lineWidth: 0.5,
            lineColor: [200, 200, 200],
            textColor: [0, 0, 0],
          }
        },
      ]
    );
    
    body.push([
      { content: "", colSpan: 3, styles: { fillColor: [255, 255, 255], lineWidth: 0 } },
      { 
        content: `VAT (${vatRatePercent}%) (${invoiceCurrency})`, 
        styles: { 
          halign: "left",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          textColor: [0, 0, 0],
        }
      },
      { 
        content: toMoney(vatAmt), 
        styles: { 
          halign: "right",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          textColor: [0, 0, 0],
        }
      }
    ]);
    
    body.push([
      { content: "", colSpan: 3, styles: { fillColor: [255, 255, 255], lineWidth: 0 } },
      { 
        content: `Total (${invoiceCurrency})`, 
        styles: { 
          halign: "left",
          fontStyle: "bold",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          textColor: [0, 0, 0],
        }
      },
      { 
        content: toMoney(grandTotal), 
        styles: { 
          halign: "right",
          fontStyle: "bold",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          textColor: [0, 0, 0],
        }
      }
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [head],
      body,
      styles: { 
        fontSize: 9, 
        cellPadding: 5, 
        lineColor: [200, 200, 200], 
        lineWidth: 0.5,
        halign: "center",
        valign: "middle"
      },
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: "bold",
        halign: "center"
      },
      columnStyles: { 
        0: { halign: "center", cellWidth: 36 }, 
        1: { halign: "left", cellWidth: contentWidth - 266 },
        2: { halign: "center", cellWidth: 50 }, 
        3: { halign: "right", cellWidth: 100 },
        4: { halign: "right", cellWidth: 80 }
      },
      theme: 'grid',
      margin: { left: marginLeft, right: marginLeft },
    });
    
    const signatureY = pageHeight - 100;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(companyInfo?.name || "Sarnalk Pvt Ltd", marginLeft, signatureY + 15);
      
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Accounts Department", marginLeft, signatureY + 30);
    
    if (companyInfo?.stampUrl?.[0]) {
      try {
        const stampBase64 = await getImageBase64(companyInfo.stampUrl[0]);
        const stampWidth = 140;
        const stampHeight = 100;
        doc.addImage(stampBase64, "PNG", marginLeft + 120, signatureY - 30, stampWidth, stampHeight);
      } catch (e) {
        console.error("Error loading stamp:", e);
      }
    } else {
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.rect(marginLeft + 180, signatureY - 70, 140, 100);
    }
    
    doc.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    Swal.fire({
      icon: "error",
      title: "PDF Generation Failed",  
      text: error?.message || "Something went wrong while generating the PDF.",
    });
  }
};

// Test function
export const testGeneratePDF = async () => {
  try {
    await generateInvoicePDF(1);
  } catch (error) {
    console.error("Test failed:", error);
  }
};

















