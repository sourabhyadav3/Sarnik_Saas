  // import React, { useEffect, useState } from "react";
  // import axiosInstance from "../../../../../api/axiosInstance";
  // import { formatDDMMYYYY } from "../../../../../Common/DateFormate/dateFormat";

  // export default function OverviewTab({ projectId }) {
  //   //-----------------------------
  //   // user role from local storage
  //   //-----------------------------
  //   const userRole = localStorage.getItem("role");

  //   //-----------------------------
  //   // STATE
  //   //-----------------------------
  //   const [overview, setOverview] = useState(null);
  //   const [loading, setLoading] = useState(true);

  //   //-----------------------------
  //   // FETCH PROJECT OVERVIEW
  //   //-----------------------------
  //   useEffect(() => {
  //     const fetchOverview = async () => {
  //       try {
  //         const res = await axiosInstance.get(
  //           `/projects/overview/${projectId}`
  //         );

  //         if (res.data.success) {
  //           setOverview(res.data.data);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching project overview", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     if (projectId) {
  //       fetchOverview();
  //     }
  //   }, [projectId]);

  //   //-----------------------------
  //   // LOADING STATE
  //   //-----------------------------
  //   if (loading) {
  //     return <div className="p-4">Loading project overview...</div>;
  //   }

  //   if (!overview) {
  //     return <div className="p-4 text-muted">No data available</div>;
  //   }

  //   //-----------------------------
  //   // DESTRUCTURE RESPONSE
  //   //-----------------------------
  //   const {
  //     in_progress,
  //     days_remaining,
  //     due_date,
  //     jobs_due_today,
  //     total_hours,
  //     purchase_orders,
  //     recent_activity,
  //   } = overview;

  //   return (
  //     <div>
  //       {/* ================= TOP KPI CARDS ================= */}
  //       <div className="row g-4 mb-4">
  //         <div className="col-md-3">
  //           <div className="card border-0 shadow-sm rounded-4 h-100">
  //             <div className="card-body">
  //               <p className="text-muted mb-1">In Progress</p>
  //               <h3 className="fw-bold mb-2">{in_progress || 0}</h3>
  //               <div className="border-bottom border-primary border-2 w-100" />
  //             </div>
  //           </div>
  //         </div>

  //         <div className="col-md-3">
  //           <div className="card border-0 shadow-sm rounded-4 h-100">
  //             <div className="card-body">
  //               <p className="text-muted mb-1">Days Remaining</p>
  //               <h3 className="fw-bold mb-1">{days_remaining || 0}</h3>
  //               <small className="text-muted">
  //                 Due: {due_date ? formatDDMMYYYY(due_date) : "-"}
  //               </small>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="col-md-3">
  //           <div className="card border-0 shadow-sm rounded-4 h-100">
  //             <div className="card-body">
  //               <p className="text-muted mb-1">Jobs Due Today</p>
  //               <h3 className="fw-bold text-success">
  //                 {jobs_due_today || 0}
  //               </h3>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="col-md-3">
  //           <div className="card border-0 shadow-sm rounded-4 h-100">
  //             <div className="card-body">
  //               <p className="text-muted mb-1">Total Hours</p>
  //               <h3 className="fw-bold">{total_hours || "00:00"}</h3>
  //               <small className="text-muted">Logged</small>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* ================= ACTIVITY + PURCHASE ORDERS ================= */}
  //       <div className="row g-4 mb-4">
  //         {/* -------- Recent Activity -------- */}
  //         <div className="col-md-6">
  //           <div className="card border-0 shadow-sm rounded-4 h-100">
  //             <div className="card-body">
  //               <h6 className="fw-bold mb-3">Recent Activity</h6>

  //               {recent_activity && recent_activity.length > 0 ? (
  //                 recent_activity.map((item, index) => (
  //                   <div key={index} className="mb-3">
  //                     <div className="fw-semibold">
  //                       • {item.activity}
  //                     </div>
  //                     <small className="text-muted">
  //                       {formatDDMMYYYY(item.created_at)}
  //                     </small>
  //                   </div>
  //                 ))
  //               ) : (
  //                 <p className="text-muted mb-0">No recent activity</p>
  //               )}
  //             </div>
  //           </div>
  //         </div>

  //         {/* -------- Purchase Orders (Admin Only) -------- */}
  //         {userRole === "admin" && (
  //           <div className="col-md-6">
  //             <div className="card border-0 shadow-sm rounded-4 h-100">
  //               <div className="card-body">
  //                 <h6 className="fw-bold mb-4">Purchase Orders</h6>

  //                 <div className="row text-center">
  //                   <div className="col-md-4">
  //                     <h4 className="fw-bold mb-1">
  //                       {purchase_orders?.total_pos || 0}
  //                     </h4>
  //                     <small className="text-muted">Total POs</small>
  //                   </div>

  //                   <div className="col-md-4">
  //                     <h4 className="fw-bold mb-1">
  //                       {purchase_orders?.received || 0}
  //                     </h4>
  //                     <small className="text-muted">Received</small>
  //                   </div>

  //                   <div className="col-md-4">
  //                     <h4 className="fw-bold mb-1">
  //                       {purchase_orders?.issued || 0}
  //                     </h4>
  //                     <small className="text-muted">Issued</small>
  //                   </div>
  //                 </div>

  //                 <div className="mt-3 text-center">
  //                   <h4 className="fw-bold mb-1">
  //                   {overview?.currency }{" "}
  //                   {overview?.budget || "0.00"}
  //                   </h4>
  //                   <small className="text-muted">Total Value</small>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }






  import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../../api/axiosInstance";
import { formatDDMMYYYY } from "../../../../../Common/DateFormate/dateFormat";
import { formatCurrencyAmount } from "../../../../../Common/Currency/currencyHelper";

export default function OverviewTab({ projectId }) {
  //-----------------------------
  // user role from local storage
  //-----------------------------
  const userRole = localStorage.getItem("role");

  //-----------------------------
  // STATE
  //-----------------------------
  const [overview, setOverview] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  //-----------------------------
  // FETCH PROJECT OVERVIEW
  //-----------------------------
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await axiosInstance.get(`/projects/${projectId}`);
        if (res.data.success) {
          setProjectDetails(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching project details", error);
      }
    };

    const fetchOverview = async () => {
      try {
        const res = await axiosInstance.get(
          `/projects/overview/${projectId}`
        );

        if (res.data.success) {
          setOverview(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching project overview", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
      fetchOverview();
    }
  }, [projectId]);

  //-----------------------------
  // LOADING STATE
  //-----------------------------
  if (loading) {
    return <div className="p-4">Loading project overview...</div>;
  }

  if (!overview) {
    return <div className="p-4 text-muted">No data available</div>;
  }

  //-----------------------------
  // DESTRUCTURE RESPONSE
  //-----------------------------
  const {
    in_progress,
    days_remaining,
    due_date,
    jobs_due_today,
    total_hours,
    purchase_orders,
    recent_activity,
  } = overview;

  return (
    <div>
      {/* ================= TOP KPI CARDS ================= */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">In Progress</p>
              <h3 className="fw-bold mb-2">{in_progress || 0}</h3>
              <div className="border-bottom border-primary border-2 w-100" />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Days Remaining</p>
              <h3 className="fw-bold mb-1">{days_remaining || 0}</h3>
              <small className="text-muted">
                Due: {due_date ? formatDDMMYYYY(due_date) : "-"}
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Jobs Due Today</p>
              <h3 className="fw-bold text-success">
                {jobs_due_today || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Total Hours</p>
              <h3 className="fw-bold">{total_hours || "00:00"}</h3>
              <small className="text-muted">Logged</small>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACTIVITY + PURCHASE ORDERS ================= */}
      <div className="row g-4 mb-4">
        {/* -------- Recent Activity -------- */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Recent Activity</h6>

              {recent_activity && recent_activity.length > 0 ? (
                recent_activity.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="fw-semibold">
                      • {item.activity}
                    </div>
                    <small className="text-muted">
                      {formatDDMMYYYY(item.created_at)}
                    </small>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* -------- Purchase Orders (Admin Only) -------- */}
        {userRole === "admin" && (
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-4">Purchase Orders</h6>

                <div className="row text-center">
                  {/* <div className="col-md-4">
                    <h4 className="fw-bold mb-1">
                      {purchase_orders?.total_pos || 0}
                    </h4>
                    <small className="text-muted">Total POs</small>
                  </div> */}

                  <div className="col-md-4">
                    <h4 className="fw-bold mb-1">
                      {purchase_orders?.received || 0}
                    </h4>
                    <small className="text-muted">Received</small>
                  </div>

                  <div className="col-md-4">
                    <h4 className="fw-bold mb-1">
                      {purchase_orders?.issued || 0}
                    </h4>
                    <small className="text-muted">Issued</small>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <h4 className="fw-bold mb-1">
                    {projectDetails?.currency || overview?.currency || "USD"}{" "}
                    {formatCurrencyAmount(projectDetails?.budget || "0.00")}
                  </h4>
                  <small className="text-muted">Total Value</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}