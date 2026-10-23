import React, { useState, useEffect } from 'react';
import { Ticket, Plus, ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle, Calendar, Tag, FileText } from 'lucide-react';

function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tickets when component mounts 
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get userId from localStorage or use default
      const userId = localStorage.getItem('userId') || '69034c0e60c1777de040024f';

      const requestOptions = {
        method: "GET",
        
      };

      const response = await fetch(
        `http://192.168.1.20:3000/getTicketsByUser/${userId}`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const result = await response.json();
      console.log('Fetched Tickets:', result);

      // Parse based on your API response structure
      if (result.tickets && Array.isArray(result.tickets)) {
        setTickets(result.tickets);
      } else if (result.data && Array.isArray(result.data)) {
        setTickets(result.data);
      } else if (Array.isArray(result)) {
        setTickets(result);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    // Navigate to raise ticket page
    window.location.href = "/raise-ticket";
  };

  const handleBack = () => {
    window.history.back();
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === 'open' || statusLower === 'pending') {
      return <Clock size={20} className="text-orange-600" />;
    } else if (statusLower === 'in progress' || statusLower === 'inprogress') {
      return <AlertCircle size={20} className="text-blue-600" />;
    } else if (statusLower === 'resolved' || statusLower === 'closed') {
      return <CheckCircle size={20} className="text-green-600" />;
    } else if (statusLower === 'cancelled') {
      return <XCircle size={20} className="text-red-600" />;
    }
    return <Ticket size={20} className="text-gray-600" />;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === 'open' || statusLower === 'pending') {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    } else if (statusLower === 'in progress' || statusLower === 'inprogress') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    } else if (statusLower === 'resolved' || statusLower === 'closed') {
      return 'bg-green-100 text-green-700 border-green-200';
    } else if (statusLower === 'cancelled') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase() || '';
    
    if (priorityLower === 'high' || priorityLower === 'urgent') {
      return 'bg-red-50 text-red-700 border-red-200';
    } else if (priorityLower === 'medium') {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    } else if (priorityLower === 'low') {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
<div className="bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white px-6 py-6 shadow-lg">
  <div className="max-w-6xl mx-auto flex items-center gap-4">
    <button 
      onClick={handleBack}
      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
    >
      <ArrowLeft size={24} />
    </button>
    <div className="flex-1">
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      <p className="text-blue-100 text-sm mt-1">View and manage your support requests</p>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Create New Ticket Button */}
       <button
  onClick={handleCreateTicket}
  className="w-full bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] 
             text-white py-4 rounded-xl flex items-center justify-center 
             gap-3 font-semibold text-lg hover:shadow-lg hover:scale-[1.02] 
             transition-all mb-8"
>
  <div className="bg-white/20 rounded-full p-1.5">
    <Plus size={22} />
  </div>
  Create New Support Ticket
</button>


        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">{error}</p>
            <button 
              onClick={fetchTickets}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* My Tickets Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Ticket size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Tickets</h2>
                <p className="text-sm text-gray-500">All your support requests</p>
              </div>
            </div>
            {tickets.length > 0 && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-lg font-bold text-blue-700">{tickets.length}</span>
                <span className="text-sm text-blue-600 ml-1">
                  {tickets.length === 1 ? 'ticket' : 'tickets'}
                </span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your tickets...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && tickets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-6">
                <Ticket size={64} strokeWidth={1.5} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No tickets found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                You haven't created any support tickets yet. Click the button above to create your first ticket.
              </p>
            </div>
          )}

          {/* Tickets List */}
          {!loading && tickets.length > 0 && (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-xl mb-2">
                          {ticket.subject || 'Untitled Ticket'}
                        </h3>
                        <p className="text-gray-700 text-base leading-relaxed mb-4">
                          {ticket.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border ${getStatusColor(ticket.status)}`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {ticket.status || 'Pending'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border ${getPriorityColor(ticket.priority)}`}>
                      <Tag size={14} />
                      {ticket.priority || 'Medium'} Priority
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    {/* Vehicle Type */}
                    {ticket.vehicleType && (
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-100 p-1.5 rounded-md mt-0.5">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Vehicle Type</p>
                          <p className="text-sm font-semibold text-gray-900">{ticket.vehicleType}</p>
                        </div>
                      </div>
                    )}

                    {/* Created Date */}
                    {ticket.createdAt && (
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-100 p-1.5 rounded-md mt-0.5">
                          <Calendar size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Created</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(ticket.createdAt)}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(ticket.createdAt)}</p>
                        </div>
                      </div>
                    )}

                    {/* Booking ID */}
                    {ticket.bookingId && (
                      <div className="flex items-start gap-2">
                        <div className="bg-green-100 p-1.5 rounded-md mt-0.5">
                          <FileText size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Booking ID</p>
                          <p className="text-sm font-semibold text-gray-900 font-mono">
                            {ticket.bookingId.slice(-8)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ticket ID */}
                    {ticket._id && (
                      <div className="flex items-start gap-2">
                        <div className="bg-orange-100 p-1.5 rounded-md mt-0.5">
                          <Tag size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Ticket ID</p>
                          <p className="text-sm font-semibold text-gray-900 font-mono">
                            #{ticket._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Section */}
                  {ticket.review && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Review</p>
                        <p className="text-sm text-gray-700">{ticket.review}</p>
                        {ticket.reviewDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Reviewed on {formatDateTime(ticket.reviewDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupportTicketsPage;