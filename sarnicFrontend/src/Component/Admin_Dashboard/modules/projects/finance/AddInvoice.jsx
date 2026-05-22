import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";

import axiosInstance from "../../../../../api/axiosInstance";
import { formatCurrencyAmount, parseCurrencyToNumber } from "../../../../../Common/Currency/currencyHelper";

export default function AddInvoice() {
    const navigate = useNavigate();
    const location = useLocation();
    const costEstimateId = location.state?.costEstimateId;
    const purchaseOrderId = location.state?.purchaseOrderId; // from Receivable PO "To Be Invoiced" button

    const invoiceId = location.state?.invoiceId;

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);

    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
    const [currencySelected, setCurrencySelected] = useState(false);

    const [invoiceData, setInvoiceData] = useState({
        estimate_id: null,   // 👈 FROM COST ESTIMATE (CE)
        purchase_order_id: null, // 👈 FROM RECEIVABLE PO (TO BE INVOICED)
        client_id: "",
        project_id: "",
        invoice_date: new Date(),
        due_date: new Date(),
        currency: "",
        document_type: "Tax Invoice",
        invoice_status: "Active",
        payment_status: "Unpaid",
        vat_rate: "5",
        notes: "",
        line_items: [{ description: "", quantity: "1", rate: "0.00" }]
    });

    /* ================= FETCH ================= */
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axiosInstance.get("/clientsuppliers");
            if (res.data.success) {
                setClients(res.data.data.filter(c => c.type === "client"));
            }
        } catch {
            toast.error("Failed to load clients");
        }
    };

    const fetchProjectsByClient = async (clientId) => {
        try {
            const res = await axiosInstance.get(`/projects?client_id=${clientId}`);
            if (res.data.success) setProjects(res.data.data);
        } catch {
            toast.error("Failed to load projects");
        }
    };

    /* ================= FETCH EXISTING INVOICE (EDIT MODE) ================= */
    const fetchInvoiceDetails = async (id) => {
        try {
            setIsLoading(true);
            const res = await axiosInstance.get(`/invoices/${id}`);
            if (res.data?.success) {
                const inv = res.data.data;

                // Parse line items if they are stored as JSON string or fallback to array
                let parsedItems = [];
                try {
                    parsedItems = typeof inv.line_items === 'string' ? JSON.parse(inv.line_items) : inv.line_items;
                } catch (e) {
                    parsedItems = [];
                }

                // Ensure items have string format for quantity/rate for the form
                const formattedItems = parsedItems.map(item => ({
                    description: item.description,
                    quantity: String(item.quantity),
                    rate: formatCurrencyAmount(item.rate, inv.currency)
                }));

                setInvoiceData({
                    estimate_id: inv.estimate_id,
                    purchase_order_id: inv.purchase_order_id,
                    client_id: inv.client_id?.toString() || "",
                    project_id: inv.project_id?.toString() || "",
                    invoice_date: new Date(inv.invoice_date),
                    due_date: new Date(inv.due_date),
                    currency: inv.currency,
                    document_type: inv.document_type || "Tax Invoice",
                    invoice_status: inv.invoice_status,
                    payment_status: inv.payment_status,
                    vat_rate: inv.vat_rate,
                    notes: inv.notes || "",
                    line_items: formattedItems.length > 0 ? formattedItems : [{ description: "", quantity: "1", rate: "0.00" }]
                });

                setCurrencySelected(!!inv.currency);

                if (inv.client_id) {
                    fetchProjectsByClient(inv.client_id);
                }
            }
        } catch (error) {
            console.error("Fetch invoice error", error);
            toast.error("Failed to load invoice details");
        } finally {
            setIsLoading(false);
        }
    };

    /* ================= HANDLERS ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "currency") {
            setCurrencySelected(!!value);
        }

        setInvoiceData(prev => ({ ...prev, [name]: value }));

        if (name === "client_id") {
            setInvoiceData(prev => ({ ...prev, project_id: "" }));
            fetchProjectsByClient(value);
        }
    };

    const handleDateChange = (date, fieldName) => {
        setInvoiceData(prev => {
            if (fieldName === "invoice_date" && prev.due_date < date) {
                return {
                    ...prev,
                    invoice_date: date,
                    due_date: date, // auto-adjust
                };
            }
            return { ...prev, [fieldName]: date };
        });
    };


    const handleLineItemChange = (index, field, value) => {
        const items = [...invoiceData.line_items];
        if (field === 'rate') items[index][field] = value.replace(/[^0-9.,]/g, '');
        else items[index][field] = value;
        setInvoiceData(prev => ({ ...prev, line_items: items }));
    };

    const handleRateBlur = (index, value) => {
        if (!invoiceData.currency) return;
        const num = parseCurrencyToNumber(value, invoiceData.currency);
        if (isNaN(num)) return;
        const formatted = formatCurrencyAmount(num, invoiceData.currency);
        const items = [...invoiceData.line_items];
        items[index].rate = formatted;
        setInvoiceData(prev => ({ ...prev, line_items: items }));
    };

    const addLineItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            line_items: [...prev.line_items, { description: "", quantity: "1", rate: "0.00" }]
        }));
    };

    const removeLineItem = (index) => {
        const items = [...invoiceData.line_items];
        items.splice(index, 1);
        setInvoiceData(prev => ({ ...prev, line_items: items }));
    };

    /* ================= VALIDATION ================= */
    const validateForm = () => {
        const newErrors = {};

        if (!invoiceData.client_id) newErrors.client_id = "Client is required";
        if (!invoiceData.project_id) newErrors.project_id = "Project is required";
        if (!invoiceData.currency) newErrors.currency = "Currency is required";

        // Validate line items
        invoiceData.line_items.forEach((item, index) => {
            if (!item.description) newErrors[`line_item_${index}_description`] = "Description is required";
            if (!item.quantity || parseFloat(item.quantity) <= 0) newErrors[`line_item_${index}_quantity`] = "Quantity must be greater than 0";
            const rateNum = parseCurrencyToNumber(item.rate, invoiceData.currency);
            if (!item.rate || isNaN(rateNum) || rateNum <= 0) newErrors[`line_item_${index}_rate`] = "Rate must be greater than 0";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ================= DATE FORMAT ================= */
    const formatDateForAPI = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    /* ================= PREFILL FROM COST ESTIMATE ================= */

    const fetchCostEstimateAndPrefill = async (id) => {
        try {
            setIsLoading(true);

            const res = await axiosInstance.get(`/costestimates/${id}`);

            if (res.data?.success) {
                const ce = res.data.data;

                setInvoiceData(prev => ({
                    ...prev,
                    estimate_id: ce.id,              // ✅ THIS IS THE KEY
                    client_id: ce.client_id?.toString(),
                    project_id: ce.project_id?.toString(),
                    currency: ce.currency,
                    vat_rate: ce.vat_rate,
                    notes: ce.notes || "",
                    line_items: ce.line_items.map(item => ({
                        description: item.description,
                        quantity: item.quantity.toString(),
                        rate: formatCurrencyAmount(item.rate, ce.currency)
                    }))
                }));

                setCurrencySelected(true);

                // load related projects
                fetchProjectsByClient(ce.client_id);
            }
        } catch (error) {
            toast.error("Failed to load cost estimate data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPurchaseOrderAndPrefill = async (id) => {
        try {
            setIsLoading(true);
            const res = await axiosInstance.get(`/purchaseorders/${id}`);

            if (res.data?.success) {
                const po = res.data.data;
                // po contains estimate details now because of backend update
                setInvoiceData(prev => ({
                    ...prev,
                    purchase_order_id: po.id,
                    estimate_id: po.estimate_id,
                    client_id: po.client_id?.toString(),
                    project_id: po.project_id?.toString(),
                    currency: po.currency,
                    vat_rate: po.vat_rate || "5",
                    notes: po.notes || "",
                    line_items: (typeof po.line_items === 'string' ? JSON.parse(po.line_items) : (po.line_items || [])).map(item => ({
                        description: item.description,
                        quantity: item.quantity.toString(),
                        rate: formatCurrencyAmount(item.rate, po.currency)
                    }))
                }));

                setCurrencySelected(true);
                fetchProjectsByClient(po.client_id);
            }
        } catch (error) {
            toast.error("Failed to load purchase order data");
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchClients();

        if (invoiceId) {
            // Edit Mode
            fetchInvoiceDetails(invoiceId);
        } else if (costEstimateId) {
            // Create Mode from CE
            fetchCostEstimateAndPrefill(costEstimateId);
        } else if (purchaseOrderId) {
            // Create Mode from PO
            fetchPurchaseOrderAndPrefill(purchaseOrderId);
        }

    }, [costEstimateId, purchaseOrderId, invoiceId]);



    /* ================= CALCULATIONS ================= */
    const subtotal = invoiceData.line_items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseCurrencyToNumber(item.rate, invoiceData.currency) || 0;
        return sum + qty * rate;
    }, 0);

    const vatAmount = subtotal * (parseFloat(invoiceData.vat_rate) / 100);
    const total = subtotal + vatAmount;

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Please fix errors in the form");
            return;
        }

        try {
            setIsLoading(true);

            const payload = {
                estimate_id: invoiceData.estimate_id,
                purchase_order_id: invoiceData.purchase_order_id,
                client_id: invoiceData.client_id,
                project_id: invoiceData.project_id,
                invoice_date: formatDateForAPI(invoiceData.invoice_date),
                due_date: formatDateForAPI(invoiceData.due_date),
                currency: invoiceData.currency,
                document_type: invoiceData.document_type,
                invoice_status: invoiceData.invoice_status,
                payment_status: invoiceData.payment_status,
                vat_rate: invoiceData.vat_rate,
                notes: invoiceData.notes,
                line_items: invoiceData.line_items.map(item => ({
                    description: item.description,
                    quantity: Number(item.quantity),
                    rate: parseCurrencyToNumber(item.rate, invoiceData.currency)
                }))
            };

            let res;
            if (invoiceId) {
                // UPDATE
                res = await axiosInstance.put(`/invoices/${invoiceId}`, payload);
            } else {
                // CREATE
                res = await axiosInstance.post("/invoices", payload);
            }

            if (res.data?.success) {
                // Get client and project names for the success message
                const clientName = clients.find(c => c.id === parseInt(invoiceData.client_id))?.name || "Unknown";
                const projectName = projects.find(p => p.id === parseInt(invoiceData.project_id))?.project_name || "Unknown";

                // Show success toast
                toast.success(
                    <div>
                        <strong>{invoiceId ? "Invoice Updated" : "Invoice Created"} Successfully!</strong>
                        <div className="mt-1">{clientName} - {projectName}</div>
                        <div className="mt-1">
                            Total: {invoiceData.currency} {formatCurrencyAmount(total, invoiceData.currency)}
                        </div>
                    </div>,
                    { autoClose: 5000 }
                );

                setTimeout(() => navigate(-1), 1500);
            } else {
                throw new Error(invoiceId ? "Invoice update failed" : "Invoice creation failed");
            }
        } catch (err) {
            // Check for specific 400 error about existing invoice
            if (!invoiceId && err.response?.status === 400 && err.response?.data?.message === "Invoice already exists for this Cost Estimate") {
                toast.info("Invoice already exists for this Cost Estimate");
            } else {
                toast.error(err.response?.data?.message || (invoiceId ? "Failed to update invoice" : "Failed to create invoice"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    /* ================= RENDER ================= */
    return (
        <div className="p-3">

            <h4 className="fw-bold mb-4">Create Invoice</h4>

            <div className="bg-white border rounded-3 p-4 shadow-sm">
                {/* BASIC DETAILS */}
                <div className="row mb-3">
                    {/* Client Selection */}
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold mb-2">Client</label>
                        <select
                            className={`form-select ${errors.client_id ? "is-invalid" : ""}`}
                            name="client_id"
                            value={invoiceData.client_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.client_id && <div className="invalid-feedback">{errors.client_id}</div>}
                    </div>

                    {/* Project Selection */}
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold mb-2">Project</label>
                        <select
                            className={`form-select ${errors.project_id ? "is-invalid" : ""}`}
                            name="project_id"
                            value={invoiceData.project_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.project_no} - {p.project_name}</option>)}
                        </select>
                        {errors.project_id && <div className="invalid-feedback">{errors.project_id}</div>}
                    </div>

                    {/* Invoice Date */}
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold mb-2">Invoice Date</label>
                        <div className="input-group">
                            <DatePicker
                                selected={invoiceData.invoice_date}
                                dateFormat="dd-MM-yyyy"
                                className="form-control"
                                open={showInvoiceDatePicker}
                                minDate={new Date()}                 // ✅ TODAY SE PEHLE GREY
                                onClickOutside={() => setShowInvoiceDatePicker(false)}
                                onChange={(date) => handleDateChange(date, 'invoice_date')}
                                disabled={isLoading}
                            />

                            <span
                                className="input-group-text bg-white"
                                style={{ cursor: 'pointer' }}
                                onClick={() => !isLoading && setShowInvoiceDatePicker(!showInvoiceDatePicker)}
                            >
                                <FaCalendarAlt />
                            </span>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold mb-2">Due Date</label>
                        <div className="input-group">
                            <DatePicker
                                selected={invoiceData.due_date}
                                dateFormat="dd-MM-yyyy"
                                className="form-control"
                                open={showDueDatePicker}
                                minDate={invoiceData.invoice_date}    // ✅ INVOICE DATE SE PEHLE GREY
                                onClickOutside={() => setShowDueDatePicker(false)}
                                onChange={(date) => handleDateChange(date, 'due_date')}
                                disabled={isLoading}
                            />

                            <span
                                className="input-group-text bg-white"
                                style={{ cursor: 'pointer' }}
                                onClick={() => !isLoading && setShowDueDatePicker(!showDueDatePicker)}
                            >
                                <FaCalendarAlt />
                            </span>
                        </div>
                    </div>

                    {/* Currency Selection */}
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold mb-2">Currency</label>
                        <select
                            className={`form-select ${errors.currency ? "is-invalid" : ""}`}
                            name="currency"
                            value={invoiceData.currency}
                            onChange={handleChange}
                        >
                            <option value="">Select Currency</option>
                            <option value="USD">USD - US Dollars</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="INR">INR - Indian Rupees</option>
                            <option value="AED">AED - Dirham</option>
                            <option value="SAR">SAR - Saudi Riyal</option>
                        </select>
                        {errors.currency && <div className="invalid-feedback">{errors.currency}</div>}
                    </div>

                    {/* Document Type */}
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold mb-2">Document Type</label>
                        <input
                            className="form-control bg-light"
                            value="Tax Invoice"
                            disabled
                        />
                    </div>

                    {/* VAT Rate */}
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold mb-2">VAT Rate (%)</label>
                        <input
                            className="form-control"
                            name="vat_rate"
                            value={invoiceData.vat_rate}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Status Selection */}
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold mb-2">Invoice Status</label>
                        <select
                            className="form-select"
                            name="invoice_status"
                            value={invoiceData.invoice_status}
                            onChange={handleChange}
                        >
                            <option value="Draft">Draft</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    {/* Payment Status */}
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold mb-2">Payment Status</label>
                        <select
                            className="form-select"
                            name="payment_status"
                            value={invoiceData.payment_status}
                            onChange={handleChange}
                        >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                </div>

                {/* ===== LINE ITEMS ===== */}
                <h6 className="fw-semibold mb-3">Line Items</h6>
                <div className="row fw-semibold text-muted mb-2 px-2">
                    <div className="col-md-5">Description</div>
                    <div className="col-md-2">Quantity</div>
                    <div className="col-md-2">Rate</div>
                    <div className="col-md-2">Amount</div>
                    <div className="col-md-1"></div>
                </div>

                {invoiceData.line_items.map((item, index) => (
                    <div key={index} className="row gx-2 gy-2 align-items-center mb-2 px-2 py-2" style={{ background: "#f9f9f9", borderRadius: "8px" }}>
                        {/* Description */}
                        <div className="col-md-5">
                            <input
                                className={`form-control ${errors[`line_item_${index}_description`] ? "is-invalid" : ""}`}
                                placeholder="Item description"
                                value={item.description}
                                onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            />
                            {errors[`line_item_${index}_description`] && <div className="invalid-feedback">{errors[`line_item_${index}_description`]}</div>}
                        </div>

                        {/* Quantity */}
                        <div className="col-md-2">
                            <input
                                className={`form-control ${errors[`line_item_${index}_quantity`] ? "is-invalid" : ""}`}
                                placeholder="Qty"
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                            />
                            {errors[`line_item_${index}_quantity`] && <div className="invalid-feedback">{errors[`line_item_${index}_quantity`]}</div>}
                        </div>

                        {/* Rate */}
                        <div className="col-md-2">
                            <input
                                className={`form-control ${errors[`line_item_${index}_rate`] ? "is-invalid" : ""} ${!currencySelected ? 'bg-light' : ''}`}
                                placeholder="Rate"
                                value={item.rate}
                                disabled={!currencySelected}
                                onChange={(e) => handleLineItemChange(index, 'rate', e.target.value.replace(/[^0-9.]/g, ""))}
                                onBlur={() => handleRateBlur(index, item.rate)}
                            />
                            {errors[`line_item_${index}_rate`] && <div className="invalid-feedback">{errors[`line_item_${index}_rate`]}</div>}
                            {!currencySelected && <small className="text-muted">Please select currency first</small>}
                        </div>

                        {/* Amount */}
                        <div className="col-md-2">
                            <span>
                                {invoiceData.currency} {formatCurrencyAmount(
                                    ((parseFloat(item.quantity) || 0) *
                                        (parseFloat(item.rate.replace(/,/g, "")) || 0)).toFixed(2),
                                    invoiceData.currency
                                )}
                            </span>
                        </div>

                        {/* Remove Button */}
                        <div className="col-md-1 text-end">
                            <button
                                className="btn btn-link text-danger p-0"
                                onClick={() => removeLineItem(index)}
                            >
                                remove
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    className="btn border rounded px-3 py-1 mb-4"
                    onClick={addLineItem}
                    disabled={!currencySelected}
                >
                    + Add Line Item
                </button>

                {/* ===== VAT + CALCULATIONS + NOTES ===== */}
                <div className="row mt-4">
                    <div className="col-md-6">
                        <label className="fw-bold mb-2">VAT Rate (%)</label>
                        <input
                            className="form-control mb-3"
                            name="vat_rate"
                            value={invoiceData.vat_rate}
                            onChange={handleChange}
                        />

                        <div className="mt-3 p-3 bg-light rounded">
                            <p className="mb-2">
                                Subtotal: {invoiceData.currency} {formatCurrencyAmount(subtotal.toFixed(2), invoiceData.currency)}
                            </p>
                            <p className="mb-2">
                                VAT ({invoiceData.vat_rate}%): {invoiceData.currency} {formatCurrencyAmount(vatAmount.toFixed(2), invoiceData.currency)}
                            </p>
                            <p className="mb-0 fw-bold">
                                Total: {invoiceData.currency} {formatCurrencyAmount(total.toFixed(2), invoiceData.currency)}
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label className="fw-bold mb-2">Notes</label>
                        <textarea
                            className="form-control"
                            rows="6"
                            placeholder="Additional notes..."
                            name="notes"
                            value={invoiceData.notes}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* ===== ACTIONS ===== */}
                <div className="mt-4 d-flex gap-2">
                    <button
                        className="btn btn-primary rounded-pill px-4"
                        onClick={handleSubmit}
                        disabled={isLoading || !currencySelected}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span className="ms-2">Creating Invoice...</span>
                            </>
                        ) : (
                            "Save"
                        )}
                    </button>
                    <button
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}