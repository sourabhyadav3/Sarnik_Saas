// src/components/TaxSettings.js
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Card,
  Modal,
} from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../api/axiosInstance";


const TaxSettings = () => {
  const [taxCategories, setTaxCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxRate, setNewTaxRate] = useState("0");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchTaxCategories = async () => {
    try {
      const res = await axiosInstance.get("/taxcategory");
      setTaxCategories(res.data?.data || []);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load tax categories");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxCategories();
  }, []);

  const handleAddTaxCategory = async () => {
    if (!newTaxName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      await axiosInstance.post("/taxcategory", {
        category_name: newTaxName,
        tax_rate: parseFloat(newTaxRate),
      });
      toast.success("Tax category added successfully");
      setShowAddTaxModal(false);
      setNewTaxName("");
      setNewTaxRate("0");
      fetchTaxCategories();
    } catch (error) {
      toast.error("Failed to add tax category");
    }
  };

  const handleDeleteClick = (category) => {
    setItemToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axiosInstance.delete(`/taxcategory/${itemToDelete.id}`);
      toast.success("Tax category deleted successfully");
      setShowDeleteModal(false);
      setItemToDelete(null);
      fetchTaxCategories();
    } catch (error) {
      toast.error("Failed to delete tax category");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">Tax Categories</h5>
            <Button variant="primary" onClick={() => setShowAddTaxModal(true)}>
              Add Tax Category
            </Button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            taxCategories.map((category) => (
              <Row key={category.id} className="align-items-center mb-3">
                <Col md={5} className="mb-2 mb-md-0">
                  <Form.Label visuallyHidden>Category Name</Form.Label>
                  <Form.Control type="text" value={category.category_name} readOnly />
                </Col>
                <Col md={5} className="mb-2 mb-md-0">
                  <Form.Label visuallyHidden>Rate (%)</Form.Label>
                  <Form.Control type="number" value={category.tax_rate} readOnly />
                </Col>
                <Col md={2} className="text-md-end">
                  <Button variant="outline-danger" onClick={() => handleDeleteClick(category)}>
                    <FaTrash /> 
                  </Button>
                </Col>
              </Row>
            ))
          )}
        </Card.Body>
      </Card>

      <Modal show={showAddTaxModal} onHide={() => setShowAddTaxModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Tax Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control type="text" placeholder="e.g., VAT 5%" value={newTaxName} onChange={(e) => setNewTaxName(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tax Rate (%)</Form.Label>
            <Form.Control type="number" value={newTaxRate} onChange={(e) => setNewTaxRate(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddTaxModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddTaxCategory}>Add Category</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete "{itemToDelete?.category_name}"?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TaxSettings;