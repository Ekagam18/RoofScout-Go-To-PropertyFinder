import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

function AdmInvoice() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get bill from AdmPayment
  const selectedBill = location.state?.bill;

  if (!selectedBill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl text-red-500 dark:text-red-300">
          No bill selected!
        </h1>
      </div>
    );
  }

  // Theme
  const [theme, setTheme] = useTheme();

  // ============================
  //    Update Bill Status
  // ============================
  const updateStatus = (newStatus) => {
    const bills = JSON.parse(localStorage.getItem("bills")) || [];

    const updated = bills.map((b) =>
      b.id === selectedBill.id ? { ...b, status: newStatus } : b
    );

    localStorage.setItem("bills", JSON.stringify(updated));

    selectedBill.status = newStatus; // update UI
    alert(`Bill marked as ${newStatus}`);
  };

  // ============================
  //       Delete Bill
  // ============================
  const deleteBill = () => {
    const bills = JSON.parse(localStorage.getItem("bills")) || [];

    const updated = bills.filter((b) => b.id !== selectedBill.id);

    localStorage.setItem("bills", JSON.stringify(updated));

    alert("Bill deleted successfully!");

    navigate("/AdmPayment");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition">

      {/* NAVBAR */}
      <div className="flex justify-between items-center bg-gray-700 dark:bg-gray-800 text-white p-4 shadow">
        <div className="flex items-center space-x-3">
          <img src="/logoRS.jpg" className="h-10 w-10 rounded-full" alt="logo" />
          <h1 className="text-xl font-bold">
            <span className="text-yellow-500">Roof</span>
            <span className="text-blue-400">Scout</span>
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="p-2 border rounded"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="#" onClick={(e) => { e.preventDefault(); import("../supabase").then(({ localAuth }) => { localAuth.signOut(); localStorage.removeItem("role"); window.location.href = "/login"; }); }} className="hover:underline">Logout</Link>
        </div>
      </div>

      {/* INVOICE BOX */}
      <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-800 shadow-xl p-8 rounded-xl">
        <h1 className="text-3xl font-semibold mb-6">INVOICE</h1>

        <div className="mb-6 text-gray-700 dark:text-gray-300 space-y-1">
          <p>
            <strong>Invoice No:</strong> {selectedBill.id}
          </p>
          <p>
            <strong>Period:</strong> {selectedBill.from} → {selectedBill.to}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                selectedBill.status === "Paid"
                  ? "text-green-500 font-bold"
                  : "text-red-500 font-bold"
              }
            >
              {selectedBill.status}
            </span>
          </p>
        </div>

        {/* TABLE */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-left">
              <th className="p-2">Description</th>
              <th className="p-2">Rate</th>
              <th className="p-2">Time</th>
              <th className="p-2">Price</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-2">House Rent</td>
              <td className="p-2">₹{selectedBill.amount.toFixed(2)}</td>
              <td className="p-2">1 Month</td>
              <td className="p-2">₹{selectedBill.amount.toFixed(2)}</td>
            </tr>

            <tr>
              <td className="p-2">Late Fee</td>
              <td className="p-2">₹0.00</td>
              <td className="p-2">0 Days</td>
              <td className="p-2">₹0.00</td>
            </tr>
          </tbody>

          <tfoot>
            <tr className="border-t">
              <td colSpan="3" className="text-right p-2 font-semibold">
                Total Amount
              </td>
              <td className="p-2 font-semibold">
                ₹{selectedBill.amount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap justify-between items-center mt-4 gap-3">

          <button
            onClick={() => navigate("/AdmPayment")}
            className="text-blue-600 hover:underline"
          >
            ← Back to Bills
          </button>

          <div className="flex gap-3 flex-wrap">

            <button
              onClick={() => updateStatus("Paid")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Mark as Paid
            </button>

            <button
              onClick={() => updateStatus("Unpaid")}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Mark as Unpaid
            </button>

            <button
              onClick={deleteBill}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete Bill
            </button>

            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Print Invoice
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default AdmInvoice;
