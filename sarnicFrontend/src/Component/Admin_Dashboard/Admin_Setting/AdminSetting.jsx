import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Nav,
  Tab,
  Tabs,
  Table,
  Card,
  Modal,
} from "react-bootstrap";
import { FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TaxSettings from "./TaxSettings";
import axiosInstance from "../../../api/axiosInstance";

// Configuration for Job Settings sub-tabs, now including "Industries"
const jobTabsConfig = [
  { title: "Brand Name", key: "brand", endpoint: "/brand" },
  { title: "Sub Brand", key: "subbrand", endpoint: "/subbrands" },
  { title: "Flavour", key: "flavour", endpoint: "/flavours" },
  { title: "Pack Type", key: "packtype", endpoint: "/packtypes" },
  // { title: "Pack Code", key: "packcode", endpoint: "/packcodes" },
  { title: "Industries", key: "industries", endpoint: "/industries" }, // Added Industries
];

const AdminSetting = () => {
  // --- State for Company Info Tab ---
  const [companyData, setCompanyData] = useState({
    company_logo: null,
    company_stamp: null,
    company_name: "",
    address: "",
    industry: "",
    trn: "",
    email: "",
    phone: "",
    bank_account_name: "",
    bank_name: "",
    iban: "",
    swift_code: "",
  });
  const [logoFileName, setLogoFileName] = useState("No file chosen");
  const [stampFileName, setStampFileName] = useState("No file chosen");

  // --- State for Job Settings Tab ---
  const [jobData, setJobData] = useState(
    jobTabsConfig.reduce((acc, tab) => ({ ...acc, [tab.key]: [] }), {})
  );
  const [newItemName, setNewItemName] = useState(
    jobTabsConfig.reduce((acc, tab) => ({ ...acc, [tab.key]: "" }), {})
  );
  const [activeJobTab, setActiveJobTab] = useState(jobTabsConfig[0].key);

  // --- State for managing selected items for bulk delete ---
  const [selectedItems, setSelectedItems] = useState(
    jobTabsConfig.reduce((acc, tab) => ({ ...acc, [tab.key]: [] }), {})
  );

  // --- State for Number Settings Tab ---
  const [sequences, setSequences] = useState([]);
  const [editedSequences, setEditedSequences] = useState({});

  // --- State for Delete Modal (used by Job Settings) ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({
    type: "",
    id: null,
    name: "",
    endpoint: "",
    isBulk: false,
    ids: [],
  });

  // --- API Functions for Company Info ---
  const fetchCompanyInfo = async () => {
    try {
      const res = await axiosInstance.get("/company/1");
      setCompanyData(res.data?.data || {});
    } catch (error) {
      toast.error("Failed to load company information");
    }
  };

  // --- Mock/Local Fallback for Number Settings ---
  const MOCK_SEQUENCES = [
    { id: 1, label: "Job Number Sequence", sequence_key: "JOB", default_start: 1000 },
    { id: 2, label: "Purchase Order Sequence", sequence_key: "PO", default_start: 1000 },
    { id: 3, label: "Invoice Sequence", sequence_key: "INV", default_start: 1000 },
  ];

  // --- API Functions for Number Settings ---
  const fetchSequences = async () => {
    try {
      const res = await axiosInstance.get("/number-sequences");
      setSequences(res.data?.data || []);
      setEditedSequences({});
    } catch (error) {
      console.warn("Number sequences API failed, falling back to local storage:", error);
      // Load from localStorage or initialize with mock data
      const local = localStorage.getItem("sarnik_number_sequences");
      if (local) {
        setSequences(JSON.parse(local));
      } else {
        localStorage.setItem("sarnik_number_sequences", JSON.stringify(MOCK_SEQUENCES));
        setSequences(MOCK_SEQUENCES);
      }
      setEditedSequences({});
    }
  };

  const handleSequenceChange = (id, value) => {
    setEditedSequences((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveSequence = async (id) => {
    const value = editedSequences[id];
    if (value === undefined || value === "") {
      toast.error("Please enter a valid number");
      return;
    }
    try {
      await axiosInstance.put(`/number-sequences/${id}`, {
        default_start: Number(value),
      });
      toast.success("Number sequence updated successfully");
      fetchSequences();
    } catch (error) {
      console.warn("Failed to update sequence on server, saving locally:", error);
      // Fallback local save
      const currentLocal = localStorage.getItem("sarnik_number_sequences");
      const list = currentLocal ? JSON.parse(currentLocal) : [...MOCK_SEQUENCES];
      
      const updatedList = list.map((seq) => 
        seq.id === id ? { ...seq, default_start: Number(value) } : seq
      );
      
      localStorage.setItem("sarnik_number_sequences", JSON.stringify(updatedList));
      setSequences(updatedList);
      setEditedSequences((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.success("Number sequence updated successfully (Local)");
    }
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyData((prev) => ({ ...prev, [type]: file }));
      if (type === "company_logo") {
        setLogoFileName(file.name);
      } else {
        setStampFileName(file.name);
      }
    }
  };

const handleSaveCompanyInfo = async () => {
  const formData = new FormData();
  Object.keys(companyData).forEach((key) => {
    if (companyData[key] !== null && companyData[key] !== undefined) {
      formData.append(key, companyData[key]);
    }
  });

  try {
    await axiosInstance.put("/company/1", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Company information updated successfully");
    fetchCompanyInfo();

    // Dismiss all toast messages after success
    toast.dismiss();
  } catch (error) {
    toast.error("Failed to update company information");
  }
};


  // --- API Functions for Job Settings ---
  const fetchJobData = async (key, endpoint) => {
    try {
      const res = await axiosInstance.get(endpoint);
      setJobData((prev) => ({ ...prev, [key]: res.data?.data || [] }));
    } catch (error) {
      toast.error(`Failed to load ${key}`);
    }
  };

  useEffect(() => {
    const config = jobTabsConfig.find((tab) => tab.key === activeJobTab);
    if (config) {
      fetchJobData(config.key, config.endpoint);
      setSelectedItems((prev) => ({ ...prev, [activeJobTab]: [] }));
    }
  }, [activeJobTab]);

  const handleAddItem = async (key, endpoint) => {
    if (!newItemName[key].trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await axiosInstance.post(endpoint, { name: newItemName[key] });
      toast.success(`${key} added successfully`);
      setNewItemName((prev) => ({ ...prev, [key]: "" }));
      fetchJobData(key, endpoint);
    } catch (error) {
      toast.error(`Failed to add ${key}`);
    }
  };

  // --- Handlers for checkbox selection ---
  const handleSelectItem = (key, id) => {
    setSelectedItems((prev) => {
      const currentSelection = prev[key];
      if (currentSelection.includes(id)) {
        return { ...prev, [key]: currentSelection.filter((itemId) => itemId !== id) };
      } else {
        return { ...prev, [key]: [...currentSelection, id] };
      }
    });
  };

  const handleSelectAll = (key, checked) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: checked ? jobData[key].map((item) => item.id) : [],
    }));
  };

  // --- Handlers for Delete Operations ---
  const handleDeleteClick = (type, id, name, endpoint) => {
    setItemToDelete({ type, id, name, endpoint, isBulk: false });
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    const config = jobTabsConfig.find((tab) => tab.key === activeJobTab);
    if (config && selectedItems[activeJobTab].length > 0) {
      console.log("Items selected for bulk delete:", selectedItems[activeJobTab]);  // Debugging step

      setItemToDelete({
        type: activeJobTab,
        endpoint: config.endpoint,
        isBulk: true,
        ids: selectedItems[activeJobTab],
      });
      setShowDeleteModal(true);
    } else {
      toast.error("No items selected for deletion.");
    }
  };


  // --- Handles both single and bulk delete confirmation ---
  const handleConfirmDelete = async () => {
    const { isBulk, id, endpoint, ids, type } = itemToDelete;

    try {
      if (isBulk) {
        // ✅ Correct bulk delete payload (sending ids array)
        await axiosInstance.delete(`${endpoint}/bulk-delete`, {
          data: { ids: ids }, // Correct format: { "ids": [2,4,6] }
        });

        toast.success(`${ids.length} items deleted successfully`);
        setSelectedItems((prev) => ({ ...prev, [type]: [] }));  // Clear the selected items
      } else {
        // Single delete
        await axiosInstance.delete(`${endpoint}/${id}`);
        toast.success("Item deleted successfully");
      }

      setShowDeleteModal(false);
      setItemToDelete({
        type: "",
        id: null,
        name: "",
        endpoint: "",
        isBulk: false,
        ids: [],
      });

      // 🔄 Refresh the data in the table
      fetchJobData(type, endpoint);
    } catch (error) {
      toast.error("Failed to delete items");
    }
  };



  return (
    <Container fluid className="py-4 min-vh-100">
      <ToastContainer position="top-right" />
      <h4 className="fw-bold mb-4">Settings</h4>

      <Tab.Container defaultActiveKey="company">
        <Nav variant="tabs" className="mb-4 flex-column flex-md-row">
          <Nav.Item>
            <Nav.Link eventKey="company">Company Info</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="jobs">Job Settings</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="tax">Tax Settings</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="numbers" onClick={fetchSequences}>Number Settings</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* ================= COMPANY INFO ================= */}
          <Tab.Pane eventKey="company">
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body>
                <h5 className="fw-bold mb-4">Company Information</h5>

                <Form.Label>Company Logo</Form.Label>
                <div className="border rounded mb-2 p-3 text-center bg-light" style={{ width: '522px', height: '65px', overflow: 'hidden' }}>
                  {companyData.company_logo ? (
                    <img
                      src={companyData.company_logo}
                      alt="Logo"
                      style={{
                        width: '100%',       // Stretch the image to fit the container's width
                        height: '100%',      // Stretch the image to fit the container's height
                        objectFit: 'contain' // Ensure the image maintains its aspect ratio while fitting
                      }}
                    />
                  ) : (
                    "Logo Preview (522 × 65)"
                  )}
                </div>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Form.Control
                    type="file"
                    onChange={(e) => handleFileChange(e, "company_logo")}
                  />
                  <small className="text-muted">{logoFileName}</small>
                </div>

                <Form.Label>Company Stamp</Form.Label>
                <div className="border rounded mb-2 p-3 text-center bg-light" style={{ width: '169px', height: '113px', overflow: 'hidden' }}>
                  {companyData.company_stamp ? (
                    <img
                      src={companyData.company_stamp}
                      alt="Stamp"
                      style={{
                        width: '100%',       // Stretch the image to fit the container's width
                        height: '100%',      // Stretch the image to fit the container's height
                        objectFit: 'contain' // Ensure the image maintains its aspect ratio while fitting
                      }}
                    />
                  ) : (
                    "Stamp Preview (169 × 113)"
                  )}
                </div>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Form.Control
                    type="file"
                    onChange={(e) => handleFileChange(e, "company_stamp")}
                  />
                  <small className="text-muted">{stampFileName}</small>
                </div>

                <Row className="g-3">
                  <Col md={6}><Form.Label>Company Name</Form.Label><Form.Control name="company_name" value={companyData.company_name} onChange={handleCompanyInputChange} /></Col>
                  <Col md={6}><Form.Label>Industry</Form.Label><Form.Control name="industry" value={companyData.industry} onChange={handleCompanyInputChange} /></Col>
                  <Col xs={12}><Form.Label>Address</Form.Label><Form.Control name="address" value={companyData.address} onChange={handleCompanyInputChange} /></Col>
                  <Col md={6}><Form.Label>TRN</Form.Label><Form.Control name="trn" value={companyData.trn} onChange={handleCompanyInputChange} /></Col>
                  <Col md={6}><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={companyData.email} onChange={handleCompanyInputChange} /></Col>
                  <Col md={6}><Form.Label>Phone</Form.Label><Form.Control name="phone" value={companyData.phone} onChange={handleCompanyInputChange} /></Col>
                </Row>

                <hr className="my-4" />
                <h6 className="fw-bold mb-3">Bank Account Information</h6>
                <Row className="g-3">
                  <Col md={6}><Form.Label>Account Name</Form.Label><Form.Control name="bank_account_name" value={companyData.bank_account_name} onChange={handleCompanyInputChange} /></Col>
                  <Col md={6}><Form.Label>Bank Name</Form.Label><Form.Control name="bank_name" value={companyData.bank_name} onChange={handleCompanyInputChange} /></Col>
                  <Col md={6}><Form.Label>IBAN</Form.Label><Form.Control name="iban" value={companyData.iban} onChange={handleCompanyInputChange} /></Col>
                  <Col md={6}><Form.Label>SWIFT Code</Form.Label><Form.Control name="swift_code" value={companyData.swift_code} onChange={handleCompanyInputChange} /></Col>
                </Row>

                <div className="text-end mt-4">
                  <Button variant="primary" onClick={handleSaveCompanyInfo}>Save Company Info</Button>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* ================= JOB SETTINGS ================= */}
          <Tab.Pane eventKey="jobs">
            <Card className="border-0 shadow-sm rounded-4 mt-3">
              <Card.Body>
                <Tab.Container activeKey={activeJobTab} onSelect={(k) => setActiveJobTab(k)}>
                  <Nav variant="pills" className="mb-3 flex-column flex-md-row">
                    {jobTabsConfig.map((tab) => (
                      <Nav.Item key={tab.key}>
                        <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>

                  <Tab.Content>
                    {jobTabsConfig.map((tab) => (
                      <Tab.Pane eventKey={tab.key} key={tab.key}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold mb-0">{tab.title}</h6>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={handleBulkDeleteClick}
                            disabled={selectedItems[tab.key].length === 0}
                          >
                            <FaTrash /> Delete Selected ({selectedItems[tab.key].length})
                          </Button>
                        </div>

                        <Table bordered hover responsive>
                          <thead className="table-light">
                            <tr>
                              <th width="50">
                                <Form.Check
                                  checked={jobData[tab.key].length > 0 && selectedItems[tab.key].length === jobData[tab.key].length}
                                  onChange={(e) => handleSelectAll(tab.key, e.target.checked)}
                                />
                              </th>
                              <th>{tab.title}</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jobData[tab.key].map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <Form.Check
                                    checked={selectedItems[tab.key].includes(item.id)}
                                    onChange={() => handleSelectItem(tab.key, item.id)}
                                  />
                                </td>
                                <td>{item.name}</td>
                                <td className="text-end">
                                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(tab.key, item.id, item.name, tab.endpoint)}>
                                    <FaTrash />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <div className="d-flex gap-2 mt-3 flex-column flex-md-row">
                          <Form.Control placeholder={`Add new ${tab.title}`} value={newItemName[tab.key]} onChange={(e) => setNewItemName((prev) => ({ ...prev, [tab.key]: e.target.value }))} />
                          <Button variant="primary" style={{ whiteSpace: "nowrap" }} onClick={() => handleAddItem(tab.key, tab.endpoint)}><FaPlus /> Add</Button>
                        </div>
                      </Tab.Pane>
                    ))}
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* ================= TAX SETTINGS ================= */}
          <Tab.Pane eventKey="tax">
            <TaxSettings />
          </Tab.Pane>

          {/* ================= NUMBER SETTINGS ================= */}
          <Tab.Pane eventKey="numbers">
            <Card className="border-0 shadow-sm rounded-4 mt-3">
              <Card.Body>
                <h5 className="fw-bold mb-4">Number Sequence Settings</h5>
                <p className="text-muted mb-4">
                  Set the default starting number for each document type. This number is used when no existing records are found in the database.
                </p>
                <Table bordered hover responsive>
                  <thead className="table-light">
                    <tr>
                      <th>Document Type</th>
                      <th>Sequence Key</th>
                      <th>Default Start Number</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sequences.map((seq) => (
                      <tr key={seq.id}>
                        <td className="fw-semibold">{seq.label}</td>
                        <td><code>{seq.sequence_key}</code></td>
                        <td style={{ maxWidth: "200px" }}>
                          <Form.Control
                            type="number"
                            value={
                              editedSequences[seq.id] !== undefined
                                ? editedSequences[seq.id]
                                : seq.default_start
                            }
                            onChange={(e) =>
                              handleSequenceChange(seq.id, e.target.value)
                            }
                          />
                        </td>
                        <td className="text-end">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveSequence(seq.id)}
                            disabled={editedSequences[seq.id] === undefined}
                          >
                            Save
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {itemToDelete.isBulk
            ? `Are you sure you want to delete the selected ${itemToDelete.ids.length} items?`
            : `Are you sure you want to delete "${itemToDelete.name}"?`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminSetting;