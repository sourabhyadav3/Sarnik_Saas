import React, { useEffect, useState, useMemo } from "react";
import { Form, Table, Badge, Button, Dropdown, Modal } from "react-bootstrap";
import { FaFileAlt } from "react-icons/fa";
import axiosInstance from "../../../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../../../Common/DateFormate/dateFormat";
import { formatCurrencyAmount } from "../../../../../Common/Currency/currencyHelper";
import { useNavigate } from "react-router-dom";

export default function ReceivablePO({ projectId }) {
  const navigate = useNavigate();

  /* ================= STATES ================= */
  const [loading, setLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [clients, setClients] = useState([]);

  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");

  const isImage = (url) => {
    if (!url) return false;
    const ext = url.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
  };

  const isPDF = (url) => {
    if (!url) return false;
    const ext = url.split('.').pop().toLowerCase();
    return ext === 'pdf';
  };

  const handlePreview = (url) => {
    setPreviewUrl(url);
    setShowPreview(true);
  };

  /* ================= FETCH PO ================= */
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);

      const url = projectId
        ? `/purchaseorders/project/${projectId}`
        : `/purchaseorders`;

      const res = await axiosInstance.get(url);

      if (res.status === 200 && res.data?.success) {
        setPurchaseOrders(res.data.data || []);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get('/clientsuppliers');
      if (res.status === 200 && res.data?.success) {
        // Filter only clients
        const clientData = res.data.data.filter(item => item.type === 'client');
        setClients(clientData);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    fetchClients();
  }, [projectId]);

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case "received":
        return <Badge bg="info">Invoiced</Badge>;
      case "completed":
        return <Badge bg="success">Completed</Badge>;
      default:
        return <Badge bg="secondary">—</Badge>;
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const search = searchText.toLowerCase();

      const matchSearch =
        po.po_number?.toLowerCase().includes(search) ||
        po.project_name?.toLowerCase().includes(search) ||
        po.client_name?.toLowerCase().includes(search) ||
        `ce-${po.cost_estimation_id}`.includes(search);

      const matchStatus =
        statusFilter === "All" ||
        po.po_status === statusFilter.toLowerCase();

      // Add client filter logic
      const matchClient =
        clientFilter === "All" || po.client_name === clientFilter;

      return matchSearch && matchStatus && matchClient;
    });
  }, [purchaseOrders, searchText, statusFilter, clientFilter]);

  /* ================= COUNTS ================= */
  const pendingCount = purchaseOrders.filter(
    (po) => po.po_status === "pending"
  ).length;

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("All");
    setClientFilter("All");
  };

  // ===== INVOICE ACTION HANDLERS (DUMMY ROUTES FOR NOW) =====
  const handleToBeInvoiced = (po) => {
    console.log("To Be Invoiced clicked", po);
    navigate("/admin/invoices/create", {
      state: {
        purchaseOrderId: po.id,
        costEstimateId: po.cost_estimation_id
      }
    });
  };

  const handleInvoiced = (po) => {
    console.log("Invoiced clicked", po);
    navigate("/admin/Invoicing", {
      state: { purchaseOrderId: po.id }
    });
  };

  // ===== PO RELATED (DUMMY FOR NOW) =====
  const handleNewInvoice = (po) => {
    console.log(" New Invoice clicked");
    later: navigate("/admin/invoices/create", {
      state: {
        purchaseOrderId: po.id,
        costEstimateId: po.cost_estimation_id
      }
    })
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 m-2 bg-white rounded shadow-sm">
      <h4 className="fw-bold mb-4">Receivable Purchase Orders</h4>

      {/* ===== FILTER BAR ===== */}
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <Form.Control
          placeholder="Search by PO, CE, Project, Client..."
          style={{ maxWidth: 320 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Dropdown>
          <Dropdown.Toggle variant="light">
            {statusFilter}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setStatusFilter("All")}>
              All Status
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter("pending")}>
              Pending
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter("received")}>
              Received
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* Client Filter Dropdown */}
        <Dropdown>
          <Dropdown.Toggle variant="light">
            {clientFilter === "All" ? "All Clients" : clientFilter}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setClientFilter("All")}>
              All Clients
            </Dropdown.Item>
            {clients.map(client => (
              <Dropdown.Item key={client.id} onClick={() => setClientFilter(client.name)}>
                {client.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <Button variant="outline-secondary" onClick={clearFilters}>
          Clear Filters
        </Button>

        <span className="ms-auto">
          Pending POs: <Badge bg="warning">{pendingCount}</Badge>
        </span>
      </div>

      {/* ===== TABLE ===== */}
      <div style={{ overflowX: "auto" }}>
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Estimate Ref</th>
              <th>Client</th>
              <th>Project</th>
              <th>PO Date</th>
              <th>Amount</th>
              <th> Status</th>
              <th>Documents</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filteredPOs.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  No purchase orders found
                </td>
              </tr>
            )}

            {!loading && filteredPOs.map((po) => (
              <tr key={po.id}>
                <td className="fw-semibold">{po.po_number}</td>

                <td className="text-primary fw-semibold">
                  CE-{po.estimate_no}
                </td>

                <td>{po.client_name}</td>
                <td>{po.project_name}</td>

                <td>{formatDDMMYYYY(po.po_date)}</td>

                <td>
                  {po.currency} {formatCurrencyAmount(po.po_amount, po.currency)}
                </td>

                <td>{getStatusBadge(po.ce_invoice_status)}</td>

                <td>
                  {po.po_document ? (
                    <div className="d-flex align-items-center gap-2">
                      {isImage(po.po_document) && (
                        <img
                          src={po.po_document}
                          alt="thumb"
                          style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ddd' }}
                          onClick={() => handlePreview(po.po_document)}
                        />
                      )}
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handlePreview(po.po_document)}
                      >
                        <FaFileAlt className="me-1" /> View
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>

                <td>
                  <div className="d-flex gap-2 flex-wrap">

                    {/* TO BE INVOICED */}
                    {po.to_be_invoiced === 1 && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleToBeInvoiced(po)}
                      >
                        To Be Invoiced
                      </Button>
                    )}

                    {/* INVOICED */}
                    {po.invoiced === 1 && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleInvoiced(po)}
                      >
                        Invoiced
                      </Button>
                    )}

                    {/* NEW INVOICE */}
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleNewInvoice(po)}
                    >
                      New Invoice
                    </Button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* ===== PREVIEW MODAL ===== */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-primary">Document Review</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 text-center" style={{ minHeight: '500px', backgroundColor: '#e9ecef' }}>
          {isImage(previewUrl) ? (
            <div className="p-3">
              <img src={previewUrl} alt="Preview" className="img-fluid shadow rounded" style={{ maxHeight: '80vh' }} />
            </div>
          ) : isPDF(previewUrl) ? (
            <div style={{ height: '80vh' }}>
              <iframe
                src={previewUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="p-5">
              <FaFileAlt size={60} className="text-muted mb-3" />
              <h5 className="text-secondary">Direct preview not available</h5>
              <p className="text-muted">Use the buttons below to view or download the file.</p>
              <Button variant="outline-primary" onClick={() => window.open(previewUrl, "_blank")}>
                Try Opening in New Tab
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" className="rounded-pill px-4" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="btn btn-primary rounded-pill px-4 shadow-sm"
          >
            Download / View Full
          </a>
        </Modal.Footer>
      </Modal>
    </div>
  );
}