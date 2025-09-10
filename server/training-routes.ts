import type { Express } from "express";
import { storage } from "./storage";
import { authenticateToken } from "./auth-routes";

// Training module data - would typically come from database
const trainingModules = [
  {
    id: "customer-service-basics",
    title: "Customer Service Excellence",
    description: "Master the fundamentals of exceptional customer service",
    category: "Customer Service",
    level: "beginner",
    duration: "2 hours",
    points: 100,
    status: "not_started",
    progress: 0,
    videoUrl: "/training/videos/customer-service-basics.mp4",
    exercises: [
      {
        id: "cs-ex-1",
        title: "Active Listening Practice",
        type: "practical",
        description: "Practice active listening techniques with sample scenarios",
        completed: false,
        points: 25
      },
      {
        id: "cs-ex-2", 
        title: "Complaint Resolution",
        type: "scenario",
        description: "Handle difficult customer situations professionally",
        completed: false,
        points: 30
      }
    ],
    quiz: {
      id: "cs-quiz-1",
      questions: [
        {
          id: "q1",
          question: "What is the first step in resolving a customer complaint?",
          options: ["Apologize immediately", "Listen actively", "Offer compensation", "Escalate to manager"],
          correctAnswer: 1,
          explanation: "Active listening helps you understand the customer's concern fully before responding."
        }
      ],
      passingScore: 80,
      attempts: 0
    }
  },
  {
    id: "safety-compliance",
    title: "Safety & Compliance Standards", 
    description: "Learn essential safety protocols and compliance requirements",
    category: "Safety & Compliance",
    level: "intermediate",
    duration: "3 hours",
    points: 150,
    status: "not_started", 
    progress: 0,
    exercises: [
      {
        id: "safety-ex-1",
        title: "Risk Assessment",
        type: "case_study",
        description: "Identify potential hazards in various service scenarios",
        completed: false,
        points: 40
      },
      {
        id: "safety-ex-2",
        title: "Emergency Procedures",
        type: "practical", 
        description: "Practice emergency response protocols",
        completed: false,
        points: 35
      }
    ]
  },
  {
    id: "technical-skills-advanced",
    title: "Advanced Technical Skills",
    description: "Develop expertise in specialized service techniques",
    category: "Technical Skills",
    level: "advanced", 
    duration: "4 hours",
    points: 200,
    status: "not_started",
    progress: 0,
    prerequisites: ["safety-compliance"],
    exercises: [
      {
        id: "tech-ex-1",
        title: "Equipment Mastery",
        type: "practical",
        description: "Demonstrate proficiency with advanced equipment",
        completed: false,
        points: 50
      }
    ]
  },
  {
    id: "business-development",
    title: "Business Development & Growth",
    description: "Learn strategies to grow your service business",
    category: "Business Development", 
    level: "intermediate",
    duration: "2.5 hours",
    points: 120,
    status: "not_started",
    progress: 0,
    exercises: [
      {
        id: "biz-ex-1", 
        title: "Customer Retention Strategies",
        type: "scenario",
        description: "Develop techniques to retain and grow customer base",
        completed: false,
        points: 40
      }
    ]
  }
];

const certifications = [
  {
    id: "cert-customer-service",
    name: "Customer Service Professional",
    description: "Certified in advanced customer service techniques",
    serviceCategory: "All Services",
    requirements: [
      "Complete Customer Service Excellence module",
      "Score 90%+ on final assessment", 
      "Complete 3 practical exercises",
      "Receive 5+ customer ratings of 4.5+ stars"
    ],
    status: "not_earned"
  },
  {
    id: "cert-safety-expert",
    name: "Safety & Compliance Expert", 
    description: "Certified in comprehensive safety protocols",
    serviceCategory: "All Services",
    requirements: [
      "Complete Safety & Compliance Standards module",
      "Pass safety assessment with 95%+ score",
      "Submit safety incident prevention plan",
      "Complete emergency response simulation"
    ],
    status: "not_earned"
  },
  {
    id: "cert-technical-specialist",
    name: "Technical Service Specialist",
    description: "Advanced certification in technical service delivery",
    serviceCategory: "Technical Services",
    requirements: [
      "Complete Advanced Technical Skills module",
      "Demonstrate equipment proficiency",
      "Complete complex service scenarios",
      "Maintain 4.8+ customer rating for 6 months"
    ],
    status: "not_earned"
  }
];

export function registerTrainingRoutes(app: Express) {
  // Get provider training data
  app.get('/api/training/provider/:providerId', async (req, res) => {
    try {
      const { providerId } = req.params;
      
      // Check if provider exists (simplified check)
      // In production, this would check the actual provider in database
      if (!providerId) {
        return res.status(404).json({ message: 'Provider not found' });
      }

      // Simulate personalized training data based on provider
      const personalizedModules = trainingModules.map(module => ({
        ...module,
        status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.4 ? 'in_progress' : 'not_started',
        progress: Math.random() > 0.4 ? Math.floor(Math.random() * 100) : 0,
        lastAccessed: new Date().toISOString()
      }));

      res.json({
        modules: personalizedModules,
        totalPoints: personalizedModules.reduce((sum, m) => sum + (m.status === 'completed' ? m.points : 0), 0),
        completionRate: personalizedModules.filter(m => m.status === 'completed').length / personalizedModules.length * 100
      });
    } catch (error) {
      console.error('Error fetching training data:', error);
      res.status(500).json({ message: 'Failed to fetch training data' });
    }
  });

  // Get provider certifications
  app.get('/api/training/certifications/:providerId', async (req, res) => {
    try {
      const { providerId } = req.params;
      
      // Simulate certification status based on provider progress
      const providerCertifications = certifications.map(cert => ({
        ...cert,
        status: Math.random() > 0.8 ? 'earned' : Math.random() > 0.6 ? 'in_progress' : 'not_earned',
        earnedDate: Math.random() > 0.8 ? new Date().toISOString() : undefined,
        expiryDate: Math.random() > 0.8 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        verificationCode: Math.random() > 0.8 ? `BERRY-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined
      }));

      res.json(providerCertifications);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      res.status(500).json({ message: 'Failed to fetch certifications' });
    }
  });

  // Update module progress
  app.put('/api/training/modules/:moduleId/progress', async (req, res) => {
    try {
      const { moduleId } = req.params;
      const { progress, completed, providerId } = req.body;

      // Update training progress in storage
      // This would typically update a training_progress table
      console.log(`Updating module ${moduleId} progress: ${progress}% (${completed ? 'completed' : 'in progress'}) for provider ${providerId}`);

      // Calculate social score bonus
      const pointsEarned = completed ? 50 : Math.floor(progress / 10) * 5;
      
      res.json({ 
        success: true, 
        pointsEarned,
        message: completed ? 'Module completed!' : 'Progress saved'
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ message: 'Failed to update progress' });
    }
  });

  // Complete exercise
  app.post('/api/training/exercises/:exerciseId/complete', async (req, res) => {
    try {
      const { exerciseId } = req.params;
      const { moduleId, providerId } = req.body;

      console.log(`Exercise ${exerciseId} completed for provider ${providerId} in module ${moduleId}`);

      // Award points for exercise completion
      const pointsEarned = 25;
      
      res.json({ 
        success: true, 
        pointsEarned,
        message: 'Exercise completed! Points awarded.'
      });
    } catch (error) {
      console.error('Error completing exercise:', error);
      res.status(500).json({ message: 'Failed to complete exercise' });
    }
  });

  // Submit quiz
  app.post('/api/training/quiz/:quizId/submit', async (req, res) => {
    try {
      const { quizId } = req.params;
      const { answers, providerId } = req.body;

      // Calculate quiz score (simplified)
      const correctAnswers = answers.filter((answer: number, index: number) => answer === 1).length;
      const score = Math.floor((correctAnswers / answers.length) * 100);
      const passed = score >= 80;

      console.log(`Quiz ${quizId} submitted by provider ${providerId}: ${score}% (${passed ? 'PASSED' : 'FAILED'})`);

      // Award points for passing
      const pointsEarned = passed ? 75 : 25;

      res.json({ 
        score,
        passed,
        pointsEarned,
        message: passed ? 'Congratulations! Quiz passed.' : 'Quiz failed. Please review and try again.'
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      res.status(500).json({ message: 'Failed to submit quiz' });
    }
  });

  // Get provider social score (real data calculation, requires authentication)
  app.get('/api/providers/:providerId/social-score', authenticateToken, async (req: any, res) => {
    try {
      const { providerId } = req.params;
      
      // Get real training progress data
      const trainingProgress = await storage.getProviderTrainingProgress(providerId);
      const certifications = await storage.getProviderCertifications(providerId);
      const assessmentResults = await storage.getProviderAssessmentResults(providerId);
      
      // Calculate social score based on real factors
      const baseScore = 500; // Starting score for all providers
      
      // Training bonus: 10 points per completed module
      const completedModules = trainingProgress.filter(p => p.completedAt !== null).length;
      const trainingBonus = completedModules * 10;
      
      // Certification bonus: 50 points per valid certification
      const validCertifications = certifications.filter(c => 
        !c.expiresAt || new Date(c.expiresAt) > new Date()
      ).length;
      const certificationBonus = validCertifications * 50;
      
      // Assessment bonus: Average score * 2 (max 200 points)
      const avgAssessmentScore = assessmentResults.length > 0 
        ? assessmentResults.reduce((sum, r) => sum + r.score, 0) / assessmentResults.length
        : 0;
      const assessmentBonus = Math.min(avgAssessmentScore * 2, 200);
      
      const totalScore = baseScore + trainingBonus + certificationBonus + assessmentBonus;
      
      // Calculate queue priority bonus (higher score = better queue position)
      const queueBonus = Math.min(Math.floor(totalScore / 50), 25); // Max 25% bonus
      
      // Determine tier based on score
      const tier = totalScore > 1000 ? 'Gold' : totalScore > 800 ? 'Silver' : 'Bronze';
      
      res.json({
        score: totalScore,
        baseScore,
        trainingBonus,
        certificationBonus,
        assessmentBonus,
        queueBonus,
        tier,
        completedModules,
        validCertifications,
        avgAssessmentScore: Math.round(avgAssessmentScore * 10) / 10
      });
    } catch (error) {
      console.error('Error calculating social score:', error);
      res.status(500).json({ message: 'Failed to calculate social score' });
    }
  });

  // Get training leaderboard
  app.get('/api/training/leaderboard', async (req, res) => {
    try {
      const { category } = req.query;
      
      // Sample leaderboard data
      const leaderboard = [
        { providerId: 'p1', name: 'Sarah Johnson', score: 1250, modules: 24, category: 'House Cleaning' },
        { providerId: 'p2', name: 'Michael Chen', score: 1180, modules: 22, category: 'Plumbing' },
        { providerId: 'p3', name: 'Emma Wilson', score: 1150, modules: 20, category: 'Chef & Catering' },
        { providerId: 'p4', name: 'David Brown', score: 1100, modules: 18, category: 'Garden Care' },
        { providerId: 'p5', name: 'Lisa Garcia', score: 1050, modules: 16, category: 'Electrical' }
      ];

      const filteredBoard = category && category !== 'all' 
        ? leaderboard.filter(p => p.category === category)
        : leaderboard;

      res.json(filteredBoard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
  });
}