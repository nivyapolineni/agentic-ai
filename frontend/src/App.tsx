import React, { useState, type ChangeEvent } from 'react';
import axios from 'axios';
import { Upload, FileText, User, Calendar, Hash, Globe, Loader2, CheckCircle2 } from 'lucide-react';

interface PassportData {
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  passportNumber: string;
  gender?: string;
  expiryDate?: string;
}

function App() {
  const [formData, setFormData] = useState<PassportData>({
    firstName: '',
    lastName: '',
    dob: '',
    nationality: '',
    passportNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadStatus('uploading');

    const formDataToUpload = new FormData();
    formDataToUpload.append('file', file);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.post(`${backendUrl}/process-passport`, formDataToUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const extractedData = response.data;
      setFormData({
        firstName: extractedData.firstName || '',
        lastName: extractedData.lastName || '',
        dob: extractedData.dob || '',
        nationality: extractedData.nationality || '',
        passportNumber: extractedData.passportNumber || '',
      });
      setUploadStatus('success');
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 bg-indigo-600 text-white">
            <h1 className="text-3xl font-bold">Document Auto-Fill Agent</h1>
            <p className="mt-2 text-indigo-100">Upload your passport to automatically fill the form fields.</p>
          </div>

          <div className="p-8">
            {/* Upload Section */}
            <div className="mb-10">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Step 1: Upload Passport / Identity Document
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  {loading ? (
                    <Loader2 className="mx-auto h-12 w-12 text-indigo-500 animate-spin" />
                  ) : uploadStatus === 'success' ? (
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>{loading ? 'Processing...' : uploadStatus === 'success' ? 'Document Processed' : 'Upload a file'}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept="image/*" />
                    </label>
                    {!loading && uploadStatus !== 'success' && <p className="pl-1 text-gray-500">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" /> First Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" /> Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" /> Date of Birth
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="dob"
                      id="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" /> Nationality
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="nationality"
                      id="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-gray-400" /> Passport Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="passportNumber"
                      id="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* G-28 Section */}
        <div className="mt-8 bg-white shadow-xl rounded-lg overflow-hidden border-t-4 border-indigo-500">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-800">G-28 Form Preview</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">This section shows how the data would map to a G-28 Notice of Entry of Appearance.</p>

            <div className="bg-gray-100 p-4 rounded border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-500">Part 3, Item 1.a. Family Name:</span>
                  <div className="mt-1 font-bold border-b border-gray-400">{formData.lastName || '________________'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Part 3, Item 1.b. Given Name:</span>
                  <div className="mt-1 font-bold border-b border-gray-400">{formData.firstName || '________________'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Part 3, Item 4. Date of Birth:</span>
                  <div className="mt-1 font-bold border-b border-gray-400">{formData.dob || '________________'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Part 3, Item 5. Country of Birth:</span>
                  <div className="mt-1 font-bold border-b border-gray-400">{formData.nationality || '________________'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
