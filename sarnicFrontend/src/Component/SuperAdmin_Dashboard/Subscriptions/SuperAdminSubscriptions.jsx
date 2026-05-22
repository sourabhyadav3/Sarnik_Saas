import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Badge, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { FaSearch, FaFilter, FaPlus, FaCalendarAlt, FaBan, FaCheck, FaEdit, FaCreditCard } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  fetchSaasSubscriptions,
  createSaasSubscription,
  updateSaasSubscription,
  fetchSaasCompanies
} from "../../../api/superadminApi";

const PLANS = [
  { name: "Basic", price: 29.00 },
  { name: "Pro", price: 99.00 },
  { name: "Enterprise", price: 299.00 }
];

const SuperAdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    company_id: "",
    plan_name: "Basic",
    price: 29.00,
    status: "active",
    start_date: new Date().toISOString().split("T")[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  });

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    company_name: "",
    plan_name: "",
    price: 0,
    status: "",
    start_date: "",
    expiry_date: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsData, companiesData] = await Promise.all([
        fetchSaasSubscriptions(),
        fetchSaasCompanies()
      ]);
      setSubscriptions(subsData);
      setCompanies(companiesData);
    } catch (err) {
      toast.error("Failed to load subscription data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.company_id) {
      toast.warning("Please select a company");
      return;
    }
    try {
      const res = await createSaasSubscription(createForm);
      if (res.success) {
        toast.success(res.message || "Subscription created successfully");
        setShowCreateModal(false);
        // Reset form
        setCreateForm({
          company_id: "",
          plan_name: "Basic",
          price: 29.00,
          status: "active",
          start_date: new Date().toISOString().split("T")[0],
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        });
        loadData();
      } else {
        toast.error(res.message || "Failed to create subscription");
      }
    } catch (err) {
      toast.error("Error creating subscription");
      console.error(err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateSaasSubscription(editForm.id, {
        plan_name: editForm.plan_name,
        price: editForm.price,
        status: editForm.status,
        start_date: editForm.start_date,
        expiry_date: editForm.expiry_date
      });
      if (res.success) {
        toast.success(res.message || "Subscription updated successfully");
        setShowEditModal(false);
        loadData();
      } else {
        toast.error(res.message || "Failed to update subscription");
      }
    } catch (err) {
      toast.error("Error updating subscription");
      console.error(err);
    }
  };

  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === "active" ? "suspended" : "active";
    try {
      const res = await updateSaasSubscription(sub.id, { status: newStatus });
      if (res.success) {
        toast.success(`Subscription ${newStatus === "active" ? "activated" : "suspended"} successfully`);
        loadData();
      } else {
        toast.error(res.message || "Action failed");
      }
    } catch (err) {
      toast.error("Network communication error");
      console.error(err);
    }
  };

  const handleRenewOneMonth = async (sub) => {
    const currentExpiry = new Date(sub.expiry_date);
    const baseDate = currentExpiry < new Date() ? new Date() : currentExpiry;
    const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    try {
      const res = await updateSaasSubscription(sub.id, {
        expiry_date: newExpiry,
        status: "active"
      });
      if (res.success) {
        toast.success(`Plan extended successfully until ${newExpiry}`);
        loadData();
      } else {
        toast.error(res.message || "Renewal failed");
      }
    } catch (err) {
      toast.error("Network communication error");
      console.error(err);
    }
  };

  const openEditModal = (sub) => {
    setEditForm({
      id: sub.id,
      company_name: sub.company_name,
      plan_name: sub.plan_name,
      price: sub.price,
      status: sub.status,
      start_date: sub.start_date,
      expiry_date: sub.expiry_date
    });
    setShowEditModal(true);
  };

  const handlePlanChange = (val, isEdit) => {
    const matched = PLANS.find(p => p.name === val);
    const price = matched ? matched.price : 0;
    if (isEdit) {
      setEditForm(prev => ({ ...prev, plan_name: val, price }));
    } else {
      setCreateForm(prev => ({ ...prev, plan_name: val, price }));
    }
  };

  // Filters
  const filteredSubs = subscriptions.filter(sub => {
    const companyMatch = sub.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const planMatch = planFilter === "all" || sub.plan_name.toLowerCase() === planFilter.toLowerCase();
    const statusMatch = statusFilter === "all" || sub.status.toLowerCase() === statusFilter.toLowerCase();
    return companyMatch && planMatch && statusMatch;
  });

  return (
    <div className="container-fluid py-4 min-vh-100 bg-light bg-opacity-50">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark">SaaS Subscriptions</h3>
          <p className="text-secondary mb-0">Manage customer billing plans, activation status & renewals</p>
        </div>
        <Button
          variant="primary"
          className="rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> New Subscription
        </Button>
      </div>

      {/* Filter Header Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <Row className="g-3 align-items-center">
          <Col md={6}>
            <InputGroup className="border rounded-pill overflow-hidden bg-light">
              <InputGroup.Text className="bg-transparent border-0 ps-3">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by company name..."
                className="bg-transparent border-0 shadow-none py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <InputGroup className="border rounded-pill overflow-hidden bg-light">
              <InputGroup.Text className="bg-transparent border-0 ps-3">
                <FaFilter className="text-muted" />
              </InputGroup.Text>
              <Form.Select
                className="bg-transparent border-0 shadow-none py-2 ps-1"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="all">All Plans</option>
                <option value="Basic">Basic Plan</option>
                <option value="Pro">Pro Plan</option>
                <option value="Enterprise">Enterprise Plan</option>
              </Form.Select>
            </InputGroup>
          </Col>
          <Col md={3}>
            <InputGroup className="border rounded-pill overflow-hidden bg-light">
              <InputGroup.Text className="bg-transparent border-0 ps-3">
                <FaFilter className="text-muted" />
              </InputGroup.Text>
              <Form.Select
                className="bg-transparent border-0 shadow-none py-2 ps-1"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2 text-secondary">Analyzing subscriptions...</div>
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <FaCreditCard className="mb-3 text-muted" style={{ fontSize: "2.5rem" }} />
            <h5>No subscriptions found</h5>
            <p className="small mb-0">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light text-secondary border-bottom">
              <tr>
                <th className="px-4 py-3 border-0">Company Name</th>
                <th className="py-3 border-0">Subscription Plan</th>
                <th className="py-3 border-0">Billing Cost</th>
                <th className="py-3 border-0">Activation Term</th>
                <th className="py-3 border-0 text-center">Status</th>
                <th className="px-4 py-3 border-0 text-end">Interactive Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: "1px solid #f8f9fa" }}>
                  <td className="px-4 py-3 fw-bold text-dark">{sub.company_name}</td>
                  <td className="py-3">
                    <Badge
                      bg={
                        sub.plan_name === "Enterprise"
                          ? "purple"
                          : sub.plan_name === "Pro"
                          ? "primary"
                          : "secondary"
                      }
                      className="px-3 py-2 rounded-pill font-monospace"
                      style={{
                        backgroundColor:
                          sub.plan_name === "Enterprise"
                            ? "#6f42c1"
                            : sub.plan_name === "Pro"
                            ? "#0d6efd"
                            : "#6c757d"
                      }}
                    >
                      {sub.plan_name}
                    </Badge>
                  </td>
                  <td className="py-3 fw-semibold text-secondary">
                    ${parseFloat(sub.price).toFixed(2)}/mo
                  </td>
                  <td className="py-3 small text-muted">
                    <div>Started: {sub.start_date}</div>
                    <div>Expires: {sub.expiry_date}</div>
                  </td>
                  <td className="py-3 text-center">
                    <Badge
                      bg={
                        sub.status === "active"
                          ? "success"
                          : sub.status === "suspended"
                          ? "warning"
                          : "danger"
                      }
                      className="px-3 py-2 rounded-pill text-capitalize"
                    >
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill d-flex align-items-center gap-1 px-3"
                        onClick={() => openEditModal(sub)}
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="rounded-pill d-flex align-items-center gap-1 px-3"
                        onClick={() => handleRenewOneMonth(sub)}
                      >
                        <FaCalendarAlt /> Renew 30d
                      </Button>
                      <Button
                        variant={sub.status === "active" ? "outline-warning" : "outline-success"}
                        size="sm"
                        className="rounded-pill d-flex align-items-center gap-1 px-3"
                        onClick={() => handleToggleStatus(sub)}
                      >
                        {sub.status === "active" ? (
                          <>
                            <FaBan /> Suspend
                          </>
                        ) : (
                          <>
                            <FaCheck /> Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Create Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered rounded-4>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-dark">Create SaaS Subscription</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Assign Tenant Company</Form.Label>
                  <Form.Select
                    required
                    value={createForm.company_id}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, company_id: e.target.value }))}
                  >
                    <option value="">Select a company...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Licensing Plan</Form.Label>
                  <Form.Select
                    value={createForm.plan_name}
                    onChange={(e) => handlePlanChange(e.target.value, false)}
                  >
                    <option value="Basic">Basic Plan</option>
                    <option value="Pro">Pro Plan</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Price per Month ($)</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    value={createForm.price}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={createForm.start_date}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={createForm.expiry_date}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Billing Status</Form.Label>
                  <Form.Select
                    value={createForm.status}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-pill px-4 shadow-sm">
              Confirm Subscription
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered rounded-4>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-dark">Modify Subscription</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <div className="mb-3 p-3 bg-light rounded-3">
              <small className="text-secondary fw-semibold">Company Account</small>
              <h5 className="mb-0 fw-bold text-dark">{editForm.company_name}</h5>
            </div>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Licensing Plan</Form.Label>
                  <Form.Select
                    value={editForm.plan_name}
                    onChange={(e) => handlePlanChange(e.target.value, true)}
                  >
                    <option value="Basic">Basic Plan</option>
                    <option value="Pro">Pro Plan</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Price per Month ($)</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={editForm.start_date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={editForm.expiry_date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Billing Status</Form.Label>
                  <Form.Select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-pill px-4 shadow-sm">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default SuperAdminSubscriptions;
