import { useState } from "react";
import CostEstimates from "../finance/CostEstimates";
import ReceivablePO from "../finance/ReceivablePO";
import Invoicing from "../finance/Invoicing";

export default function FinanceTab({ projectId }) {

  // user role from localStorage
const userRole = localStorage.getItem("role");
console.log("User Role:", userRole);


  // 🔒 Admin ke alawa kisi ko bhi section nahi dikhega
  if (userRole !== "admin") {
    return null; // ya <></>
  }

  const [tab, setTab] = useState("cost");

  return (
    <div>
      <div className="flex gap-4 mb-4">
        {["cost", "po", "invoice"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded border ${
              tab === t ? "bg-blue-600 text-primary" : ""
            }`}
          >
            {t === "cost"
              ? "Cost Estimates"
              : t === "po"
              ? "Receivable PO"
              : "Invoicing"}
          </button>
        ))}
      </div>

      {tab === "cost" && <CostEstimates projectId={projectId} />}
      {tab === "po" && <ReceivablePO projectId={projectId} />}
      {tab === "invoice" && <Invoicing projectId={projectId} />}
    </div>
  );
}
