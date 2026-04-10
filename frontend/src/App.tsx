import React, { useState, type ChangeEvent } from 'react';
import axios from 'axios';
import { Upload, FileText, User, Calendar, Hash, Globe, Loader2, CheckCircle2, Download } from 'lucide-react';

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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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

  const handlePdfFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const handleGeneratePdf = async () => {
    if (!pdfFile) {
      alert("Please upload a target PDF form first.");
      return;
    }

    setPdfLoading(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const uploadData = new FormData();
    uploadData.append('template', pdfFile);
    uploadData.append('data', JSON.stringify(formData));

    try {
      const response = await axios.post(`${backendUrl}/fill-pdf`, uploadData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filled_form.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 bg-indigo-600 text-white">
            <h1 className="text-3xl font-bold">Document Auto-Fill Agent</h1>
            <p className="mt-2 text-indigo-100">Upload your passport and a target PDF to automatically fill the form.</p>
          </div>

          <div className="p-8">
            {/* Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Step 1: Upload Passport / Identity Document
                </label>
                <div className="mt-1 flex justify-center px-4 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    {loading ? (
                      <Loader2 className="mx-auto h-10 w-10 text-indigo-500 animate-spin" />
                    ) : uploadStatus === 'success' ? (
                      <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
                    ) : (
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    )}
                    <div className="flex text-xs text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>{loading ? 'Processing...' : uploadStatus === 'success' ? 'Document Processed' : 'Upload document'}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Step 2: Upload Target PDF Form
                </label>
                <div className="mt-1 flex justify-center px-4 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    {pdfFile ? (
                      <FileText className="mx-auto h-10 w-10 text-green-500" />
                    ) : (
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    )}
                    <div className="flex text-xs text-gray-600 justify-center">
                      <label htmlFor="pdf-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>{pdfFile ? pdfFile.name : 'Upload PDF Form'}</span>
                        <input id="pdf-upload" name="pdf-upload" type="file" className="sr-only" onChange={handlePdfFileChange} accept="application/pdf" />
                      </label>
                    </div>
                  </div>
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

              <div className="pt-5 flex flex-wrap gap-4 justify-end">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePdf}
                    disabled={pdfLoading || !pdfFile}
                    className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                  >
                    {pdfLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Generate Filled PDF
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save & Continue
                  </button>
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
