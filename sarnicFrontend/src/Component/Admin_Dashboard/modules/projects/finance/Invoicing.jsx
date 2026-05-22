import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";

import { FaSearch, FaDownload, FaTrash } from "react-icons/fa";
import { BsPencil } from "react-icons/bs";
import axiosInstance from "../../../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../../../Common/DateFormate/dateFormat";
import { formatCurrencyAmount } from "../../../../../Common/Currency/currencyHelper";
import { generateInvoicePDF } from "./Pdf/IN-Pdf";
import { useNavigate } from "react-router-dom";

const Invoicing = ({ projectId }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // NEW: Track downloading state for each invoice
  const [downloadingInvoices, setDownloadingInvoices] = useState({});

  // filters
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  /* ================= FETCH ================= */
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const url = projectId ? `/invoices/project/${projectId}` : `/invoices`;

      const res = await axiosInstance.get(url);
      if (res.data?.success) {
        setInvoices(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [projectId]);

  /* ================= FILTER LOGIC ================= */
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const searchText = search.toLowerCase();
      const matchSearch =
        inv.invoice_no?.toString().includes(searchText) ||
        inv.project_name?.toLowerCase().includes(searchText) ||
        inv.client_name?.toLowerCase().includes(searchText);

      const invoiceDate = new Date(inv.invoice_date);
      const matchFromDate = fromDate ? invoiceDate >= new Date(fromDate) : true;
      const matchToDate = toDate ? invoiceDate <= new Date(toDate) : true;

      const matchProject =
        projectFilter === "All" || inv.project_name === projectFilter;

      const matchClient =
        clientFilter === "All" || inv.client_name === clientFilter;

      return (
        matchSearch &&
        matchFromDate &&
        matchToDate &&
        matchProject &&
        matchClient
      );
    });
  }, [invoices, search, fromDate, toDate, projectFilter, clientFilter]);

  /* ================= DOWNLOAD PDF ================= */
  const handleDownloadPDF = async (invoice) => {
    if (!invoice?.id) {
      console.error("No invoice ID found");
      return;
    }

    // Set downloading state for this invoice
    setDownloadingInvoices(prev => ({ 
      ...prev, 
      [invoice.id]: true 
    }));

    try {
      // Call the PDF generation function with invoice ID
      await generateInvoicePDF(invoice.id);
    } catch (error) {
      console.error("PDF download error:", error);
    } finally {
      // Reset downloading state
      setDownloadingInvoices(prev => ({ 
        ...prev, 
        [invoice.id]: false 
      }));
    }
  };

  /* ================= EDIT ================= */
  const handleEditInvoice = (invoice) => {
    // Reuse AddInvoice page in edit mode (it reads location.state.invoiceId)
    navigate("/admin/invoices/create", {
      state: {
        invoiceId: invoice.id,
      },
    });
  };

  /* ================= DELETE ================= */
  const openDeleteModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedInvoice(null);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/invoices/${selectedInvoice.id}`);
      fetchInvoices();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      closeDeleteModal();
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 m-2 bg-white rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Invoicing</h4>
      </div>

      {/* Filter Section */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search Invoice / Project / Client"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            placeholder="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            placeholder="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <Form.Select 
            value={projectFilter} 
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="All">All Projects</option>
            {[...new Set(invoices.map(inv => inv.project_name))].map((project, idx) => (
              project && <option key={idx} value={project}>{project}</option>
            ))}
          </Form.Select>
        </div>

        <div className="col-md-2">
          <Form.Select 
            value={clientFilter} 
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="All">All Clients</option>
            {[...new Set(invoices.map(inv => inv.client_name))].map((client, idx) => (
              client && <option key={idx} value={client}>{client}</option>
            ))}
          </Form.Select>
        </div>
      </div>

      {/* Invoice Table */}
      <Table hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>Invoice #</th>
            <th>CE No</th>
            <th>PO No</th>
            <th>Project</th>
            <th>Project No</th>
            <th>Client Name</th>
            <th>Amount</th>
            <th>Invoice Date</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan="7" className="text-center">Loading...</td>
            </tr>
          )}

          {!loading && filteredInvoices.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center">No invoices found</td>
            </tr>
          )}

          {!loading &&
            filteredInvoices.map((inv) => (
              <tr key={inv.id}>
                <td className="fw-semibold text-primary">INV-{inv.invoice_no}</td>
                <td className="fw-semibold text-primary">{inv.ce_no}</td>
                <td className="fw-semibold text-primary">{inv.po_number}</td>
                <td>{inv.project_name}</td>
                <td>{inv.project_no}</td>
                <td>{inv.client_name}</td>
                <td>
                  {inv.currency}{" "}
                  {formatCurrencyAmount(inv.total_amount, inv.currency)}
                </td>
                <td>{formatDDMMYYYY(inv.invoice_date)}</td>
                <td className="text-center">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    title="Edit Invoice"
                    onClick={() => handleEditInvoice(inv)}
                  >
                    <BsPencil />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleDownloadPDF(inv)}
                    disabled={downloadingInvoices[inv.id]}
                  >
                    {downloadingInvoices[inv.id] ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaDownload className="me-1" />
                        PDF
                      </>
                    )}
                  </Button>

                  {/* <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => openDeleteModal(inv)}
                  >
                    <FaTrash />
                  </Button> */}
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Delete Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>INV-{selectedInvoice?.invoice_no}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Invoicing;