
import { useState, useRef, useEffect } from 'react';
import { Send, FileText, RotateCcw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface ChatSectionProps {
  reportSummary: string;
  conversationHistory: any[];
  setConversationHistory: (history: any[]) => void;
  onNewReport: () => void;
}

export const ChatSection = ({ 
  reportSummary, 
  conversationHistory, 
  setConversationHistory, 
  onNewReport 
}: ChatSectionProps) => {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userQuestion = question;
    setQuestion('');
    setIsAsking(true);

    try {
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: userQuestion,
          first: "0"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const updatedHistory = await response.json();
      setConversationHistory(updatedHistory);
    } catch (error) {
      console.error('Question error:', error);
      toast({
        title: "Error",
        description: "Failed to get an answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const resetConversation = async () => {
    try {
      await fetch('http://localhost:8000/exit');
      onNewReport();
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Analysis Complete</h1>
          <p className="text-gray-600">Your medical report summary and Q&A session</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={resetConversation}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={onNewReport} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Report Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {reportSummary}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ask Follow-up Questions</CardTitle>
          <p className="text-sm text-gray-600">
            Ask any questions about your medical report for clarification
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {conversationHistory.slice(1).map((message, index) => (
                <div key={index}>
                  {message.role === 'user' && (
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                        {message.content[0]?.type === 'image_url' ? (
                          <div className="space-y-2">
                            <img 
                              src={message.content[0].image_url.url} 
                              alt="Medical Report" 
                              className="w-full h-auto rounded-lg max-w-xs"
                            />
                            <p className="text-xs text-blue-100">Medical Report Uploaded</p>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content[0]?.text}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {message.role === 'assistant' && index > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                        <p className="text-sm whitespace-pre-wrap">{message.content[0]?.text}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your report..."
                disabled={isAsking}
                className="flex-1"
              />
              <Button 
                onClick={askQuestion} 
                disabled={isAsking || !question.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAsking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
