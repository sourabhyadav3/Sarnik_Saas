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

// Helper function to convert numbers to words (with proper capitalization and hyphenation)
function numberToWords(num) {
  if (num === 0) return "Zero";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  function convertLessThanThousand(n) {
    if (n === 0) return "";
    else if (n < 10) return ones[n];
    else if (n < 20) return teens[n - 10];
    else if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + ones[n % 10] : "");
    else
      return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "");
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


// Function to convert amount to words (with currency unit first)
function convertAmountToWords(amount, currency = "INR") {
  const { major, minor } = currencyUnits[currency] || currencyUnits["INR"];

  const whole = Math.floor(amount);
  const fraction = Math.round((amount - whole) * 100);

  let words = "";

  if (whole > 0) {
    // For USD, add "US" prefix before "Dollars"
    if (currency === "USD") {
      words = "US " + major + " " + numberToWords(whole);
    } else {
      words = major + " " + numberToWords(whole);
    }
  }

  if (fraction > 0) {
    if (words) {
      words += " and " + numberToWords(fraction) + " " + minor;
    } else {
      words = numberToWords(fraction) + " " + minor;
    }
  }

  return words + " Only";
}
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

// Fetch cost estimate by ID from API
const fetchCostEstimateData = async (estimateId) => {
  try {
    const response = await axiosInstance.get(`/costestimatePdf/${estimateId}`);

    if (response.data?.success) {
      return response.data.data;
    }
    throw new Error("No data from API");
  } catch (error) {
    console.error("Error fetching cost estimate PDF data:", error);
    throw error;
  }
};

/**
 * Main function to generate Cost Estimate PDF
 * @param {number|string} estimateId - Cost Estimate ID
 */
export const generateCostEstimatePDF = async (estimateId) => {
  try {
    // Show loading message
    Swal.fire({
      title: 'Generating Cost Estimate PDF',
      text: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Fetch cost estimate data from API
    const estimateData = await fetchCostEstimateData(estimateId);

    // Create PDF
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginLeft = 40;
    const contentWidth = pageWidth - marginLeft * 2;

    // Get currency from API response summary
    const estimateCurrency = estimateData.summary?.currency || "INR";
    const currencyDetails = getCurrencyDetails(estimateCurrency);
    const currencySymbol = currencyDetails.symbol;
    const currencyName = currencyDetails.name;

    // Helper function for formatting money
    const toMoney = (n) => {
      return Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    let currentY = 45;

    // Add company logo - Use company_logo from API
    try {
      let logoUrl = estimateData.company_logo;
      
      // If no logo in API, use a placeholder
      if (!logoUrl) {
        console.warn("No company logo found in API response");
        // Create text-based placeholder
        doc.setFillColor(240, 240, 240);
        doc.rect(40, 45, pageWidth - 80, 55, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        const companyName = estimateData.company_name || "Company Name";
        doc.text(companyName, pageWidth / 2, 45 + 27.5, { align: "center" });
        currentY = 45 + 55 + 20;
      } else {
        // Load logo from API URL
        const logoBase64 = await getImageBase64(logoUrl);
        const logoHeight = 55;
        const logoWidth = pageWidth - 80;
        doc.addImage(logoBase64, "PNG", 40, 45, logoWidth, logoHeight);
        currentY = 45 + logoHeight + 20;
      }
    } catch (e) {
      console.error("Error loading logo:", e);
      // Fallback: Create text-based placeholder
      doc.setFillColor(240, 240, 240);
      doc.rect(40, 45, pageWidth - 80, 55, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      const companyName = estimateData.company_name || "Company Name";
      doc.text(companyName, pageWidth / 2, 45 + 27.5, { align: "center" });
      currentY = 45 + 55 + 20;
    }

    // Cost Estimate header info
    const estimateDate = estimateData.estimate_date ? new Date(estimateData.estimate_date) : new Date();
    const formattedDate = `${estimateDate.getDate().toString().padStart(2, "0")}.${(estimateDate.getMonth() + 1).toString().padStart(2, "0")}.${estimateDate.getFullYear()}`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const infoX = pageWidth - marginLeft - 160;
    doc.text(`Cost Estimate No: ${estimateData.estimate_no}`, infoX, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Date: ${formattedDate}`, infoX, currentY + 15);
    doc.text(`Req. Ref.: --`, infoX, currentY + 30);

    // Client block
    let clientY = currentY;
    doc.setFontSize(10);
    doc.text("To,", marginLeft, clientY);
    clientY += 15;

    const clientName = estimateData.client?.name || "Client Name";
    const clientAddress = estimateData.client?.address || "Address not provided";
    const clientPhone = estimateData.client?.phone || "N/A";

    doc.text(` ${clientName}`, marginLeft, clientY);
    clientY += 14;
    doc.text(` ${clientAddress}`, marginLeft, clientY);
    clientY += 14;
    doc.text(`Tel: ${clientPhone}`, marginLeft, clientY);
    clientY += 25;

    // Items table
    const lineItems = Array.isArray(estimateData?.items) ? estimateData.items : [];

    // Create table headers
    const head = [
      "ITEM #", "Brand & Design / Description", "QTY",
      `Unit Price (${estimateCurrency})`, `Amount (${estimateCurrency})`,
    ];

    let body = lineItems.map((item, idx) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const amt = Number(item.amount || 0);
      return [
        String(idx + 1),
        item.description || "",
        { content: qty.toLocaleString("en-US"), styles: { halign: "center" } },
        { content: toMoney(rate), styles: { halign: "right" } },
        { content: toMoney(amt), styles: { halign: "right" } },
      ];
    });

    // Add empty rows (minimum 5 rows total)
    const minRows = 5;
    while (body.length < minRows) {
      body.push(["", "", "", "", ""]);
    }

    // Get totals from summary
    const subTotal = parseFloat(estimateData.summary?.subtotal || 0);
    const vatRate = parseFloat(estimateData.summary?.vat_rate || 18);
    const vatAmount = parseFloat(estimateData.summary?.vat_amount || 0);
    const total = parseFloat(estimateData.summary?.total_amount || 0);
    
    // Convert amount to words with correct currency
    const totalInWords = convertAmountToWords(total, estimateCurrency);

    // Add totals rows
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
            lineWidth: { top: 0.7, right: 0, bottom: 0.3, left: 0.3 },
            lineColor: [200, 200, 200],
          },
        },
        {
          content: `Sub-Total (${estimateCurrency})`,
          styles: {
            halign: "left",
            lineColor: [200, 200, 200],
            lineWidth: 0.3
          }
        },
        {
          content: toMoney(subTotal),
          styles: {
            halign: "right",
            textColor: [0, 0, 0],
            lineColor: [200, 200, 200],
            lineWidth: 0.3
          }
        },
      ],
      [
        {
          content: "• Cost based on One-off prices.\n• The above prices valid for 2 weeks and thereafter subject to our reconfirmation.",
          colSpan: 3,
          styles: {
            halign: "left",
            fontSize: 6,
            textColor: [0, 0, 0],
            lineWidth: 0,
            cellPadding: { top: 15, right: 4, bottom: 2, left: 4 }
          }
        },
        {
          content: `VAT (${vatRate}%) (${estimateCurrency})`,
          styles: {
            halign: "left",
            lineColor: [200, 200, 200],
            lineWidth: 0.3
          }
        },
        {
          content: toMoney(vatAmount),
          styles: {
            halign: "right",
            textColor: [0, 0, 0],
            lineColor: [200, 200, 200],
            lineWidth: 0.3
          }
        }
      ],
      [
        { content: "", styles: { fillColor: [255, 255, 255], lineWidth: 0 } },
        { content: "", styles: { fillColor: [255, 255, 255], lineWidth: 0 } },
        { content: "", styles: { fillColor: [255, 255, 255], lineWidth: 0 } },
        {
          content: `TOTAL (${estimateCurrency})`,
          styles: {
            halign: "left",
            fontStyle: "bold",
            lineColor: [200, 200, 200],
            lineWidth: 0.3
          }
        },
        {
          content: toMoney(total),
          styles: {
            halign: "right",
            fontStyle: "bold",
            textColor: [0, 0, 0],
            lineColor: [200, 200, 200],
            lineWidth: 0.3
          }
        }
      ]
    );

    // Create the table
    autoTable(doc, {
      startY: clientY,
      head: [head],
      body,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
        halign: "center",
        valign: "middle"
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
        lineColor: [200, 200, 200],
        lineWidth: 0.3
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 50 },
        1: { halign: "left", cellWidth: contentWidth - 260 },
        2: { halign: "center", cellWidth: 40 },
        3: { halign: "right", cellWidth: 80 },
        4: { halign: "right", cellWidth: 90 }
      },
      theme: 'plain',
      margin: { left: marginLeft, right: marginLeft },
    });

    // Get the Y position where the table ended
    const tableEndY = doc.lastAutoTable.finalY;

   // Signature Section
let signatureY;
if (tableEndY + 100 > pageHeight - 100) {
  doc.addPage();
  signatureY = 100;
} else {
  signatureY = tableEndY + 40;
}

doc.setFont("helvetica", "bold");
doc.setFontSize(10);

// Use company name from API
const companyName = estimateData.company_name || "Company Name";
// 修改：移除居中对齐，改为左对齐，与其他文本对齐
doc.text(companyName, marginLeft, signatureY);

doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.text("(This is a system generated document, hence not signed.)", marginLeft, signatureY + 20);

// Save PDF
// 提取客户名称的第一个词并首字母大写
const clientFirstName = estimateData.client?.name 
  ? estimateData.client.name.split(' ')[0].charAt(0).toUpperCase() + 
    estimateData.client.name.split(' ')[0].slice(1).toLowerCase()
  : 'Client';

// 提取项目名称的第一个词并首字母大写
const projectFirstName = estimateData.project?.project_name 
  ? estimateData.project.project_name.split(' ')[0].charAt(0).toUpperCase() + 
    estimateData.project.project_name.split(' ')[0].slice(1).toLowerCase()
  : 'Project';

// 生成新格式的文件名
const filename = `${estimateData.estimate_no}_CE_${clientFirstName}_${projectFirstName}.pdf`;
doc.save(filename);

    // Close loading
    Swal.close();

  } catch (error) {
    console.error("❌ Error generating Cost Estimate PDF:", error);
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "PDF Generation Failed",
      text: error?.message || "Something went wrong while generating the PDF.",
    });
  }
};