
import { useState } from 'react';
import { Header } from '@/components/Header';
import { UploadSection } from '@/components/UploadSection';
import { ChatSection } from '@/components/ChatSection';
import { Features } from '@/components/Features';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'chat'>('upload');
  const [reportSummary, setReportSummary] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const handleReportAnalyzed = (summary: string, history: any[]) => {
    setReportSummary(summary);
    setConversationHistory(history);
    setCurrentStep('chat');
  };

  const handleNewReport = () => {
    setCurrentStep('upload');
    setReportSummary('');
    setConversationHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {currentStep === 'upload' ? (
          <>
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Welcome to <span className="text-blue-600">MediMind</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Upload your medical report and get an easy-to-understand summary in Nepali, 
                plus ask any follow-up questions you might have.
              </p>
            </div>
            
            <UploadSection onReportAnalyzed={handleReportAnalyzed} />
            <Features />
          </>
        ) : (
          <ChatSection 
            reportSummary={reportSummary}
            conversationHistory={conversationHistory}
            setConversationHistory={setConversationHistory}
            onNewReport={handleNewReport}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
