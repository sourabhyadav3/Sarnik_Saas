// AddPOUI.jsx
import React, { useState, useEffect } from "react";
import { Button, Form, Card, InputGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../../../api/axiosInstance";

// 🔥 TOAST
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ HELPERS
import { parseCurrencyToNumber } from "../../../../../Common/Currency/currencyHelper";

// Date Picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Icons
import { FaCalendarAlt } from "react-icons/fa";

export default function AddPO() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  /* ================= STATE ================= */
  const [poData, setPoData] = useState({
    poNumber: "PO-", // ✅ manual
    projectName: "",
    clientName: "",
    projectId: "",
    clientId: "",
    costEstimationId: "",
    poAmount: "",
    poDate: new Date(), // ✅ today (Date object)
    poDocument: null,
  });

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (location.state) {
      const {
        projectName,
        clientName,
        projectId,
        clientId,
        amount,
        costEstimationId,
      } = location.state;

      setPoData((prev) => ({
        ...prev,
        projectName,
        clientName,
        projectId,
        clientId,
        costEstimationId,
        poAmount: amount?.toString() || "",
      }));
    }
  }, [location]);

  /* ================= HANDLERS ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setPoData((prev) => ({
      ...prev,
      poDocument: e.target.files[0],
    }));
  };

  // Handle date change from DatePicker
  const handleDateChange = (date) => {
    setPoData((prev) => ({ ...prev, poDate: date }));
  };

  // Custom input for date picker
  const DateInput = React.forwardRef(({ value, onClick }, ref) => (
    <InputGroup>
      <Form.Control
        ref={ref}
        value={value}
        onClick={onClick}
        onChange={() => { }} // Prevent onChange to avoid issues with controlled component
        placeholder="DD/MM/YYYY"
        style={{ cursor: 'pointer' }}
      />
      <InputGroup.Text
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        <FaCalendarAlt />
      </InputGroup.Text>
    </InputGroup>
  ));

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("po_number", poData.poNumber);
      formData.append("client_id", poData.clientId);
      formData.append("project_id", poData.projectId);
      formData.append("cost_estimation_id", poData.costEstimationId);

      // ✅ numeric amount
      const poAmountNumeric = parseCurrencyToNumber(poData.poAmount);
      formData.append(
        "po_amount",
        isNaN(poAmountNumeric) ? poData.poAmount : poAmountNumeric
      );

      // ✅ Convert Date object to YYYY-MM-DD for the API
      const year = poData.poDate.getFullYear();
      const month = String(poData.poDate.getMonth() + 1).padStart(2, '0');
      const day = String(poData.poDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      formData.append("po_date", formattedDate);

      if (poData.poDocument) {
        formData.append("po_document", poData.poDocument);
      }

      const res = await axiosInstance.post("/purchaseorders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        toast.success("Purchase Order created successfully 🎉");
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(res.data?.message || "Failed to create Purchase Order");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Something went wrong while creating Purchase Order"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="p-4 m-2 bg-white rounded shadow-sm">
        <div className="d-flex justify-content-between mb-4">
          <h4 className="fw-bold">Add Purchase Order</h4>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <Card className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* PO NUMBER */}
            <Form.Group className="mb-3">
              <Form.Label>PO Number</Form.Label>
              <Form.Control
                name="poNumber"
                value={poData.poNumber}
                onChange={handleInputChange}
                placeholder="PO-123"
                required
              />
            </Form.Group>

            {/* PROJECT + CLIENT */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Project</Form.Label>
                <Form.Control value={poData.projectName} disabled />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Client</Form.Label>
                <Form.Control value={poData.clientName} disabled />
              </div>
            </div>

            {/* AMOUNT + DATE */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>PO Amount</Form.Label>
                <Form.Control
                  name="poAmount"
                  value={poData.poAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>PO Date</Form.Label>
                <DatePicker
                  selected={poData.poDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  customInput={<DateInput />}
                  wrapperClassName="w-100"
                  required
                />
              </div>
            </div>

            {/* DOCUMENT */}
            <Form.Group className="mb-4">
              <Form.Label>PO Document</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                Accepted formats: PNG, JPG, PDF
              </Form.Text>
            </Form.Group>

            {/* ACTIONS */}
            <div className="d-flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
}