db = db.getSiblingDB('student-placement');

// Add more test students
db.students.insertMany([
  {
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    department: "Cybersecurity",
    graduationYear: 2025,
    skills: [
      { name: "Network Security", level: "advanced", yearsOfExperience: 3 },
      { name: "Python", level: "intermediate", yearsOfExperience: 2 }
    ],
    matchScore: 82,
    status: "training",
    createdAt: new Date()
  },
  {
    name: "James Wilson",
    email: "james.wilson@example.com",
    department: "Computer Science",
    graduationYear: 2024,
    skills: [
      { name: "Java", level: "advanced", yearsOfExperience: 3 },
      { name: "Spring Boot", level: "intermediate", yearsOfExperience: 2 }
    ],
    matchScore: 76,
    status: "training",
    createdAt: new Date()
  }
]);

// Add more jobs
db.jobs.insertMany([
  {
    title: "Security Analyst",
    company: "AWS",
    location: "Seattle, WA",
    remote: true,
    salary: { min: 120000, max: 180000, currency: "USD" },
    skills: ["Network Security", "AWS", "Python"],
    type: "fulltime",
    active: true,
    postedDate: new Date()
  },
  {
    title: "DevOps Engineer",
    company: "Netflix",
    location: "Los Gatos, CA",
    remote: false,
    salary: { min: 160000, max: 230000, currency: "USD" },
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    type: "fulltime",
    active: true,
    postedDate: new Date()
  }
]);

print("Test data added successfully!");