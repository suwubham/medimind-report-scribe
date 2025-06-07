
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Calendar, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MedicalReport {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
  size: string;
  type: string;
}

const Reports = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load reports from localStorage
    const savedReports = localStorage.getItem('medicalReports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  const handleDeleteReport = (reportId: string) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem('medicalReports', JSON.stringify(updatedReports));
    
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
    
    toast({
      title: "Report deleted",
      description: "The medical report has been removed from your storage.",
    });
  };

  const handleDownload = (report: MedicalReport) => {
    const link = document.createElement('a');
    link.href = report.url;
    link.download = report.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Medical Reports</h1>
          <p className="text-lg text-gray-600">View and manage your uploaded medical reports</p>
        </div>

        {reports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports uploaded yet</h3>
              <p className="text-gray-600 mb-6">Upload your first medical report to get started</p>
              <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700">
                Upload Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Reports List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Reports ({reports.length})</h2>
              {reports.map((report) => (
                <Card 
                  key={report.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedReport?.id === report.id ? 'ring-2 ring-blue-500 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{report.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(report.uploadDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{report.size}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">{selectedReport.name}</h2>
                        <p className="text-gray-600">Uploaded on {new Date(selectedReport.uploadDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(selectedReport)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReport(selectedReport.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <img
                        src={selectedReport.url}
                        alt={selectedReport.name}
                        className="max-w-full max-h-96 mx-auto rounded-lg shadow-sm"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>

                    {/* File Details */}
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">File Type:</span>
                        <span className="ml-2 text-gray-600">{selectedReport.type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">File Size:</span>
                        <span className="ml-2 text-gray-600">{selectedReport.size}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a report to preview</h3>
                    <p className="text-gray-600">Click on any report from the list to view its details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
