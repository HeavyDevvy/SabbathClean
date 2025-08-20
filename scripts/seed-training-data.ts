import { db } from "../server/db";
import { 
  trainingModules, 
  certifications, 
  skillAssessments,
  providerTrainingProgress,
  providerCertifications,
  serviceProviders
} from "../shared/schema";

async function seedTrainingData() {
  console.log("Seeding training system data...");

  // Training Modules for Chef & Catering
  const modules = [
    {
      id: "module-chef-001",
      title: "Food Safety & Hygiene Fundamentals",
      description: "Essential food safety principles, HACCP guidelines, and personal hygiene standards for professional chefs.",
      category: "safety",
      serviceType: "chef-catering",
      difficulty: "beginner",
      estimatedDuration: 45,
      content: {
        sections: [
          {
            title: "Introduction to Food Safety",
            videos: ["food-safety-intro.mp4"],
            documents: ["HACCP-guide.pdf"],
            duration: 15
          },
          {
            title: "Personal Hygiene Standards",
            videos: ["hygiene-standards.mp4"],
            exercises: ["hygiene-checklist.pdf"],
            duration: 15
          },
          {
            title: "Temperature Control & Storage",
            videos: ["temperature-control.mp4"],
            quiz: "temperature-quiz",
            duration: 15
          }
        ]
      },
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
      content: {
        sections: [
          {
            title: "Knife Types & Selection",
            videos: ["knife-types.mp4"],
            duration: 20
          },
          {
            title: "Basic Cutting Techniques",
            videos: ["cutting-techniques.mp4"],
            practicalExercises: ["julienne-practice", "brunoise-practice"],
            duration: 25
          },
          {
            title: "Kitchen Safety with Knives",
            videos: ["knife-safety.mp4"],
            duration: 15
          }
        ]
      },
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
      content: {
        sections: [
          {
            title: "South African Traditional Dishes",
            videos: ["sa-traditional-cooking.mp4"],
            recipes: ["bobotie-recipe.pdf", "potjiekos-guide.pdf"],
            duration: 25
          },
          {
            title: "West African Flavors",
            videos: ["west-african-spices.mp4"],
            recipes: ["jollof-rice.pdf", "fufu-preparation.pdf"],
            duration: 25
          },
          {
            title: "East African Specialties",
            videos: ["east-african-cuisine.mp4"],
            recipes: ["injera-bread.pdf", "berbere-spice.pdf"],
            duration: 25
          }
        ]
      },
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
      content: {
        sections: [
          {
            title: "Client Communication",
            videos: ["client-communication.mp4"],
            exercises: ["communication-scenarios.pdf"],
            duration: 20
          },
          {
            title: "Dietary Restrictions & Allergies",
            videos: ["dietary-management.mp4"],
            documents: ["allergy-guide.pdf"],
            duration: 15
          },
          {
            title: "Professional Presentation",
            videos: ["professional-service.mp4"],
            duration: 15
          }
        ]
      },
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
      content: {
        sections: [
          {
            title: "Plating Fundamentals",
            videos: ["plating-basics.mp4"],
            duration: 30
          },
          {
            title: "Color Theory & Visual Appeal",
            videos: ["color-theory.mp4"],
            practicalExercises: ["plating-practice"],
            duration: 30
          },
          {
            title: "Fine Dining Presentation",
            videos: ["fine-dining-plating.mp4"],
            duration: 30
          }
        ]
      },
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
      content: {
        sections: [
          {
            title: "Menu Development Process",
            videos: ["menu-development.mp4"],
            templates: ["menu-planning-template.xlsx"],
            duration: 25
          },
          {
            title: "Food Cost Analysis",
            videos: ["cost-analysis.mp4"],
            tools: ["cost-calculator.xlsx"],
            duration: 30
          },
          {
            title: "Seasonal Menu Planning",
            videos: ["seasonal-planning.mp4"],
            duration: 25
          }
        ]
      },
      prerequisites: ["module-chef-004"],
      isRequired: false,
      isActive: true
    }
  ];

  // Insert training modules
  for (const module of modules) {
    await db.insert(trainingModules).values(module).onConflictDoNothing();
  }

  // Certifications
  const certs = [
    {
      id: "cert-chef-001",
      name: "Certified Professional Chef",
      description: "Complete certification covering all fundamental aspects of professional cooking and food safety.",
      serviceType: "chef-catering",
      level: "intermediate",
      requiredModules: ["module-chef-001", "module-chef-002", "module-chef-004"],
      validityPeriod: 24,
      badgeIcon: "chef-hat-gold",
      isActive: true
    },
    {
      id: "cert-chef-002",
      name: "African Cuisine Specialist",
      description: "Specialized certification in traditional and modern African cooking techniques and flavors.",
      serviceType: "chef-catering",
      level: "advanced",
      requiredModules: ["module-chef-001", "module-chef-002", "module-chef-003", "module-chef-004"],
      validityPeriod: 18,
      badgeIcon: "african-cuisine-badge",
      isActive: true
    },
    {
      id: "cert-chef-003",
      name: "Master Culinary Artist",
      description: "Elite certification for master chefs with advanced plating, menu planning, and business skills.",
      serviceType: "chef-catering",
      level: "expert",
      requiredModules: ["module-chef-001", "module-chef-002", "module-chef-004", "module-chef-005", "module-chef-006"],
      validityPeriod: 36,
      badgeIcon: "master-chef-crown",
      isActive: true
    }
  ];

  // Insert certifications
  for (const cert of certs) {
    await db.insert(certifications).values(cert).onConflictDoNothing();
  }

  // Skill Assessments
  const assessments = [
    {
      id: "assessment-chef-001",
      title: "Food Safety Knowledge Test",
      description: "Comprehensive assessment of food safety principles, HACCP guidelines, and hygiene standards.",
      serviceType: "chef-catering",
      assessmentType: "quiz",
      questions: {
        questions: [
          {
            id: 1,
            type: "multiple-choice",
            question: "What is the safe internal temperature for cooking chicken?",
            options: ["60°C", "65°C", "74°C", "80°C"],
            correctAnswer: 2,
            explanation: "Chicken must reach 74°C internal temperature to kill harmful bacteria."
          },
          {
            id: 2,
            type: "multiple-choice", 
            question: "How long can prepared food be safely stored at room temperature?",
            options: ["1 hour", "2 hours", "3 hours", "4 hours"],
            correctAnswer: 1,
            explanation: "Food should not be left at room temperature for more than 2 hours."
          },
          {
            id: 3,
            type: "true-false",
            question: "Cross-contamination can occur between raw and cooked foods.",
            correctAnswer: true,
            explanation: "Raw foods can contaminate cooked foods through contact with surfaces or utensils."
          }
        ]
      },
      passingScore: 80,
      timeLimit: 30,
      maxAttempts: 3,
      isActive: true
    },
    {
      id: "assessment-chef-002",
      title: "Knife Skills Practical Assessment",
      description: "Hands-on evaluation of knife handling, cutting techniques, and kitchen safety practices.",
      serviceType: "chef-catering",
      assessmentType: "practical",
      questions: {
        tasks: [
          {
            id: 1,
            task: "Julienne Cut Demonstration",
            description: "Prepare julienne cuts of carrots within 5 minutes",
            timeLimit: 5,
            criteria: ["Uniform size", "Clean cuts", "Proper technique", "Safety practices"]
          },
          {
            id: 2, 
            task: "Brunoise Dice Technique",
            description: "Demonstrate brunoise dice technique with onions",
            timeLimit: 7,
            criteria: ["Precise cuts", "Consistent size", "Efficient workflow", "Knife control"]
          }
        ]
      },
      passingScore: 75,
      timeLimit: 15,
      maxAttempts: 2,
      isActive: true
    },
    {
      id: "assessment-chef-003",
      title: "Menu Planning Portfolio",
      description: "Create and present a complete menu with cost analysis and seasonal considerations.",
      serviceType: "chef-catering",
      assessmentType: "portfolio",
      questions: {
        requirements: [
          {
            id: 1,
            requirement: "Three-Course Menu Design",
            description: "Design a balanced three-course menu for 20 people",
            deliverables: ["Menu card", "Recipe specifications", "Ingredient list"]
          },
          {
            id: 2,
            requirement: "Cost Analysis Report", 
            description: "Provide detailed cost breakdown and pricing strategy",
            deliverables: ["Cost calculations", "Profit margin analysis", "Competitive pricing"]
          },
          {
            id: 3,
            requirement: "Dietary Accommodation Plan",
            description: "Include options for common dietary restrictions",
            deliverables: ["Vegetarian alternatives", "Allergy considerations", "Nutritional information"]
          }
        ]
      },
      passingScore: 85,
      timeLimit: null,
      maxAttempts: 1,
      isActive: true
    }
  ];

  // Insert skill assessments
  for (const assessment of assessments) {
    await db.insert(skillAssessments).values(assessment).onConflictDoNothing();
  }

  // Check existing providers first
  const existingProviders = await db.select({ id: serviceProviders.id }).from(serviceProviders);
  console.log(`Found ${existingProviders.length} existing providers in database`);
  
  // Only seed progress if we have providers in database
  if (existingProviders.length === 0) {
    console.log("No providers found in database - skipping progress seeding");
    console.log("Training system data seeded successfully!");
    console.log(`- ${modules.length} training modules created`);
    console.log(`- ${certs.length} certifications created`);
    console.log(`- ${assessments.length} skill assessments created`);
    console.log("- Provider progress will be created when using the application");
    return;
  }

  // Seed some sample progress for existing provider (Sarah Johnson - provider-3)
  const sampleProgress = [
    {
      providerId: existingProviders[0].id, // Use first available provider
      moduleId: "module-chef-001",
      status: "completed",
      startedAt: new Date("2024-07-15"),
      completedAt: new Date("2024-07-16"),
      progress: 100,
      timeSpent: 45,
      attempts: 1,
      lastAccessedAt: new Date("2024-07-16")
    },
    {
      providerId: existingProviders[0].id, 
      moduleId: "module-chef-002",
      status: "completed",
      startedAt: new Date("2024-07-17"),
      completedAt: new Date("2024-07-18"),
      progress: 100,
      timeSpent: 58,
      attempts: 1,
      lastAccessedAt: new Date("2024-07-18")
    },
    {
      providerId: existingProviders[0].id,
      moduleId: "module-chef-003",
      status: "in_progress",
      startedAt: new Date("2024-07-20"),
      progress: 65,
      timeSpent: 35,
      attempts: 1,
      lastAccessedAt: new Date("2024-08-20")
    },
    {
      providerId: existingProviders[0].id,
      moduleId: "module-chef-004",
      status: "completed",
      startedAt: new Date("2024-07-19"),
      completedAt: new Date("2024-07-19"),
      progress: 100,
      timeSpent: 50,
      attempts: 1,
      lastAccessedAt: new Date("2024-07-19")
    }
  ];

  // Insert sample progress
  for (const progress of sampleProgress) {
    await db.insert(providerTrainingProgress).values(progress).onConflictDoNothing();
  }

  // Award certification for provider based on completed modules
  const certification = {
    providerId: existingProviders[0].id,
    certificationId: "cert-chef-001", 
    status: "earned",
    earnedAt: new Date("2024-07-19"),
    expiresAt: new Date("2026-07-19"),
    certificateNumber: "CERT_CPC_240719_001",
    verificationCode: "VER_240719"
  };

  await db.insert(providerCertifications).values(certification).onConflictDoNothing();

  console.log("Training system data seeded successfully!");
  console.log(`- ${modules.length} training modules created`);
  console.log(`- ${certs.length} certifications created`);
  console.log(`- ${assessments.length} skill assessments created`);
  console.log(`- ${sampleProgress.length} sample progress records created`);
  console.log(`- 1 sample certification awarded`);
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTrainingData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding training data:", error);
      process.exit(1);
    });
}

export { seedTrainingData };