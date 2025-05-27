import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Download, GraduationCap, Calendar, Users, Trophy } from "lucide-react";
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
    
    // Add college logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        // Header with logo
        doc.addImage(logoImg, 'PNG', 15, 10, 25, 25);
        
        // Header text
        doc.setFontSize(18);
        doc.setTextColor(220, 38, 127);
        doc.text('REYANSH COLLEGE OF HOTEL MANAGEMENT', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Joint Entrance Examination 2025 - Score Card', 105, 30, { align: 'center' });
        
        // Decorative line
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(2);
        doc.line(20, 40, 190, 40);
        
        // Student Details Section
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text('STUDENT DETAILS', 20, 55);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Name:', 20, 70);
        doc.text(formData.name, 50, 70);
        
        doc.text('Date of Birth:', 20, 80);
        doc.text(formData.dob, 60, 80);
        
        doc.text('Email:', 20, 90);
        doc.text(formData.email, 50, 90);
        
        doc.text('Phone:', 20, 100);
        doc.text(formData.phone, 50, 100);
        
        // Results Section
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text('EXAMINATION RESULTS', 20, 120);
        
        // Score in large text
        doc.setFontSize(24);
        doc.setTextColor(0, 0, 0);
        doc.text(`SCORE: ${examResult.score}/100`, 20, 140);
        
        // Status with color
        doc.setFontSize(16);
        if (examResult.passed) {
          doc.setTextColor(34, 197, 94); // Green
          doc.text('STATUS: PASSED ✓', 20, 155);
          
          // Success details
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`🎉 Congratulations! Welcome to RCHM!`, 20, 175);
          doc.text(`📅 Joining Date: ${examResult.joiningDate}`, 20, 185);
          doc.text(`🎓 Course: Diploma in Hotel Management - 2025 Batch`, 20, 195);
          doc.text(`🏨 You've passed the legendary RCHM Vibe Check!`, 20, 205);
          
        } else {
          doc.setTextColor(239, 68, 68); // Red
          doc.text('STATUS: FAILED ❌', 20, 155);
          
          // Hilarious failure messages
          doc.setFontSize(12);
          doc.setTextColor(239, 68, 68);
          doc.text('💀 EPIC FAIL! You have FAILED the Vibe Check!', 20, 175);
          doc.text('🤡 Sorry, but you are a NOOB at hotel management!', 20, 185);
          doc.text('😂 You cannot join Reyansh College of Hotel Management', 20, 195);
          doc.text('🚫 Your hospitality skills need serious CPR!', 20, 205);
          doc.text('📚 Maybe try reading "Hotel Management for Dummies" first?', 20, 215);
          doc.text('🎪 Consider a career in circus management instead!', 20, 225);
        }
        
        // Footer
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text('This is a computer generated score card (and totally legit 😉)', 105, 250, { align: 'center' });
        doc.text('Generated on: ' + new Date().toLocaleDateString(), 105, 260, { align: 'center' });
        doc.text('Powered by RCMJEE 2025 - Where Dreams Meet Reality!', 105, 270, { align: 'center' });
        
        // Add border
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 270);
        
        doc.save(`RCMJEE_2025_ScoreCard_${formData.name.replace(/\s+/g, '_')}.pdf`);
      };
      logoImg.src = '/lovable-uploads/885d3ed0-7628-4d88-9359-c4a99ffbe826.png';
    } catch (error) {
      console.log('Logo loading failed, generating PDF without logo');
      // Generate PDF without logo if image fails to load
      generatePDFWithoutLogo();
    }
    
    const generatePDFWithoutLogo = () => {
      // Same PDF generation code but without the logo
      doc.setFontSize(18);
      doc.setTextColor(220, 38, 127);
      doc.text('REYANSH COLLEGE OF HOTEL MANAGEMENT', 105, 25, { align: 'center' });
      // ... rest of the PDF generation code would go here
      doc.save(`RCMJEE_2025_ScoreCard_${formData.name.replace(/\s+/g, '_')}.pdf`);
    };
    
    toast({
      title: "Score Card Downloaded!",
      description: examResult.passed ? "Your epic score card has been saved!" : "Your hilarious failure certificate is ready! 😂",
    });
  };

  if (currentStep === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center space-x-4">
              <img src="/lovable-uploads/885d3ed0-7628-4d88-9359-c4a99ffbe826.png" alt="RCHM Logo" className="h-16 w-16" />
              <div className="text-center">
                <h1 className="text-3xl font-bold text-blue-900">RCMJEE 2025</h1>
                <p className="text-lg text-blue-700">Reyansh College of Hotel Management Joint Entrance Examination</p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-blue-900 mb-6">
              Shape Your Future in Hospitality
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Join the prestigious Diploma Course in Hotel Management - 2025 Batch. 
              Take the entrance examination and embark on your journey to excellence.
            </p>
            <Button 
              onClick={() => setCurrentStep('application')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg transform hover:scale-105 transition-all duration-200"
            >
              Apply for RCMJEE 2025
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Expert Faculty</h3>
                <p className="text-gray-600">Learn from industry professionals with years of experience</p>
              </div>
              <div className="text-center p-6">
                <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Industry Connections</h3>
                <p className="text-gray-600">Strong placement assistance and industry partnerships</p>
              </div>
              <div className="text-center p-6">
                <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Excellence</h3>
                <p className="text-gray-600">Committed to developing future hospitality leaders</p>
              </div>
            </div>
          </div>
        </section>
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
                {examResult.passed ? '🎉 Congratulations! You Passed!' : '💀 EPIC FAIL! Vibe Check Failed!'}
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
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Course: Diploma in Hotel Management - 2025 Batch</span>
                    </div>
                    <p className="text-sm mt-2">🌟 You've successfully passed the legendary RCHM Vibe Check!</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-lg font-bold text-red-800 mb-3">
                    🤡 Sorry, You're a NOOB!
                  </h3>
                  <div className="space-y-2 text-red-700">
                    <p className="font-semibold">💀 You have FAILED the Vibe Check!</p>
                    <p>😂 You cannot join Reyansh College of Hotel Management</p>
                    <p>🚫 Your hospitality skills need serious CPR!</p>
                    <p className="text-sm">📚 Maybe try "Hotel Management for Dummies" first?</p>
                    <p className="text-sm">🎪 Consider a career in circus management instead!</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={downloadScoreCard}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {examResult.passed ? 'Download Victory Certificate (PDF)' : 'Download Epic Fail Certificate (PDF) 😂'}
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
                  {examResult.passed ? 'Help a Friend Take the Exam' : 'Try Again (Good Luck!) 🍀'}
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
