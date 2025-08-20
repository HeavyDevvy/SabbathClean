import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Award, BookOpen, CheckCircle, Star, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  serviceType: string;
  difficulty: string;
  estimatedDuration: number;
  content: any;
  prerequisites: string[];
  isRequired: boolean;
  isActive: boolean;
}

interface ProviderTrainingProgress {
  id: string;
  providerId: string;
  moduleId: string;
  status: string;
  progress: number;
  timeSpent: number;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt?: Date;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  serviceType: string;
  level: string;
  requiredModules: string[];
  validityPeriod: number;
  badgeIcon?: string;
}

interface ProviderCertification {
  id: string;
  providerId: string;
  certificationId: string;
  status: string;
  earnedAt?: Date;
  expiresAt?: Date;
  certificateNumber?: string;
  verificationCode?: string;
}

// Sample data for demonstration
const sampleModules: TrainingModule[] = [
  {
    id: "module-chef-001",
    title: "Food Safety & Hygiene Fundamentals",
    description: "Essential food safety principles, HACCP guidelines, and personal hygiene standards for professional chefs.",
    category: "safety",
    serviceType: "chef-catering",
    difficulty: "beginner",
    estimatedDuration: 45,
    content: {},
    prerequisites: [],
    isRequired: true,
    isActive: true
  },
  {
    id: "module-chef-002", 
    title: "Knife Skills & Basic Techniques",
    description: "Master fundamental knife skills, cutting techniques, and kitchen safety practices.",
    category: "technical",
    serviceType: "chef-catering",
    difficulty: "beginner",
    estimatedDuration: 60,
    content: {},
    prerequisites: ["module-chef-001"],
    isRequired: true,
    isActive: true
  },
  {
    id: "module-chef-003",
    title: "African Cuisine Traditions",
    description: "Explore traditional African cooking methods, spices, and authentic dish preparation.",
    category: "specialized",
    serviceType: "chef-catering",
    difficulty: "intermediate",
    estimatedDuration: 75,
    content: {},
    prerequisites: ["module-chef-001", "module-chef-002"],
    isRequired: false,
    isActive: true
  },
  {
    id: "module-chef-004",
    title: "Customer Service Excellence",
    description: "Deliver exceptional customer service, handle dietary requirements, and manage client expectations.",
    category: "customer-service",
    serviceType: "chef-catering",
    difficulty: "intermediate",
    estimatedDuration: 50,
    content: {},
    prerequisites: ["module-chef-001"],
    isRequired: true,
    isActive: true
  },
  {
    id: "module-chef-005",
    title: "Advanced Plating & Presentation",
    description: "Master professional plating techniques and create visually stunning dish presentations.",
    category: "technical",
    serviceType: "chef-catering",
    difficulty: "advanced",
    estimatedDuration: 90,
    content: {},
    prerequisites: ["module-chef-002", "module-chef-004"],
    isRequired: false,
    isActive: true
  },
  {
    id: "module-chef-006",
    title: "Menu Planning & Costing",
    description: "Design balanced menus, calculate food costs, and optimize profitability while maintaining quality.",
    category: "business",
    serviceType: "chef-catering",
    difficulty: "advanced",
    estimatedDuration: 80,
    content: {},
    prerequisites: ["module-chef-004"],
    isRequired: false,
    isActive: true
  }
];

const sampleProgress: ProviderTrainingProgress[] = [
  {
    id: "progress-1",
    providerId: "provider-demo",
    moduleId: "module-chef-001",
    status: "completed",
    progress: 100,
    timeSpent: 45,
    startedAt: new Date("2024-07-15"),
    completedAt: new Date("2024-07-16"),
    lastAccessedAt: new Date("2024-07-16")
  },
  {
    id: "progress-2",
    providerId: "provider-demo",
    moduleId: "module-chef-002",
    status: "completed",
    progress: 100,
    timeSpent: 58,
    startedAt: new Date("2024-07-17"),
    completedAt: new Date("2024-07-18"),
    lastAccessedAt: new Date("2024-07-18")
  },
  {
    id: "progress-3",
    providerId: "provider-demo",
    moduleId: "module-chef-003",
    status: "in_progress",
    progress: 65,
    timeSpent: 35,
    startedAt: new Date("2024-07-20"),
    lastAccessedAt: new Date("2024-08-20")
  },
  {
    id: "progress-4",
    providerId: "provider-demo",
    moduleId: "module-chef-004",
    status: "completed",
    progress: 100,
    timeSpent: 50,
    startedAt: new Date("2024-07-19"),
    completedAt: new Date("2024-07-19"),
    lastAccessedAt: new Date("2024-07-19")
  }
];

const sampleCertifications: Certification[] = [
  {
    id: "cert-chef-001",
    name: "Certified Professional Chef",
    description: "Complete certification covering all fundamental aspects of professional cooking and food safety.",
    serviceType: "chef-catering",
    level: "intermediate",
    requiredModules: ["module-chef-001", "module-chef-002", "module-chef-004"],
    validityPeriod: 24,
    badgeIcon: "chef-hat-gold"
  },
  {
    id: "cert-chef-002",
    name: "African Cuisine Specialist",
    description: "Specialized certification in traditional and modern African cooking techniques and flavors.",
    serviceType: "chef-catering",
    level: "advanced",
    requiredModules: ["module-chef-001", "module-chef-002", "module-chef-003", "module-chef-004"],
    validityPeriod: 18,
    badgeIcon: "african-cuisine-badge"
  },
  {
    id: "cert-chef-003",
    name: "Master Culinary Artist",
    description: "Elite certification for master chefs with advanced plating, menu planning, and business skills.",
    serviceType: "chef-catering",
    level: "expert",
    requiredModules: ["module-chef-001", "module-chef-002", "module-chef-004", "module-chef-005", "module-chef-006"],
    validityPeriod: 36,
    badgeIcon: "master-chef-crown"
  }
];

const sampleProviderCertifications: ProviderCertification[] = [
  {
    id: "provider-cert-1",
    providerId: "provider-demo",
    certificationId: "cert-chef-001",
    status: "earned",
    earnedAt: new Date("2024-07-19"),
    expiresAt: new Date("2026-07-19"),
    certificateNumber: "CERT_CPC_240719_001",
    verificationCode: "VER_240719"
  }
];

export default function ProviderTraining() {
  const [activeTab, setActiveTab] = useState("modules");
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  
  // Using sample data for demonstration
  const modules = sampleModules;
  const progressData = sampleProgress;
  const certifications = sampleCertifications;
  const providerCertifications = sampleProviderCertifications;
  
  const modulesLoading = false;
  const progressLoading = false;
  const certificationsLoading = false;
  const providerCertificationsLoading = false;

  // State for interactive demo
  const [localProgress, setLocalProgress] = useState(progressData);

  const getModuleProgress = (moduleId: string): ProviderTrainingProgress | undefined => {
    return localProgress.find((p: ProviderTrainingProgress) => p.moduleId === moduleId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "not_started": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartModule = (moduleId: string) => {
    const newProgress: ProviderTrainingProgress = {
      id: `progress-${Date.now()}`,
      providerId: "provider-demo",
      moduleId,
      status: "in_progress",
      progress: 10,
      timeSpent: 0,
      startedAt: new Date(),
      lastAccessedAt: new Date()
    };
    
    setLocalProgress(prev => {
      const exists = prev.find(p => p.moduleId === moduleId);
      if (exists) {
        return prev.map(p => p.moduleId === moduleId ? { ...p, status: "in_progress", lastAccessedAt: new Date() } : p);
      }
      return [...prev, newProgress];
    });
  };

  const handleCompleteModule = (progressId: string) => {
    setLocalProgress(prev =>
      prev.map(p => 
        p.id === progressId 
          ? { ...p, status: "completed", progress: 100, completedAt: new Date() }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8" data-testid="provider-training-page">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="page-title">
            Provider Training & Certification
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto" data-testid="page-description">
            Enhance your skills and earn certifications to provide exceptional service to Berry Events customers.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="training-tabs">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="modules" data-testid="tab-modules">Training Modules</TabsTrigger>
            <TabsTrigger value="progress" data-testid="tab-progress">My Progress</TabsTrigger>
            <TabsTrigger value="certifications" data-testid="tab-certifications">Certifications</TabsTrigger>
            <TabsTrigger value="achievements" data-testid="tab-achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6" data-testid="modules-content">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modulesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse" data-testid={`module-skeleton-${i}`}>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                modules.map((module: TrainingModule) => {
                  const progress = getModuleProgress(module.id);
                  return (
                    <Card key={module.id} className="hover:shadow-lg transition-shadow" data-testid={`module-card-${module.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg" data-testid={`module-title-${module.id}`}>{module.title}</CardTitle>
                          <Badge className={getDifficultyColor(module.difficulty)} data-testid={`module-difficulty-${module.id}`}>
                            {module.difficulty}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm" data-testid={`module-description-${module.id}`}>
                          {module.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span data-testid={`module-duration-${module.id}`}>{module.estimatedDuration} minutes</span>
                        </div>
                        
                        {progress ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge className={getStatusColor(progress.status)} data-testid={`module-status-${module.id}`}>
                                {progress.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-gray-600" data-testid={`module-progress-${module.id}`}>
                                {progress.progress}% complete
                              </span>
                            </div>
                            <Progress value={progress.progress} className="h-2" data-testid={`module-progress-bar-${module.id}`} />
                            {progress.status === 'completed' ? (
                              <Button disabled className="w-full" data-testid={`module-completed-button-${module.id}`}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Completed
                              </Button>
                            ) : progress.status === 'in_progress' ? (
                              <Button 
                                onClick={() => handleCompleteModule(progress.id)}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                data-testid={`module-complete-button-${module.id}`}
                              >
                                Mark Complete
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleStartModule(module.id)}
                                variant="outline" 
                                className="w-full"
                                data-testid={`module-continue-button-${module.id}`}
                              >
                                Continue
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleStartModule(module.id)}
                            className="w-full"
                            data-testid={`module-start-button-${module.id}`}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Start Module
                          </Button>
                        )}
                        
                        {module.isRequired && (
                          <Badge variant="destructive" className="text-xs" data-testid={`module-required-${module.id}`}>
                            Required
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6" data-testid="progress-content">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="md:col-span-2 lg:col-span-3" data-testid="progress-overview">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Training Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600" data-testid="modules-completed-count">
                        {localProgress.filter((p: ProviderTrainingProgress) => p.status === 'completed').length}
                      </div>
                      <div className="text-sm text-gray-600">Modules Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600" data-testid="modules-in-progress-count">
                        {localProgress.filter((p: ProviderTrainingProgress) => p.status === 'in_progress').length}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600" data-testid="total-time-spent">
                        {Math.floor(localProgress.reduce((total: number, p: ProviderTrainingProgress) => total + (p.timeSpent || 0), 0) / 60)}h
                      </div>
                      <div className="text-sm text-gray-600">Hours Studied</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {progressLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse" data-testid={`progress-skeleton-${i}`}>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-2 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                localProgress.map((progress: ProviderTrainingProgress) => {
                  const module = modules.find((m: TrainingModule) => m.id === progress.moduleId);
                  return (
                    <Card key={progress.id} data-testid={`progress-card-${progress.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg" data-testid={`progress-module-title-${progress.id}`}>
                          {module?.title || 'Unknown Module'}
                        </CardTitle>
                        <Badge className={getStatusColor(progress.status)} data-testid={`progress-status-${progress.id}`}>
                          {progress.status.replace('_', ' ')}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <Progress value={progress.progress} className="h-3 mb-2" data-testid={`progress-bar-${progress.id}`} />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span data-testid={`progress-percentage-${progress.id}`}>{progress.progress}% complete</span>
                          <span data-testid={`progress-time-spent-${progress.id}`}>{progress.timeSpent || 0}min</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6" data-testid="certifications-content">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {certificationsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse" data-testid={`cert-skeleton-${i}`}>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                certifications.map((cert: Certification) => {
                  const providerCert = providerCertifications.find(
                    (pc: ProviderCertification) => pc.certificationId === cert.id
                  );
                  
                  return (
                    <Card key={cert.id} className="hover:shadow-lg transition-shadow" data-testid={`cert-card-${cert.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg flex items-center gap-2" data-testid={`cert-title-${cert.id}`}>
                            <Award className="w-5 h-5 text-yellow-500" />
                            {cert.name}
                          </CardTitle>
                          <Badge variant="outline" data-testid={`cert-level-${cert.id}`}>{cert.level}</Badge>
                        </div>
                        <CardDescription data-testid={`cert-description-${cert.id}`}>{cert.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4" />
                            <span data-testid={`cert-validity-${cert.id}`}>Valid for {cert.validityPeriod} months</span>
                          </div>
                          <div data-testid={`cert-modules-${cert.id}`}>
                            Requires {cert.requiredModules.length} modules
                          </div>
                        </div>
                        
                        {providerCert ? (
                          <div className="space-y-2">
                            <Badge 
                              className={providerCert.status === 'earned' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                              data-testid={`cert-provider-status-${cert.id}`}
                            >
                              {providerCert.status === 'earned' ? 'Earned' : 'In Progress'}
                            </Badge>
                            {providerCert.earnedAt && (
                              <div className="text-sm text-gray-600" data-testid={`cert-earned-date-${cert.id}`}>
                                Earned: {new Date(providerCert.earnedAt).toLocaleDateString()}
                              </div>
                            )}
                            {providerCert.verificationCode && (
                              <div className="text-xs font-mono bg-gray-100 p-2 rounded" data-testid={`cert-verification-${cert.id}`}>
                                Code: {providerCert.verificationCode}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button variant="outline" className="w-full" data-testid={`cert-start-button-${cert.id}`}>
                            <Star className="w-4 h-4 mr-2" />
                            Start Certification
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6" data-testid="achievements-content">
            <Card data-testid="achievements-overview">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  Track your milestones and accomplishments in the Berry Events training program.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 p-4 border rounded-lg" data-testid="achievement-modules">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Module Master</div>
                      <div className="text-sm text-gray-600">
                        {localProgress.filter((p: ProviderTrainingProgress) => p.status === 'completed').length} modules completed
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg" data-testid="achievement-certifications">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Certified Professional</div>
                      <div className="text-sm text-gray-600">
                        {providerCertifications.filter((pc: ProviderCertification) => pc.status === 'earned').length} certifications earned
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}