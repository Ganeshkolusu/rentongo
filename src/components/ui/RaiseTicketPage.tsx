






import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Image } from 'lucide-react';
import apiService, { TicketFormData } from '../../services/api.service';

function RaiseTicketPage() {
  const [formData, setFormData] = useState<TicketFormData>({
    issue: '',
    vehicle: '',
    description: '',
    name: '',
    mobile: '',
    photos: []
  });
  const [showIssueDropdown, setShowIssueDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const issueOptions = ['Booking issue', 'Payment issue', 'Vehicle issue', 'Driver issue', 'App issue', 'Other'];
  const vehicleOptions = ['Car', 'Bike', 'Auto', 'Other'];

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), ...files] }));
  };

  const handleCreateTicket = async () => {
    if (!formData.issue || !formData.description || !formData.name) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.ticket.createTicket(formData);
      alert('✅ Ticket created successfully!');
      setFormData({ issue: '', vehicle: '', description: '', name: '', mobile: '', photos: [] });
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
      alert('❌ Failed to create ticket: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white px-6 py-4 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            type="button"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-semibold">Raise Ticket</h1>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 h-full">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Issue Dropdown */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">
                  Select Issue <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowIssueDropdown(!showIssueDropdown)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:border-gray-400 transition-colors text-sm"
                    type="button"
                  >
                    <span className={formData.issue ? 'text-gray-900' : 'text-gray-500'}>
                      {formData.issue || 'Select an issue'}
                    </span>
                    <ChevronRight className="text-gray-400" size={18} />
                  </button>
                  {showIssueDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {issueOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, issue: option }));
                            setShowIssueDropdown(false);
                            setError(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Dropdown */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">Select Vehicle</label>
                <div className="relative">
                  <button
                    onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:border-gray-400 transition-colors text-sm"
                    type="button"
                  >
                    <span className={formData.vehicle ? 'text-gray-900' : 'text-gray-500'}>
                      {formData.vehicle || 'Car'}
                    </span>
                    <ChevronRight className="text-gray-400" size={18} />
                  </button>
                  {showVehicleDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {vehicleOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, vehicle: option }));
                            setShowVehicleDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">
                  Describe your issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    setError(null);
                  }}
                  placeholder="Describe your issue here"
                  rows={4}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 resize-none text-sm"
                />
              </div>

              {/* Photos */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Image size={36} className="text-gray-600 mb-2" strokeWidth={1.5} />
                  <span className="text-gray-700 font-medium text-sm">Add Photos</span>
                </label>
                {formData.photos && formData.photos.length > 0 && (
                  <div className="mt-2 text-center text-xs text-gray-600">
                    {formData.photos.length} photo(s) selected
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>

              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    setError(null);
                  }}
                  placeholder="Enter your name"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-medium mb-2 text-sm">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={e => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  placeholder="Enter mobile number"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>

              <div className="pt-6">
                <button
                  onClick={handleCreateTicket}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white py-3.5 rounded-lg font-semibold text-base hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RaiseTicketPage;