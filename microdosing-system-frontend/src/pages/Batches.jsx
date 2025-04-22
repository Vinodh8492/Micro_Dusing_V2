import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';  // Add this!

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', startDate: '' });
  const [filteredBatches, setFilteredBatches] = useState([]);
  const navigate = useNavigate();  // Hook for navigation

  const statusStyle = {
    pending: 'bg-yellow-200 text-yellow-800',
    in_progress: 'bg-blue-200 text-blue-800',
    completed: 'bg-green-200 text-green-800',
    failed: 'bg-red-200 text-red-800',
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/batches');
      setBatches(response.data);
      setFilteredBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
      Swal.fire('Error', 'Could not load batches.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    let updatedBatches = [...batches];
    if (newFilters.status) {
      updatedBatches = updatedBatches.filter(batch => batch.status === newFilters.status);
    }
    if (newFilters.startDate) {
      updatedBatches = updatedBatches.filter(batch => batch.start_time?.startsWith(newFilters.startDate));
    }
    setFilteredBatches(updatedBatches);
  };

  const clearFilters = () => {
    setFilters({ status: '', startDate: '' });
    setFilteredBatches(batches);
  };

  const handleView = (batch) => {
    const batchDetails = `
      <div style="text-align: left;">
        <p><strong>Batch ID:</strong> ${batch.batch_id}</p>
        <p><strong>Batch Number:</strong> ${batch.batch_number}</p>
        <p><strong>Order ID:</strong> ${batch.order_id}</p>
        <p><strong>Status:</strong> ${batch.status}</p>
        <p><strong>Start Time:</strong> ${batch.start_time || 'N/A'}</p>
        <p><strong>Operator ID:</strong> ${batch.operator_id}</p>
        <p><strong>Notes:</strong> ${batch.notes || 'No notes'}</p>
        <p><strong>Created At:</strong> ${batch.created_at || 'N/A'}</p>
      </div>
    `;
  
    Swal.fire({
      title: 'Batch Details',
      html: batchDetails,
      width: '40%',
      confirmButtonText: 'Close'
    });
  };

  // Edit handler with form popup
  const handleEdit = (batch) => {
    Swal.fire({
      title: `Edit Batch ${batch.batch_id}`,
      html: `
        <form id="editBatchForm" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label class="block text-sm font-medium">Batch Number</label>
            <input type="text" name="batch_number" value="${batch.batch_number}" 
              class="swal2-input" style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 100%;" />
          </div>
          <div>
            <label class="block text-sm font-medium">Order ID</label>
            <input type="text" name="order_id" value="${batch.order_id}" 
              class="swal2-input" style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 100%;" />
          </div>
          <div>
            <label class="block text-sm font-medium">Status</label>
            <select name="status" class="swal2-input" 
              style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 100%;">
              <option value="pending" ${batch.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in_progress" ${batch.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${batch.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="failed" ${batch.status === 'failed' ? 'selected' : ''}>Failed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium">Operator ID</label>
            <input type="text" name="operator_id" value="${batch.operator_id}" 
              class="swal2-input" style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 100%;" />
          </div>
          <div>
            <label class="block text-sm font-medium">Notes</label>
            <textarea name="notes" class="swal2-input" 
              style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 100%; height: 100px;">${batch.notes || ''}</textarea>
          </div>
        </form>
      `,
      width: '50%',
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const form = document.getElementById('editBatchForm');
        const formData = new FormData(form);
        const updatedData = {};
        formData.forEach((value, key) => { updatedData[key] = value; });
        return updatedData;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedBatchData = result.value;
        axios.put(`http://localhost:5000/api/batches/${batch.batch_id}`, updatedBatchData)
          .then(response => {
            Swal.fire('Updated!', response.data.message, 'success');
            setBatches(batches.map(b => 
              b.batch_id === batch.batch_id ? { ...b, ...updatedBatchData } : b
            ));
            setFilteredBatches(filteredBatches.map(b => 
              b.batch_id === batch.batch_id ? { ...b, ...updatedBatchData } : b
            ));
          })
          .catch(error => {
            console.error('Error updating batch:', error);
            Swal.fire('Error!', 'There was an issue updating the batch.', 'error');
          });
      }
    });
  };

  const handleDelete = async (batchId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete Batch ID: ${batchId}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });
    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/batches/${batchId}`);
        setBatches(prev => prev.filter(b => b.batch_id !== batchId));
        setFilteredBatches(prev => prev.filter(b => b.batch_id !== batchId));
        Swal.fire('Deleted!', 'Batch has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting batch:', error);
        Swal.fire('Error', 'Failed to delete batch.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 py-10">
      <h1 className="text-2xl text-black font-bold p-3">Reports</h1>

      <button
        onClick={() => navigate('/create-batch')}  // Navigate to the new page
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
      >
        Create New Batch
      </button>

      <div className="mb-6 bg-gray-100 p-6 rounded-lg flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="border px-4 py-2 rounded bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded overflow-hidden">
            <thead className="bg-gray-100 text-left text-sm font-semibold">
              <tr>
                <th className="p-3">Batch ID</th>
                <th className="p-3">Order Number</th>
                <th className="p-3">Status</th>
                <th className="p-3">Start Time</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredBatches.map(batch => (
                <tr key={batch.batch_id} className="border-t">
                  <td className="p-3">{batch.batch_id}</td>
                  <td className="p-3">{batch.order_id}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[batch.status]}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-3">{batch.start_time || batch.created_at}</td>
                  <td className="p-3">{batch.operator_id}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleView(batch)} className="bg-blue-500 text-white px-3 py-1 rounded">View</button>
                    <button onClick={() => handleEdit(batch)} className="bg-green-500 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(batch.batch_id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Batches;
