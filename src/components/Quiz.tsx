import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Clock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  onComplete: (score: number, totalQuestions: number) => void;
  onClose: () => void;
}

const Quiz = ({ onComplete, onClose }: QuizProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Random quiz questions pool
  const allQuestions: Question[] = [
    {
      id: 1,
      question: "What is the virtual DOM in React?",
      options: [
        "A copy of the real DOM kept in memory",
        "A programming concept where UI is kept in memory and synced with the real DOM",
        "A faster version of the DOM",
        "All of the above"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "Which hook is used for side effects in React?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What is JSX?",
      options: [
        "A JavaScript library",
        "A syntax extension for JavaScript",
        "A type of component",
        "A React framework"
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "How do you pass data from parent to child component?",
      options: ["State", "Props", "Context", "Redux"],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "What is the purpose of key prop in React lists?",
      options: [
        "To style elements",
        "To identify elements uniquely for efficient re-rendering",
        "To handle events",
        "To manage state"
      ],
      correctAnswer: 1
    },
    {
      id: 6,
      question: "Which method is called when a component is removed from the DOM?",
      options: ["componentDidMount", "componentWillUnmount", "componentDidUpdate", "render"],
      correctAnswer: 1
    },
    {
      id: 7,
      question: "What is the difference between state and props?",
      options: [
        "No difference",
        "State is mutable, props are immutable",
        "Props are mutable, state is immutable",
        "Both are mutable"
      ],
      correctAnswer: 1
    },
    {
      id: 8,
      question: "What is a higher-order component (HOC)?",
      options: [
        "A component that renders other components",
        "A function that takes a component and returns a new component",
        "A component with higher priority",
        "A built-in React component"
      ],
      correctAnswer: 1
    }
  ];

  // Select 5 random questions
  const [questions] = useState(() => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  });

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
    const score = selectedAnswers.reduce((acc, answer, index) => {
      return answer === questions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
    
    toast({
      title: "Quiz Completed!",
      description: `You scored ${score}/${questions.length}`,
    });
    
    onComplete(score, questions.length);
  };

  const downloadPDF = async () => {
    const pdf = new jsPDF();
    const resultsElement = document.getElementById("quiz-results");
    
    if (resultsElement) {
      const canvas = await html2canvas(resultsElement);
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save("quiz-report.pdf");
      
      toast({
        title: "PDF Downloaded!",
        description: "Your quiz report has been downloaded successfully.",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const score = selectedAnswers.reduce((acc, answer, index) => {
    return answer === questions[index].correctAnswer ? acc + 1 : acc;
  }, 0);

  if (showResults) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div id="quiz-results" className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Quiz Results</CardTitle>
                <CardDescription>Your performance summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {score}/{questions.length}
                  </div>
                  <Badge variant={score >= 3 ? "default" : "destructive"} className="text-lg px-4 py-2">
                    {score >= 3 ? "Passed" : "Need Improvement"}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium">{question.question}</h4>
                            {selectedAnswers[index] === question.correctAnswer ? (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-2 rounded text-sm ${
                                  optionIndex === question.correctAnswer
                                    ? "bg-green-100 text-green-800 border border-green-300"
                                    : selectedAnswers[index] === optionIndex && optionIndex !== question.correctAnswer
                                    ? "bg-red-100 text-red-800 border border-red-300"
                                    : "bg-muted"
                                }`}
                              >
                                {option}
                                {optionIndex === question.correctAnswer && " ✓ (Correct)"}
                                {selectedAnswers[index] === optionIndex && optionIndex !== question.correctAnswer && " ✗ (Your answer)"}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex gap-4 mt-6">
            <Button onClick={downloadPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF Report
            </Button>
            <Button variant="outline" onClick={onClose}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Today's Quiz</CardTitle>
                <CardDescription>
                  Question {currentQuestion + 1} of {questions.length}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{questions[currentQuestion].question}</h3>
              
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      selectedAnswers[currentQuestion] === index
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
              >
                {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;