import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Shield,
  Play,
  Pause,
  RotateCcw,
  Target,
  Calendar,
  Trophy,
  Zap,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  points: number;
  prerequisites?: string[];
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  lastAccessed?: string;
  videoUrl?: string;
  exercises: TrainingExercise[];
  quiz?: TrainingQuiz;
}

interface TrainingExercise {
  id: string;
  title: string;
  type: 'practical' | 'scenario' | 'case_study';
  description: string;
  completed: boolean;
  points: number;
}

interface TrainingQuiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
  attempts: number;
  bestScore?: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  serviceCategory: string;
  requirements: string[];
  status: 'not_earned' | 'in_progress' | 'earned' | 'expired';
  earnedDate?: string;
  expiryDate?: string;
  badgeUrl?: string;
  verificationCode?: string;
}

interface TrainingCenterProps {
  providerId: string;
  providerType: 'individual' | 'company';
  isAdmin?: boolean;
}

export default function TrainingCenter({ 
  providerId, 
  providerType = 'individual',
  isAdmin = false 
}: TrainingCenterProps) {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [currentVideo, setCurrentVideo] = useState<string>('');
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('modules');
  const queryClient = useQueryClient();

  // Fetch training data
  const { data: trainingData, isLoading } = useQuery({
    queryKey: [`/api/training/provider/${providerId}`],
    retry: false,
  });

  const { data: certifications = [] } = useQuery({
    queryKey: [`/api/training/certifications/${providerId}`],
    retry: false,
  });

  const { data: socialScore = { score: 0, queueBonus: 0, trainingBonus: 0, tier: 'Bronze' } } = useQuery({
    queryKey: [`/api/providers/${providerId}/social-score`],
    retry: false,
  });

  // Mutations for training progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ moduleId, progress, completed }: { moduleId: string; progress: number; completed: boolean }) => {
      return apiRequest('PUT', `/api/training/modules/${moduleId}/progress`, { 
        progress, 
        completed,
        providerId 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/training/provider/${providerId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/social-score`] });
    }
  });

  const completeExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, moduleId }: { exerciseId: string; moduleId: string }) => {
      return apiRequest('POST', `/api/training/exercises/${exerciseId}/complete`, { 
        moduleId,
        providerId 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/training/provider/${providerId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/social-score`] });
    }
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({ quizId, answers }: { quizId: string; answers: number[] }) => {
      return apiRequest('POST', `/api/training/quiz/${quizId}/submit`, { 
        answers,
        providerId 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/training/provider/${providerId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/social-score`] });
    }
  });

  const modules: TrainingModule[] = trainingData?.modules || [];
  const totalPoints = modules.reduce((sum, m) => sum + (m.status === 'completed' ? m.points : 0), 0);
  const completedModules = modules.filter(m => m.status === 'completed').length;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'customer service': return Users;
      case 'safety & compliance': return Shield;
      case 'technical skills': return Zap;
      case 'business development': return TrendingUp;
      default: return BookOpen;
    }
  };

  const handleStartModule = (moduleId: string) => {
    setSelectedModule(moduleId);
    updateProgressMutation.mutate({ moduleId, progress: 1, completed: false });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Training Center</h1>
            <p className="text-gray-600">
              {isAdmin ? 'Admin Training Dashboard' : 'Enhance your skills and boost your social score'}
            </p>
          </div>
        </div>
        
        {/* Social Score Display */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Social Score</div>
                <div className="text-2xl font-bold text-purple-600">
                  {socialScore?.score || 0}
                </div>
                <div className="text-xs text-green-600">
                  +{totalPoints} from training
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Modules Completed</div>
                <div className="text-xl font-bold">{completedModules}/{modules.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-600">Points Earned</div>
                <div className="text-xl font-bold">{totalPoints}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Certifications</div>
                <div className="text-xl font-bold">
                  {certifications?.filter((c: any) => c.status === 'earned').length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Queue Priority</div>
                <div className="text-xl font-bold text-green-600">
                  {socialScore?.queueBonus || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="leaderboard">Provider Rankings</TabsTrigger>
        </TabsList>

        {/* Training Modules */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => {
              const IconComponent = getCategoryIcon(module.category);
              
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full hover:shadow-lg transition-all ${module.status === 'completed' ? 'border-green-200 bg-green-50/50' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getLevelColor(module.level)}>
                                {module.level}
                              </Badge>
                              <Badge variant="outline">
                                <Star className="h-3 w-3 mr-1" />
                                {module.points} pts
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {module.status === 'completed' && (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm">{module.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {module.exercises.length} exercises
                        </div>
                      </div>

                      {module.status !== 'not_started' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-2">
                        {module.status === 'not_started' ? (
                          <Button 
                            onClick={() => handleStartModule(module.id)}
                            className="flex-1"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Module
                          </Button>
                        ) : module.status === 'in_progress' ? (
                          <Button 
                            onClick={() => setSelectedModule(module.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            Continue
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => setSelectedModule(module.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            <Award className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        )}
                        
                        {module.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateProgressMutation.mutate({ 
                              moduleId: module.id, 
                              progress: 0, 
                              completed: false 
                            })}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Certifications */}
        <TabsContent value="certifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications?.map((cert: Certification) => (
              <Card key={cert.id} className={`${cert.status === 'earned' ? 'border-gold bg-yellow-50/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        {cert.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{cert.serviceCategory}</p>
                    </div>
                    
                    {cert.status === 'earned' && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Trophy className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{cert.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {cert.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {cert.status === 'earned' && cert.verificationCode && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Verification Code:</div>
                      <div className="font-mono text-sm font-bold">{cert.verificationCode}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Progress Tracking */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Training Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Monthly Progress</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-gray-600">Hours This Month</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <div className="text-sm text-gray-600">Modules Completed</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">95%</div>
                      <div className="text-sm text-gray-600">Quiz Average</div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">Social Score Impact</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Base Provider Score</span>
                      <span className="font-bold">750</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Training Bonus</span>
                      <span className="font-bold text-green-600">+{totalPoints}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm">Certification Bonus</span>
                      <span className="font-bold text-yellow-600">+150</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Total Social Score</span>
                      <span className="text-xl font-bold text-blue-600">
                        {750 + totalPoints + 150}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Provider Training Rankings
              </CardTitle>
              <p className="text-sm text-gray-600">
                Top providers by training completion and social scores
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Sample leaderboard data - would come from API */}
                {[
                  { rank: 1, name: "Sarah Johnson", score: 1250, modules: 24, category: "House Cleaning" },
                  { rank: 2, name: "Michael Chen", score: 1180, modules: 22, category: "Plumbing" },
                  { rank: 3, name: "You", score: 750 + totalPoints + 150, modules: completedModules, category: "Multiple", highlight: true }
                ].map((provider) => (
                  <div 
                    key={provider.rank}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      provider.highlight ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        provider.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        provider.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        provider.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {provider.rank}
                      </div>
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-gray-600">{provider.category}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold">{provider.score}</div>
                      <div className="text-sm text-gray-600">{provider.modules} modules</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}