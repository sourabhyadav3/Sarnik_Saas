import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Badge, Modal, Form } from "react-bootstrap";
import { BsPlusLg, BsPencil, BsTrash, BsCopy } from "react-icons/bs";
import { FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../../api/axiosInstance";

import { formatDDMMYYYY } from "../../../../../Common/DateFormate/dateFormat";
import { formatCurrencyAmount } from "../../../../../Common/Currency/currencyHelper";
import { generateCostEstimatePDF } from "./Pdf/CE-Pdf";

export default function CostEstimatesUI({ projectId }) {
  const navigate = useNavigate();

  const [estimates, setEstimates] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null); // Track which PDF is being downloaded
  const [duplicatingId, setDuplicatingId] = useState(null); // Track which estimate is being duplicated

  // filters
  const [search, setSearch] = useState("");
  const [poStatus, setPoStatus] = useState("All");
  const [status, setStatus] = useState("All"); // New status filter
  const [clientFilter, setClientFilter] = useState("All"); // New client filter

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);

  /* ================= FETCH ================= */
  const fetchCostEstimates = async () => {
    try {
      setLoading(true);

      const url = projectId
        ? `/costestimates/project/${projectId}`
        : `/costestimates`;

      const res = await axiosInstance.get(url);

      if (res.status === 200 && res.data?.success) {
        setEstimates(res.data.data || []);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
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
    fetchCostEstimates();
    fetchClients();
  }, [projectId]);

  /* ================= PDF DOWNLOAD HANDLER ================= */
  const handleDownloadPDF = async (estimateId, estimateNo) => {
    try {
      setDownloadingId(estimateId);
      
      // Call the PDF generation function with the estimate ID
      await generateCostEstimatePDF(estimateId);
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // Error handling is done inside generateCostEstimatePDF function
    } finally {
      setDownloadingId(null);
    }
  };

  /* ================= DUPLICATE HANDLER ================= */
  const handleDuplicate = async (estimateId) => {
    try {
      setDuplicatingId(estimateId);
      await axiosInstance.post(`/costestimates/${estimateId}/duplicate`);
      await fetchCostEstimates();
    } catch (err) {
      // handle silently (consistent with other handlers)
    } finally {
      setDuplicatingId(null);
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredEstimates = useMemo(() => {
    return estimates.filter((row) => {
      const matchSearch =
        row.project_name?.toLowerCase().includes(search.toLowerCase()) ||
        row.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        row.estimate_no?.toString().includes(search);

      const matchStatus =
        poStatus === "All" || row.ce_po_status === poStatus;
      
      // Add new status filter logic
      const matchCeStatus =
        status === "All" || row.ce_status === status;
      
      // Add client filter logic
      const matchClient =
        clientFilter === "All" || row.client_name === clientFilter;

      return matchSearch && matchStatus && matchCeStatus && matchClient;
    });
  }, [estimates, search, poStatus, status, clientFilter]);

  /* ================= HANDLERS ================= */
  const handleEdit = (id) => {
    navigate(`/admin/edit-cost-estimate/${id}`);
  };

  const handleAddPO = (estimate) => {
    navigate("/admin/add-purchase-order", {
      state: {
        costEstimationId: estimate.id,
        ceNo: estimate.estimate_no,
        projectName: estimate.project_name,
        clientName: estimate.client_name,
        projectId: estimate.project_id,
        clientId: estimate.client_id,
        amount: estimate.total_amount,
      },
    });
  };

  // ===== INVOICE RELATED =====
  const handleToBeInvoiced = (row) => {
    navigate("/admin/invoices/create", {
      state: {
        costEstimateId: row.id
      }
    });
  };

  const handleInvoice = (row) => {
    console.log("Invoice clicked", row);
    later: navigate("/admin/receivable", { state: row })
  };

  const handleInvoiced = (row) => {
    console.log("Invoiced clicked", row);
    later: navigate("/admin/Invoicing", { state: row })
  };

  /* ================= DELETE ================= */
  const openDeleteModal = (estimate) => {
    setSelectedEstimate(estimate);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedEstimate(null);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(
        `/costestimates/${selectedEstimate.id}`
      );
      fetchCostEstimates();
    } catch (err) {
      // handle silently
    } finally {
      closeDeleteModal();
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 m-2 bg-white rounded shadow-sm">
      <div className="d-flex justify-content-between mb-3">
        <h4 className="fw-bold">Cost Estimates</h4>
        <Button onClick={() => navigate("/admin/add-cost-estimate", { state: {projectId } })}>
          <BsPlusLg className="me-2" /> Add Cost Estimate
        </Button>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <Form.Control
          placeholder="Search by CE No, Project, Client..."
          style={{ maxWidth: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Form.Select
          style={{ maxWidth: 200 }}
          value={poStatus}
          onChange={(e) => setPoStatus(e.target.value)}
        >
          <option value="All">All PO Status</option>
          <option value="pending">Pending</option>
          <option value="received">Received</option>
        </Form.Select>

        {/* New Status Filter */}
        <Form.Select
          style={{ maxWidth: 200 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </Form.Select>

        {/* New Client Filter */}
        <Form.Select
          style={{ maxWidth: 200 }}
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        >
          <option value="All">All Clients</option>
          {clients.map(client => (
            <option key={client.id} value={client.name}>
              {client.name}
            </option>
          ))}
        </Form.Select>

        <Button
          variant="outline-secondary"
          onClick={() => {
            setSearch("");
            setPoStatus("All");
            setStatus("All"); // Reset the new status filter
            setClientFilter("All"); // Reset the client filter
          }}
        >
          Clear Filters
        </Button>
      </div>

      {/* ===== TABLE ===== */}
      <Table hover responsive>
        <thead>
          <tr>
            <th>CE No</th>
            <th>Project No</th>
            <th>Client</th>
            <th>Project</th>
            <th>Date</th>
            <th>Amount</th>
            <th>PO Status</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan="9" className="text-center">
                Loading...
              </td>
            </tr>
          )}

          {!loading && filteredEstimates.length === 0 && (
            <tr>
              <td colSpan="9" className="text-center">
                No cost estimates found
              </td>
            </tr>
          )}

          {!loading &&
            filteredEstimates.map((row) => (
              <tr key={row.id}>
                <td className="fw-semibold text-primary">
                  CE-{row.estimate_no}
                </td>
           
                <td>{row.project_no}</td>
                <td>{row.client_name || "-"}</td>
                     <td>{row.project_name}</td>
                <td>{formatDDMMYYYY(row.estimate_date)}</td>
                <td>
                  {row.currency}{" "}
                  {formatCurrencyAmount(row.total_amount, row.currency)}
                </td>
                <td>
                  <Badge
                    bg={row.ce_po_status === "pending" ? "warning" : "success"}
                  >
                    {row.ce_po_status}
                  </Badge>
                </td>
                <td>
                  <Badge
                    bg={
                      row.ce_status === "Draft" ? "info" : 
                      row.ce_status === "Active" ? "primary" :
                      row.ce_status === "Inactive" ? "secondary" :
                      row.ce_status === "Completed" ? "success" :
                      row.ce_status === "Pending" ? "warning" : "secondary"
                    }
                  >
                    {row.ce_status}
                  </Badge>
                </td>

                {/* ===== ACTIONS ===== */}
                <td>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={row.ce_po_status === "received"}
                      onClick={() => handleAddPO(row)}
                    >
                      Add PO
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleEdit(row.id)}
                    >
                      <BsPencil />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-primary"
                      title="Duplicate"
                      onClick={() => handleDuplicate(row.id)}
                      disabled={duplicatingId === row.id}
                    >
                      {duplicatingId === row.id ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <BsCopy />
                      )}
                    </Button>

                    {/* PDF Download Button */}
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => handleDownloadPDF(row.id, row.estimate_no)}
                      disabled={downloadingId === row.id}
                    >
                      {downloadingId === row.id ? (
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
                      onClick={() => openDeleteModal(row)}
                    >
                      <BsTrash />
                    </Button> */}

                    {row.to_be_invoiced === 1 && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleToBeInvoiced(row)}
                      >
                        To Be Invoiced
                      </Button>
                    )}

                    {row.invoice === 1 && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleInvoice(row)}
                      >
                        Invoice
                      </Button>
                    )}

                    {row.invoiced === 1 && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleInvoiced(row)}
                      >
                        Invoiced
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* ===== DELETE MODAL ===== */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Cost Estimate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>CE-{selectedEstimate?.estimate_no}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}