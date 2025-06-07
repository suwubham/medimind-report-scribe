import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { API_BASE_URL, COLLECTIONS } from '@/lib/constants';

interface UploadSectionProps {
  onReportAnalyzed: (summary: string, history: any[]) => void;
}

export const UploadSection = ({ onReportAnalyzed }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      setUploadedFile(imageFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
    }
  };

  const uploadToFirebase = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `medical-reports/${timestamp}-${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const analyzeReport = async (imageUrl: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: imageUrl,
          first: "1"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze report');
      }

      const conversationHistory = await response.json();
      const summary = conversationHistory[conversationHistory.length - 1]?.content?.[0]?.text || 'No summary available';
      
      return { summary, conversationHistory };
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const saveReportToFirestore = async (file: File, imageUrl: string) => {
    const report = {
      name: file.name,
      url: imageUrl,
      uploadDate: new Date().toISOString(),
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    };

    await addDoc(collection(db, 'medicalReports'), report);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadToFirebase(uploadedFile);
      
      // Save report to Firestore
      await saveReportToFirestore(uploadedFile, imageUrl);
      
      setIsUploading(false);
      setIsAnalyzing(true);

      const { summary, conversationHistory } = await analyzeReport(imageUrl);
      
      toast({
        title: "Report analyzed successfully!",
        description: "Your medical report has been processed and saved.",
      });

      onReportAnalyzed(summary, conversationHistory);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error processing your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors duration-300">
        <CardContent className="p-8">
          {!uploadedFile ? (
            <div
              className={`text-center space-y-6 ${
                isDragging ? 'bg-blue-50 border-blue-300' : ''
              } rounded-lg p-8 transition-all duration-300`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-12 h-12 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Upload Your Medical Report
                </h3>
                <p className="text-gray-600 mb-6">
                  Drag and drop your medical report image here, or click to browse
                </p>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  id="file-upload"
                  className="sr-only"
                />
                <label htmlFor="file-upload">
                  <Button asChild className="cursor-pointer bg-blue-600 hover:bg-blue-700">
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>PNG, JPG supported</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Max 10MB</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  File Ready for Analysis
                </h3>
                <p className="text-gray-600 mb-2">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setUploadedFile(null)}
                  disabled={isUploading || isAnalyzing}
                >
                  Choose Different File
                </Button>
                <Button 
                  onClick={handleAnalyze}
                  disabled={isUploading || isAnalyzing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Report'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {(isUploading || isAnalyzing) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">
                  {isUploading ? 'Uploading your report...' : 'Analyzing with AI...'}
                </h4>
                <p className="text-sm text-blue-700">
                  {isUploading 
                    ? 'Securely uploading your medical report to cloud storage'
                    : 'Our AI is reading and summarizing your report in Nepali'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
