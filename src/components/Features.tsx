
import { Shield, Zap, Globe, MessageCircle, FileText, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI technology reads and interprets your medical reports accurately'
    },
    {
      icon: Globe,
      title: 'Nepali Translation',
      description: 'Get summaries in easy-to-understand Nepali at an 8th-grade reading level'
    },
    {
      icon: MessageCircle,
      title: 'Ask Questions',
      description: 'Follow up with questions about your report for better understanding'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and processed with the highest security standards'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get your report summary within seconds of uploading'
    },
    {
      icon: FileText,
      title: 'Multiple Formats',
      description: 'Support for various medical report formats and image types'
    }
  ];

  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Why Choose MediMind?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Making medical reports accessible and understandable for everyone
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
