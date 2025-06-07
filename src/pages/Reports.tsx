
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Calendar, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'medicalReports'));
      const reportsData: MedicalReport[] = [];
      
      querySnapshot.forEach((doc) => {
        reportsData.push({
          id: doc.id,
          ...doc.data()
        } as MedicalReport);
      });
      
      // Sort by upload date (newest first)
      reportsData.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error loading reports",
        description: "Failed to fetch your medical reports. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (report: MedicalReport) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'medicalReports', report.id));
      
      // Delete from Storage
      const fileName = report.url.split('/').pop()?.split('?')[0];
      if (fileName) {
        const storageRef = ref(storage, `medical-reports/${fileName}`);
        await deleteObject(storageRef);
      }
      
      // Update local state
      const updatedReports = reports.filter(r => r.id !== report.id);
      setReports(updatedReports);
      
      if (selectedReport?.id === report.id) {
        setSelectedReport(null);
      }
      
      toast({
        title: "Report deleted",
        description: "The medical report has been removed from your storage.",
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error deleting report",
        description: "Failed to delete the report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (report: MedicalReport) => {
    const link = document.createElement('a');
    link.href = report.url;
    link.download = report.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading your reports...</h3>
              <p className="text-gray-600">Please wait while we fetch your medical reports</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                          onClick={() => handleDeleteReport(selectedReport)}
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
