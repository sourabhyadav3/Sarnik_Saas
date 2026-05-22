import React from "react";

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "complete":
      return "bg-success";            // 🟢
    case "reject":
      return "bg-danger";             // 🔴
    case "in_progress":
      return "bg-warning text-dark";  // 🟡
    case "return":
      return "bg-info text-dark";     // 🔵
    default:
      return "bg-secondary";
  }
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`badge ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );
};



export const getStatusColor = (status = "") => {
  const normalizedStatus = status
    .toLowerCase()
    .replace(/\s+/g, "_");

  switch (normalizedStatus) {
    case "complete":
    case "completed":        // ✅ FIX
      return "#198754"; // green

    case "in_progress":
      return "#ffc107"; // yellow

    case "active":
      return "#0d6efd"; // blue

    case "hold":
      return "#adb5bd"; // grey

    case "cancelled":
      return "#dc3545"; // red

    case "closed":
      return "#6f42c1"; // purple

    case "return":
      return "#0dcaf0"; // info

    default:
      return "#6c757d"; // secondary
  }
};



export default StatusBadge;
