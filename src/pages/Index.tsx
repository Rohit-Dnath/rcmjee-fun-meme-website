import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Download, Calendar } from "lucide-react";
import jsPDF from 'jspdf';

type FormData = {
  name: string;
  dob: string;
  email: string;
  phone: string;
};

type Question = {
  id: number;
  question: string;
  options: string[];
  correct: number;
};

const questions: Question[] = [
  {
    id: 1,
    question: "What's the most important skill for a hotel manager when dealing with a guest who claims their room has 'too many walls'?",
    options: [
      "Call maintenance to remove walls immediately",
      "Politely explain that walls are a standard feature in most rooms",
      "Offer them a tent in the parking lot",
      "Agree and charge them extra for the 'premium wall package'"
    ],
    correct: 1
  },
  {
    id: 2,
    question: "A guest calls reception at 3 AM asking if you can 'turn down the sun because it's too bright outside.' What's your best response?",
    options: [
      "Transfer them to NASA",
      "Apologize and offer blackout curtains",
      "Explain that sun management is outsourced",
      "Promise to file a complaint with the weather department"
    ],
    correct: 1
  },
  {
    id: 3,
    question: "What's the secret ingredient that makes hotel breakfast buffet scrambled eggs so special?",
    options: [
      "Love and 2-day-old milk",
      "Industrial-grade happiness powder",
      "The tears of the night shift cook",
      "Proper cooking techniques and fresh ingredients"
    ],
    correct: 3
  }
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState('home');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dob: '',
    email: '',
    phone: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [examResult, setExamResult] = useState<{
    score: number;
    passed: boolean;
    joiningDate: string;
  } | null>(null);

  const { toast } = useToast();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dob || !formData.email || !formData.phone) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('exam');
    toast({
      title: "Application Submitted!",
      description: "Get ready for your entrance examination",
    });
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) {
      toast({
        title: "No Answer Selected",
        description: "Please select an answer before proceeding",
        variant: "destructive"
      });
      return;
    }

    const newAnswers = [...answers, parseInt(selectedAnswer)];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      // Calculate results
      const correctAnswers = newAnswers.filter((answer, index) => 
        answer === questions[index].correct
      ).length;
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      const passed = correctAnswers === questions.length;
      
      // Generate random joining date (next 30-90 days)
      const today = new Date();
      const randomDays = Math.floor(Math.random() * 60) + 30;
      const joiningDate = new Date(today.getTime() + randomDays * 24 * 60 * 60 * 1000);
      
      setExamResult({
        score,
        passed,
        joiningDate: joiningDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      });
      setCurrentStep('results');
    }
  };

  const downloadScoreCard = async () => {
    if (!examResult) return;

    const doc = new jsPDF();
    
    const generatePDFWithoutLogo = () => {
      // Background color
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Header background
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 60, 'F');
      
      // Header text without logo
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('REYANSH COLLEGE OF HOTEL MANAGEMENT', 105, 25, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('Joint Entrance Examination 2025', 105, 38, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('OFFICIAL ADMISSION CARD', 105, 50, { align: 'center' });
      
      // Main content background
      doc.setFillColor(255, 255, 255);
      doc.rect(15, 70, 180, 210, 'F');
      
      // Border for main content
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(2);
      doc.rect(15, 70, 180, 210);
      
      // Student Details Section
      doc.setFillColor(239, 246, 255);
      doc.rect(20, 80, 170, 35, 'F');
      
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text('CANDIDATE DETAILS', 25, 92);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('Name:', 25, 105);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.name, 55, 105);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Date of Birth:', 25, 112);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.dob, 75, 112);
      
      // Passing criteria
      doc.setFillColor(255, 248, 220);
      doc.rect(20, 125, 170, 20, 'F');
      doc.setFontSize(12);
      doc.setTextColor(184, 134, 11);
      doc.text('PASSING CRITERIA: You need 100 marks to pass', 105, 137, { align: 'center' });
      
      // Results Section
      doc.setFillColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text('EXAMINATION RESULTS', 105, 160, { align: 'center' });
      
      // Score display
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Score Obtained: ${examResult.score} / 100`, 105, 175, { align: 'center' });
      
      // Status with better formatting
      doc.setFontSize(16);
      if (examResult.passed) {
        doc.setFillColor(34, 197, 94);
        doc.rect(40, 185, 130, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('PASSED', 105, 203, { align: 'center' });
        
        // Success details
        doc.setFillColor(220, 252, 231);
        doc.rect(25, 225, 160, 45, 'F');
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(1);
        doc.rect(25, 225, 160, 45);
        
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94);
        doc.text('CONGRATULATIONS!', 105, 240, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Welcome to Reyansh College of Hotel Management!', 105, 250, { align: 'center' });
        doc.text(`Joining Date: ${examResult.joiningDate}`, 105, 260, { align: 'center' });
        
      } else {
        doc.setFillColor(239, 68, 68);
        doc.rect(40, 185, 130, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('NOT QUALIFIED', 105, 203, { align: 'center' });
        
        // Failure details
        doc.setFillColor(254, 226, 226);
        doc.rect(25, 225, 160, 35, 'F');
        doc.setDrawColor(239, 68, 68);
        doc.setLineWidth(1);
        doc.rect(25, 225, 160, 35);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Unfortunately, you did not meet the passing criteria.', 105, 240, { align: 'center' });
        doc.text('Please prepare well and attempt again next year.', 105, 250, { align: 'center' });
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('This is a computer generated admission card', 105, 275, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 282, { align: 'center' });
      
      doc.save(`RCMJEE_2025_AdmissionCard_${formData.name.replace(/\s+/g, '_')}.pdf`);
    };
    
    // Try to add college logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        // Background color
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 210, 297, 'F');
        
        // Header background
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 70, 'F');
        
        // Center the logo at the top
        const logoSize = 35;
        const logoX = (210 - logoSize) / 2;
        doc.addImage(logoImg, 'PNG', logoX, 10, logoSize, logoSize);
        
        // Header text positioned below the logo
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('REYANSH COLLEGE OF HOTEL MANAGEMENT', 105, 52, { align: 'center' });
        
        doc.setFontSize(14);
        doc.text('Joint Entrance Examination 2025', 105, 62, { align: 'center' });
        
        // Main content background
        doc.setFillColor(255, 255, 255);
        doc.rect(15, 80, 180, 200, 'F');
        
        // Border for main content
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(2);
        doc.rect(15, 80, 180, 200);
        
        // "OFFICIAL ADMISSION CARD" banner
        doc.setFillColor(37, 99, 235);
        doc.rect(20, 85, 170, 15, 'F');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('OFFICIAL ADMISSION CARD', 105, 95, { align: 'center' });
        
        // Student Details Section
        doc.setFillColor(239, 246, 255);
        doc.rect(20, 105, 170, 35, 'F');
        
        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235);
        doc.text('CANDIDATE DETAILS', 25, 117);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Name:', 25, 130);
        doc.setFont('helvetica', 'bold');
        doc.text(formData.name, 55, 130);
        
        doc.setFont('helvetica', 'normal');
        doc.text('Date of Birth:', 25, 137);
        doc.setFont('helvetica', 'bold');
        doc.text(formData.dob, 75, 137);
        
        // Passing criteria
        doc.setFillColor(255, 248, 220);
        doc.rect(20, 150, 170, 20, 'F');
        doc.setFontSize(12);
        doc.setTextColor(184, 134, 11);
        doc.text('PASSING CRITERIA: You need 100 marks to pass', 105, 162, { align: 'center' });
        
        // Results Section
        doc.setFillColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setTextColor(37, 99, 235);
        doc.text('EXAMINATION RESULTS', 105, 180, { align: 'center' });
        
        // Score display
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Score Obtained: ${examResult.score} / 100`, 105, 195, { align: 'center' });
        
        // Status with better formatting
        doc.setFontSize(16);
        if (examResult.passed) {
          doc.setFillColor(34, 197, 94);
          doc.rect(40, 205, 130, 25, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text('PASSED', 105, 220, { align: 'center' });
          
          // Success details
          doc.setFillColor(220, 252, 231);
          doc.rect(25, 240, 160, 35, 'F');
          doc.setDrawColor(34, 197, 94);
          doc.setLineWidth(1);
          doc.rect(25, 240, 160, 35);
          
          doc.setFontSize(12);
          doc.setTextColor(34, 197, 94);
          doc.text('CONGRATULATIONS!', 105, 252, { align: 'center' });
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text('Welcome to Reyansh College of Hotel Management!', 105, 262, { align: 'center' });
          doc.text(`Joining Date: ${examResult.joiningDate}`, 105, 270, { align: 'center' });
          
        } else {
          doc.setFillColor(239, 68, 68);
          doc.rect(40, 205, 130, 25, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text('NOT QUALIFIED', 105, 220, { align: 'center' });
          
          // Failure details
          doc.setFillColor(254, 226, 226);
          doc.rect(25, 240, 160, 30, 'F');
          doc.setDrawColor(239, 68, 68);
          doc.setLineWidth(1);
          doc.rect(25, 240, 160, 30);
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text('Unfortunately, you did not meet the passing criteria.', 105, 252, { align: 'center' });
          doc.text('Please prepare well and attempt again next year.', 105, 262, { align: 'center' });
        }
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('This is a computer generated admission card', 105, 285, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
        
        doc.save(`RCMJEE_2025_AdmissionCard_${formData.name.replace(/\s+/g, '_')}.pdf`);
      };
      logoImg.onerror = () => {
        console.log('Logo loading failed, generating PDF without logo');
        generatePDFWithoutLogo();
      };
      logoImg.src = '/lovable-uploads/885d3ed0-7628-4d88-9359-c4a99ffbe826.png';
    } catch (error) {
      console.log('Logo loading failed, generating PDF without logo');
      generatePDFWithoutLogo();
    }
    
    toast({
      title: "Admission Card Downloaded!",
      description: examResult.passed ? "Your official admission card has been saved!" : "Your admission card has been generated.",
    });
  };

  if (currentStep === 'home') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Simple Government Website Style Header */}
        <header className="bg-white border-b-4 border-blue-800">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center space-x-4">
              <img src="/lovable-uploads/885d3ed0-7628-4d88-9359-c4a99ffbe826.png" alt="RCHM Logo" className="h-12 w-12" />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-blue-800">Reyansh College of Hotel Management</h2>
                <p className="text-sm text-gray-700">Joint Entrance Examination - 2025</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-2 uppercase">
              Earth-616's Hardest Examination
            </h1>
            <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-6">
              <p className="text-lg font-semibold text-gray-800">
                Online Application for Diploma Course in Hotel Management - 2025 Batch
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Last Date for Application: 31st December 2024 | Examination Date: 15th January 2025
              </p>
            </div>
          </div>

          {/* Images Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border-2 border-gray-300 p-4">
              <img 
                src="/lovable-uploads/dceeec07-13bf-419b-acac-ee3b6318599c.png" 
                alt="RCHM Promo" 
                className="w-full h-48 object-cover mb-2"
              />
              <p className="text-sm text-center text-gray-600">Promotional Content</p>
            </div>
            <div className="bg-white border-2 border-gray-300 p-4">
              <img 
                src="/lovable-uploads/2348ba20-08e6-4a3c-a3ad-e98c604dd003.png" 
                alt="Students" 
                className="w-full h-48 object-cover mb-2"
              />
              <p className="text-sm text-center text-gray-600">Our Students</p>
            </div>
            <div className="bg-white border-2 border-gray-300 p-4">
              <img 
                src="/lovable-uploads/8969324b-8a61-4268-86d1-956e94cd1d92.png" 
                alt="Graduation" 
                className="w-full h-48 object-cover mb-2"
              />
              <p className="text-sm text-center text-gray-600">Graduation Ceremony</p>
            </div>
          </div>

          {/* Application Button */}
          <div className="text-center bg-white border-2 border-blue-800 p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4 uppercase">Online Application Portal</h3>
            <p className="text-gray-700 mb-6">
              Click the button below to start your application for RCMJEE 2025
            </p>
            <Button 
              onClick={() => setCurrentStep('application')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-bold uppercase"
            >
              Apply Now for RCMJEE 2025
            </Button>
          </div>

          {/* Important Notice */}
          <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4">
            <h4 className="text-lg font-bold text-red-700 mb-2">IMPORTANT NOTICE:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>All candidates must score 100 marks to qualify for admission</li>
              <li>Only online applications will be accepted</li>
              <li>Ensure all details are filled correctly before submission</li>
              <li>No corrections will be allowed after final submission</li>
              <li>Disclaimer: This is a Meme so take it as a Meme</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'application') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-900">RCMJEE 2025 Application</CardTitle>
              <CardDescription>Fill in your details to proceed to the entrance examination</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep('home')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Proceed to Exam
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === 'exam') {
    const currentQ = questions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-blue-900">
                  Question {currentQuestion + 1} of {questions.length}
                </CardTitle>
                <div className="text-sm text-gray-600">
                  RCMJEE 2025 Entrance Exam
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                {currentQ.question}
              </h3>
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button 
                onClick={handleAnswerSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedAnswer}
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Submit Exam'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === 'results' && examResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className={`text-3xl ${examResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                {examResult.passed ? '🎉 Congratulations! You Passed!' : 'Sorry! You did not qualify'}
              </CardTitle>
              <CardDescription className="text-lg">
                RCMJEE 2025 Examination Results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-blue-600">
                  {examResult.score}/100
                </div>
                <div className={`text-xl font-bold ${examResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {examResult.passed ? '✅ EXAMINATION PASSED!' : '❌ EXAMINATION FAILED!'}
                </div>
              </div>

              {examResult.passed ? (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">
                    🎓 Welcome to Reyansh College of Hotel Management!
                  </h3>
                  <div className="space-y-2 text-green-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joining Date: {examResult.joiningDate}</span>
                    </div>
                    <p className="text-sm mt-2">You have successfully qualified for admission!</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-lg font-bold text-red-800 mb-3">
                    Better luck next time!
                  </h3>
                  <div className="space-y-2 text-red-700">
                    <p>Unfortunately, you did not meet the minimum qualifying marks.</p>
                    <p>Please prepare well and attempt again next year.</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={downloadScoreCard}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Admission Card (PDF)
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentStep('home');
                    setCurrentQuestion(0);
                    setAnswers([]);
                    setSelectedAnswer('');
                    setExamResult(null);
                    setFormData({ name: '', dob: '', email: '', phone: '' });
                  }}
                  variant="outline"
                  className="w-full"
                >
                  {examResult.passed ? 'Help a Friend Take the Exam' : 'Try Again Next Year'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
